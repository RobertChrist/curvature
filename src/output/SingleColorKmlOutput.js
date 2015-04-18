var KmlOutput = require('./KmlOutput');
var util = require('util');

var SingleColorKmlOutput = module.exports = function () {
	
	this.getStyles = function () {
		var styles = {'lineStyle0':{'color':'F000E010'}} // Straight roads
		
		// Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
		for (var i = 0, j = 256; i < j; i++)
			styles['lineStyle' + (i + 1)] = {'color':'F000' + (255 - i).toString(16) + 'FF' };

		return styles
	};

	this.writeWays = function (f, ways) {

		for (var i = 0, j = ways.length; i < j; i++) {
			
			if (!way['segments'] || !way['segments'].length) {
				// console.log('Error: way has no segments: ' + way['name']);
				continue;
			}

			f.write('	<Placemark>\n');
			f.write('		<styleUrl>#' + this.lineStyle(way) + '</styleUrl>\n');
			f.write('		<name>' + escape(way['name']) + '</name>\n');
			f.write('		<description>' + this.getDescription(way) + '</description>\n');
			f.write('		<LineString>\n');
			f.write('			<tessellate>1</tessellate>\n');
			f.write('			<coordinates>');
			f.write("%.6f,%6f " %(way['segments'][0]['start'][1], way['segments'][0]['start'][0]));
				
			var segments = way['segments'];
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
				f.write("%.6f,%6f " %(segment['end'][1], segment['end'][0]));
			}
				
			f.write('</coordinates>\n');
			f.write('		</LineString>\n');
			f.write('	</Placemark>\n');
		};
	};
	
	this.levelForCurvature = function (curvature) {
		var offset = this.filter.minCurvature > 0 ? this.filter.minCurvature : 0;
		
		if (curvature < offset)
			return 0;
		
		var curvaturePct = (curvature - offset) / (this.maxCurvature - offset);
		
		// Use the square route of the ratio to give a better differentiation between
		// lower-curvature ways
		var colorPct = Math.sqrt(curvaturePct);
		var level = int(round(255 * colorPct)) + 1;
		
		return level;
	};
	
	this.lineStyle = function (way) {
		return 'lineStyle' + this.levelForCurvature(way['curvature']);
	};
};

util.inherits(SingleColorKmlOutput, KmlOutput);
