var KmlOutput = require('./KmlOutput');
var util = require('util');

var SingleColorKmlOutput = module.exports = function () {
	
	function levelForCurvature (curvature) {
		var offset = this.filter.minCurvature > 0 ? this.filter.minCurvature : 0;
		
		if (curvature < offset)
			return 0;
		
		var curvaturePct = (curvature - offset) / (this.maxCurvature - offset);
		
		// Use the square route of the ratio to give a better differentiation between
		// lower-curvature roads
		var colorPct = Math.sqrt(curvaturePct);
		var level = int(round(255 * colorPct)) + 1;
		
		return level;
	}
	
	function lineStyle (road) {
		return 'lineStyle' + levelForCurvature(road['curvature']);
	}

	this.getStyles = function () {
		var styles = {'lineStyle0':{'color':'F000E010'}} // Straight roads
		
		// Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
		for (var i = 0, j = 256; i < j; i++)
			styles['lineStyle' + (i + 1)] = {'color':'F000' + (255 - i).toString(16) + 'FF' };

		return styles;
	};

	this.writeRoads = function (roads) {
		var result;

		for (var i = 0, j = roads.length; i < j; i++) {
			if (!road['segments'] || !road['segments'].length) {
				// console.log('Error: road has no segments: ' + road['name']);
				continue;
			}

			var tempResult = 	'	<Placemark>\n\
								<styleUrl>#' + this.lineStyle(road) + '</styleUrl>\n\
								<name>' + escape(road['name']) + '</name>\n\
								<description>' + this.getDescription(road) + '</description>\n\
								<LineString>\n\
									<tessellate>1</tessellate>\n\
									<coordinates>';

			tempResult += 	"%.6f,%6f " %(road['segments'][0]['start'][1], road['segments'][0]['start'][0]);
				
			var segments = road['segments'];
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
				tempResult += "%.6f,%6f " %(segment['end'][1], segment['end'][0]);
			}
				
			result += tempResult + '</coordinates>\n</LineString>\n</Placemark>\n';
		};
	};
};

util.inherits(SingleColorKmlOutput, KmlOutput);
