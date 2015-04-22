var _util = require('util');
var KmlOutput = require('./KmlOutput');

var MultiColorKmlOutput = module.exports = function (defaultFilter) {
    MultiColorKmlOutput.super_.call(this, defaultFilter);

    this.filenameSuffix = function() {
        return '.multicolor';
    };
	
	this.writeWays = function (ways) {
		var result;

		result += '	<Style id="folderStyle">\n';
		result += '		<ListStyle>\n';
		result += '			<listItemType>checkHideChildren</listItemType>\n';
		result += '		</ListStyle>\n';
		result += '	</Style>\n';
		
		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];

			var tempResult = '	<Folder>\n\
									<styleUrl>#folderStyle</styleUrl>\n\
									<name>' + escape(way['name']) + '</name>\n\
									<description>' + this.getDescription(way) + '</description>\n';
			
			var currentCurvatureLevel = 0;

			var index = 0;
			var segments = way['segments'];
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
				tempResult += '</coordinates>\n</LineString>\n</Placemark>\n';
			}

			result += tempResult + '	</Folder>\n';
		}

		return result;
	};
};

_util.inherits(MultiColorKmlOutput, KmlOutput);