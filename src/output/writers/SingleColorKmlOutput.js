var _util = require('util');
var KmlOutput = require('./KmlOutput');

var SingleColorKmlOutput = module.exports = function (defaultFilter) {
    SingleColorKmlOutput.super_.call(this, defaultFilter);

    var _self = this;
    var _allowWhitespaceRegex = new RegExp('%20', 'g');

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
	
	function lineStyle (way) {
		return 'lineStyle' + levelForCurvature(way.curvature);
	}

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

SingleColorKmlOutput.prototype.getStyles = function () {
	var styles = { 'lineStyle0':{'color':'F000E010'} }; // Straight ways
	
	// Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
	for (var i = 0, j = 256; i < j; i++)
		styles['lineStyle' + (i + 1)] = {'color':'F000' + (255 - i).toString(16) + 'FF' };

	return styles;
};