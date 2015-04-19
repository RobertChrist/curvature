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

	this.writeRoads = function (f, roads) {

		for (var i = 0, j = roads.length; i < j; i++) {
			
			if (!road['segments'] || !road['segments'].length) {
				// console.log('Error: road has no segments: ' + road['name']);
				continue;
			}

			f.write('	<Placemark>\n');
			f.write('		<styleUrl>#' + this.lineStyle(road) + '</styleUrl>\n');
			f.write('		<name>' + escape(road['name']) + '</name>\n');
			f.write('		<description>' + this.getDescription(road) + '</description>\n');
			f.write('		<LineString>\n');
			f.write('			<tessellate>1</tessellate>\n');
			f.write('			<coordinates>');
			f.write("%.6f,%6f " %(road['segments'][0]['start'][1], road['segments'][0]['start'][0]));
				
			var segments = road['segments'];
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
				f.write("%.6f,%6f " %(segment['end'][1], segment['end'][0]));
			}
				
			f.write('</coordinates>\n');
			f.write('		</LineString>\n');
			f.write('	</Placemark>\n');
		};
	};
};

util.inherits(SingleColorKmlOutput, KmlOutput);
