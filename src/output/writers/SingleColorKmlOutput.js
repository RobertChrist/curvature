var _util = require('util');
var KmlOutput = require('./KmlOutput');


/* Responsible for writing a single-colored kml file to disk, where
 * variance within the color corresponds to the way's curvieness.
 *
 * @class
 * @augments KmlOutput
 * @param {bool} relativeColor - colors in file (if colorize is false) should be relative to max in file, or absolute?
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
var SingleColorKmlOutput = module.exports = function (_relativeColor, defaultFilter) {
    SingleColorKmlOutput.super_.call(this, defaultFilter);

    var _self = this;
    var _allowWhitespaceRegex = new RegExp('%20', 'g');

    /* Returns a value between 1 and 256 that corresponds to the level of 
	 * curvature for the passed in argument as compared to the max curvature
	 * that will be written to this file, so that the single color for this kml 
	 * file can be shaded appropriately.
	 *
	 * @param {number} curvature - The curvature to get a shading level for .
	 * @returns {int} - A number between 1 and 256 that corresponds to the passed in argument.
     */
	function levelForCurvature (curvature) {
		var offset = _self.filter.minCurvature > 0 ? _self.filter.minCurvature : 0;

		if (curvature < offset)
			return 0;

		var curvaturePct;
		if (_relativeColor)
			curvaturePct = (curvature - offset) / (_self.maxCurvature - offset);
		else
			curvaturePct = Math.min((curvature - offset) / (40000 - offset), 1);

		// Map ratio to a logarithmic scale to give a better differentiation
		// between lower-curvature ways. 10,000 is max red.
		// y = 1-1/(10^(x*2))
		var colorPct = 1 - (1/Math.pow(10, curvaturePct * 2));

		return Math.round(510 * colorPct) + 1;
	}

	/* @returns {string} - A linestyle that should have a single color style associated with it. */
	function lineStyle (way) {
		return 'lineStyle' + levelForCurvature(way.curvature);
	}

    /* @inheritDoc
     * @augments writeWays on KmlOutput
     */
	this.writeWays = function (ways) {
	    var result = '';

		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];
			if (!way.segments || !way.segments.length) {
				// _logger.log('Error: way has no segments: ' + way['name']);
				continue;
			}

            var tempResult =    '	<Placemark>\n' +
								'		<styleUrl>#' + lineStyle(way) + '</styleUrl>\n' +
								'		<name>' + escape(way.name).replace(_allowWhitespaceRegex, ' ') + '</name>\n' +
								'		<description>' + _self.getDescription(way) + '</description>\n' +
								'		<LineString>\n' +
								'			<tessellate>1</tessellate>\n' +
								'			<coordinates>';

			tempResult += _self.writeSegments(way.segments)
				
			result += 	tempResult + 
						'</coordinates>\n' +
						'		</LineString>\n' +
						'	</Placemark>\n';
        }

	    return result;
	};
};

_util.inherits(SingleColorKmlOutput, KmlOutput);

/* @inheritDoc
 * @augments getStyles on KmlOutput
 */
SingleColorKmlOutput.prototype.getStyles = function () {
	function getIntAsBase16(i) {
		var val = (i).toString(16).toUpperCase();
		
		if (val.length < 2)
			val = '0' + val;

		return val;
	}

	var styles = { 'lineStyle0':{'color':'F000E010'} }; // Straight ways
	
	// Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
	for (var i = 0, j = 256; i < j; i++) {
		styles['lineStyle' + (i + 1)] = {'color':'F000' + getIntAsBase16(255 - i) + 'FF' };
	}

	// Add a style for each level in a gradient from red to magenta (0000FF - FF00FF)
	for (var i = 1, j = 256; i < j; i++) {
		styles['lineStyle' + (i + 256).toString()] = { 'color': 'F0' + getIntAsBase16(i) + '00FF' };
	}

	return styles;
};

/* Returns the kml file serialized string for the passed in segments. 
 * 
 * @abstract (optional)
 */
SingleColorKmlOutput.prototype.writeSegments = function (segments) {
	var tempResult = _util.format('%s,%s ', segments[0].start.lon.toFixed(6), segments[0].start.lat.toFixed(6));
			
	for (var k = 0, l = segments.length; k < l; k++) {
		var segment = segments[k];
		tempResult += _util.format("%s,%s ", segment.end.lon.toFixed(6), segment.end.lat.toFixed(6));
	}

	return tempResult;
};