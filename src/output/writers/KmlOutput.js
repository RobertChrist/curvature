var _util = require('util');
var _fs = require('fs');
var OutputBase = require('./OutputBase');

/* Abstract class for writing a kml output file to disk. 
 *
 * @class
 * @abstract
 * @augments OutputBase
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
var KmlOutput = module.exports = function (defaultFilter) {
    KmlOutput.super_.call(this, defaultFilter);
    
    var _self = this;

	this.units = 'mi';

	/* Returns the string for the first lines of the kml document. 
	 *
	 * @returns {string} The opening tags of the kml document.
	 */
	function writeDocStart () {
        return '' +
        '<?xml version="1.0" encoding="UTF-8"?>\n' + 
		'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
		'<Document>\n';
	}

	/* Converts the style object parameter into a kml formatted string.
	 * 
	 * @param {object} styles - { "styleName": { "color": hexString, "width": int }}
	 * @returns {string} the kml serialized version of the styles object.
	 */
	function writeStyles (styles) {
		var result = '';

	    Object.keys(styles).forEach(function(key) {
	        var style = styles[key];
	        
			if (!style.width)
				style.width = 4;

			if (!style.color)
				style.color = 'F0FFFFFF';

			result += '	<Style id="' + key + '">\n';
			result += '		<LineStyle>\n';
			result += '			<color>' + style.color + '</color>\n';
			result += '			<width>' + style.width + '</width>\n';
			result += '		</LineStyle>\n';
            result += '	</Style>\n';
	    });

		return result;
	}
    
    /* @returns {string} Returns a string that represents the opening section of the kml document
     * ie, the document headers and stle section, as a string.
     */
    function writeHeader() {
        return writeDocStart() + writeStyles(_self.getStyles());
    }

    /* @returns {string} The closing tags for the kml document. */
	function writeFooter () {
		return '</Document>\n' +
			   '</kml>\n';
	}

	/* Outputs a string for bounding box information.
	 * This can allow other programs to generate region aware
	 * compilations of these files.
	 * @returns {string} - the kml string.
	 */
	function writeRegion (ways) {
		var minLat = ways[0].segments[0].start[0];
		var maxLat = ways[0].segments[0].start[0];
		var minLon = ways[0].segments[0].start[1];
		var maxLon = ways[0].segments[0].start[1];

		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];

			var wayMaxLat = getWayMaxMinLatLon(way, 'maxLat');
			var wayMinLat = getWayMaxMinLatLon(way, 'minLat');
			var wayMaxLon = getWayMaxMinLatLon(way, 'maxLon');
			var wayMinLon = getWayMaxMinLatLon(way, 'minLon');

			if (wayMaxLat > maxLat) maxLat = wayMaxLat;
			if (wayMinLat < minLat) minLat = wayMinLat;
			if (wayMaxLon > maxLon) maxLon = wayMaxLon;
			if (wayMinLon < minLon) minLon = wayMinLon;
		}

			return	'	<!--\n' +
					'	<Region>\n' +
					'	<!--\n' +
					'	<Region>\n' +
					'		<LatLonBox>\n' +
		_util.format('			<north>%s</north>\n', maxLat) +
		_util.format('			<south>%.6f</south>\n', minLat) +
