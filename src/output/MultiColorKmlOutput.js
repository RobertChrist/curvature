var KmlOutput = require('./KmlOutput');
var util = require('util');

var MultiColorKmlOutput = module.exports = function (KmlOutput) {
	function filenameSuffix () {
		return '.multicolor';
	}
	
	this.writeRoads = function (roads) {
		var result;

		result += '	<Style id="folderStyle">\n';
		result += '		<ListStyle>\n';
		result += '			<listItemType>checkHideChildren</listItemType>\n';
		result += '		</ListStyle>\n';
		result += '	</Style>\n';
		
		for (var i = 0, j = roads.length; i < j; i++) {
			var road = roads[i];

			var tempResult = '	<Folder>\n\
									<styleUrl>#folderStyle</styleUrl>\n\
									<name>' + escape(road['name']) + '</name>\n\
									<description>' + this.getDescription(road) + '</description>\n';
			
			var currentCurvatureLevel = 0;

			var index = 0;
			var segments = road['segments'];
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
			
				if (segment['curvature_level'] != currentCurvatureLevel || !index) {
					currentCurvatureLevel = segment['curvatureLevel'];
					
					// Close the open LineString
					if (index)
						tempResult += '</coordinates>\n</LineString>\n</Placemark>\n';

					// Start a new linestring for this level
					tempResult += '		<Placemark>\n\
											<styleUrl>#lineStyle' + currentCurvatureLevel + '</styleUrl>\n\
											<LineString>\n\
											<tessellate>1</tessellate>\n\
												<coordinates>';

					tempResult += "%.6f,%6f " %(segment['start'][1], segment['start'][0]);
				}

				tempResult += "%.6f,%6f " %(segment['end'][1], segment['end'][0]);
				index++;
			}

			if (index) {
				tempReuslt += '</coordinates>\n</LineString>\n</Placemark>\n';
			}

			result += tempReuslt + '	</Folder>\n';
		}

		return result;
	};
};

util.inherits(MultiColorKmlOutput, KmlOutput);