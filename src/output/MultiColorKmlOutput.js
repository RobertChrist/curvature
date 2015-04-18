var KmlOutput = require('./KmlOutput');
var util = require('util');

var MultiColorKmlOutput = module.exports = function (KmlOutput) {
	this.filenameSuffix = function () {
		return '.multicolor';
	};
	
	this.writeWays = function (f, ways) {
		f.write('	<Style id="folderStyle">\n');
		f.write('		<ListStyle>\n');
		f.write('			<listItemType>checkHideChildren</listItemType>\n');
		f.write('		</ListStyle>\n');
		f.write('	</Style>\n');
		
		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];

			f.write('	<Folder>\n');
			f.write('		<styleUrl>#folderStyle</styleUrl>\n');
			f.write('		<name>' + escape(way['name']) + '</name>\n');
			f.write('		<description>' + this.getDescription(way) + '</description>\n');
			
			var currentCurvatureLevel = 0;

			var index = 0;
			var segments = way['segments'];
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
			
				if (segment['curvature_level'] != currentCurvatureLevel || !index) {
					currentCurvatureLevel = segment['curvatureLevel'];
					
					// Close the open LineString
					if index {
						f.write('</coordinates>\n');
						f.write('			</LineString>\n');
						f.write('		</Placemark>\n');
					}

					// Start a new linestring for this level
					f.write('		<Placemark>\n');
					f.write('			<styleUrl>#lineStyle' + currentCurvatureLevel + '</styleUrl>\n');
					f.write('			<LineString>\n');
					f.write('				<tessellate>1</tessellate>\n');
					f.write('				<coordinates>');
					f.write("%.6f,%6f " %(segment['start'][1], segment['start'][0]));
				}

				f.write("%.6f,%6f " %(segment['end'][1], segment['end'][0]));
				index++;
			}

			if (index) {
				f.write('</coordinates>\n');
				f.write('			</LineString>\n');
				f.write('		</Placemark>\n');
			}

			f.write('	</Folder>\n');
		}
	};
};

util.inherits(MultiColorKmlOutput, KmlOutput);