// Note that this won't work for regions crossing longitude 180, but this
// should only affect the Russian asian file
		_util.format('			<east>%.6f</east>\n', maxLon) +
		_util.format('			<west>%.6f</west>\n', minLon) +
					'		</LatLonBox>\n' +
					'	</Region>\n' +
					'	-->\n';
	}

	/* Gets the min/max lat/lon value from the way.
	 * @param {way} - The way.
	 * @param {string} - The property.  Valid values are only: 'minLat', 'maxLat', 'minLon', 'maxLon' 
	 * @returns {todo} - the min/max lat/lon value,
	 */
	function getWayMaxMinLatLon(way, property) {
		if (!way[property] && way[property] !== 0)
			storeWayRegion(way);

		return way[property];
	}
	
	/* Sets the min/max lat/lon properties on the passed in way */
	function storeWayRegion(way) {
		way.maxLat = way.segments[0].start[0];
		way.minLat = way.segments[0].start[0];
		way.maxLon = way.segments[0].start[1];
		way.minLon = way.segments[0].start[1];

		for (var i = 0, j = way.segments.length; i < j; i++) {
			var segment = way.segments[i];

			if (segment.end[0] > way.maxLat) way.maxLat = segment.end[0];
			if (segment.end[0] < way.minLat) way.minLat = segment.end[0];
			if (segment.end[1] > way.maxLon) way.maxLon = segment.end[1];
			if (segment.end[1] < way.minLon) way.minLon = segment.end[1];
		}
	}

	/* @returns {string} - the filename of the kml file that should be written to disk. */
	function getFilename (basename) {
		var filename = _util.format(basename + '.c_%d', _self.filter.minCurvature);

		if (_self.filter.maxCurvature > 0)
			filename += _util.format('-%d', Math.round(_self.filter.maxCurvature));

		if (_self.filter.minLength !== 1 || _self.filter.maxLength > 0)
			filename += _util.format('.l_%d', Math.round(_self.filter.minLength));

		if (_self.filter.maxLength > 0)
			filename += _util.format('-%d', Math.round(this.filter.maxLength));

		filename += _self.filenameSuffix() + '.kml';
		return filename;
    }
    
    /* Each way in the kml file has a description setting, that is configured
	 * differently depending on application settings.  This method takes in a way
	 * object, and returns the correct description string.
	 *
	 * This method is intended to be called from within writeWays on child instances.
	 *
	 * @param {object} way - The way that should be described.
	 * @returns {string} - The string description of the way.
     */
	this.getDescription = function (way) {
		var divideBy = this.units === 'km' ? 1000 : 1609;

		return _util.format('Curvature: %d\nDistance: %d km\nType: %s\nSurface: %s', way.curvature.toFixed(2), (way.length / divideBy).toFixed(2), way.type, way.surface);
	};

	/* Takes in an array of ways, and returns the serialized string version of the object in kml format.
	 *
	 * @abstract
	 *
	 * @param {[way]} ways - The list of ways to save to the file.
	 * @returns {string} - The string representation of the ways in kml format.
	 */
	this.writeWays = function (ways) {};

	/* Writes the input ways into a kml file in disk, with a name
	 * based on the basename, to the specified path.
	 * 
	 * @param {[way]} ways - The ways to save into the kml file.
	 * @param {string} path - The directory into which the kml file should be saved.
	 * @param {string} basename - The saved kml file will have a name based on this string.
	 */
	this.write = function (ways, path, basename) {
		ways = this.filterAndSort(ways);
		ways.reverse();
		
		var kmlDoc = writeHeader();
		kmlDoc += writeRegion(ways);
		kmlDoc += this.writeWays(ways);
		kmlDoc += writeFooter();
		
		_fs.writeFileSync(path + '/' + getFilename(basename), kmlDoc);
    };
};

/* This class inherits from OutputBase */
_util.inherits(KmlOutput, OutputBase);

/* Returns a string that should be appended to the end of all outputted kml files.
 * 
 * @abstract (optional)
 *
 * @returns {string} filename suffix string.
 */
KmlOutput.prototype.filenameSuffix = function () {
    return '';
};

/* Returns the style object that should be used in the output kml file.
 *
 * @abstract (optional)
 *
 * @returns {object} { "lineStyle" + int.toString() : { 'color': hexString, 'width (optional)': int }}
 */
KmlOutput.prototype.getStyles = function () {
    return {
        'lineStyle0': { 'color': 'F000E010' }, // Straight ways
        'lineStyle1': { 'color': 'F000FFFF' }, // Level 1 turns
        'lineStyle2': { 'color': 'F000AAFF' }, // Level 2 turns
        'lineStyle3': { 'color': 'F00055FF' }, // Level 3 turns
        'lineStyle4': { 'color': 'F00000FF' },  // Level 4 turns
        'eliminated': { 'color': 'F0000000' }	// Eliminated segments
    };
};