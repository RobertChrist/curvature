var _util = require('util');
var _fs = require('fs');
var OutputBase = require('./OutputBase');

var KmlOutput = module.exports = function (defaultFilter) {
    KmlOutput.super_.call(this, defaultFilter);
    
    var _self = this;
	var _units = 'mi';

	function writeDocStart () {
		return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
		'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
		'<Document>\n';
	}

	function writeStyles (styles) {
		var result = '';

		for (var i = 0, j = styles.length; i < j; i++) {
			var style = styles[i];

			if (!style.width)
				style.width = 4;

			if (style.color)
				style.color = 'F0FFFFFF';

			result += '	<Style id="' + i + '">\n';
			result += '		<LineStyle>\n';
			result += '			<color>' + style.color + '</color>\n';
			result += '			<width>' + style.width + '</width>\n';
			result += '		</LineStyle>\n';
			result += '	</Style>\n';
		}

		return result;
	}
    
    function writeHeader() {
        return writeDocStart() + writeStyles(_self.getStyles());
    }

	function writeFooter () {
		return '</Document>\n' +
			   '</kml>\n';
	}

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
    
    function roundToTwoDecimals(num) {
        return Math.round(num * 100) / 100;
    }

	this.getDescription = function (way) {
		if (_units === 'km')
			return 'Curvature: %d\nDistance: %d km\nType: %s\nSurface: %s' % (roundToTwoDecimals(way.curvature), roundToTwoDecimals(way.length / 1000), way.type, way.surface);
		else
			return 'Curvature: %d\nDistance: %d mi\nType: %s\nSurface: %s' % (roundToTwoDecimals(way.curvature), roundToTwoDecimals(way.length / 1609), way.type, way.surface);
	};

	this.write = function (ways, path, basename) {
		ways = this.filterAndSort(ways);
		ways.reverse();
		
		var kmlDoc = writeHeader();
		kmlDoc += this.writeWays(ways);
		kmlDoc += writeFooter();
		
		_fs.writeFileSync(path + '/' + getFilename(basename), kmlDoc);
    };
};

_util.inherits(KmlOutput, OutputBase);

KmlOutput.prototype.filenameSuffix = function () {
    return '';
};

KmlOutput.prototype.getStyles = function () {
    return {
        'lineStyle0': { 'color': 'F000E010' }, // Straight ways
        'lineStyle1': { 'color': 'F000FFFF' }, // Level 1 turns
        'lineStyle2': { 'color': 'F000AAFF' }, // Level 2 turns
        'lineStyle3': { 'color': 'F00055FF' }, // Level 3 turns
        'lineStyle4': { 'color': 'F00000FF' }  // Level 4 turns
    };
};

