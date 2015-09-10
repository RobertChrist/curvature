var _util = require('util');
var KmlOutput = require('./KmlOutput');


/* Responsible for writing a single-colored kml file to disk, where
 * variance within the color corresponds to the way's curvieness.
 *
 * @class
 * @augments KmlOutput
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
var SingleColorKmlOutput = module.exports = function (defaultFilter) {
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
		
		var curvaturePct = (curvature - offset) / (_self.maxCurvature - offset);
		
		// Use the square route of the ratio to give a better differentiation between
		// lower-curvature ways
		var colorPct = Math.sqrt(curvaturePct);
		var level = Math.round(255 * colorPct) + 1;
		
		return level;
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

			tempResult += _util.format('%d,%d ', way.segments[0].start.lon.toFixed(6), way.segments[0].start.lat.toFixed(6));
				
			var segments = way.segments;
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
				tempResult += _util.format("%d,%d ", segment.end.lon.toFixed(6), segment.end.lat.toFixed(6));
			}
				
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
	var styles = { 'lineStyle0':{'color':'F000E010'} }; // Straight ways
	
	// Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
	for (var i = 0, j = 256; i < j; i++) {
		var val = (255 - i).toString(16).toUpperCase();
		if (val.length < 2)
			val = '0' + val;

		styles['lineStyle' + (i + 1)] = {'color':'F000' + val + 'FF' };
	}

	return styles;
};