var _util = require('util');
var KmlOutput = require('./KmlOutput');

var MultiColorKmlOutput = module.exports = function (defaultFilter) {
    MultiColorKmlOutput.super_.call(this, defaultFilter);

    var _allowWhitespaceRegex = new RegExp('%20', 'g');

	this.writeWays = function (ways) {
	    var result = '';
		result += '	<Style id="folderStyle">\n';
		result += '		<ListStyle>\n';
		result += '			<listItemType>checkHideChildren</listItemType>\n';
		result += '		</ListStyle>\n';
		result += '	</Style>\n';
		
		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];

			var tempResult = 	'	<Folder>\n\'' +
							 	'		<styleUrl>#folderStyle</styleUrl>\n' +
							 	'		<name>' + escape(way.name).replace(_allowWhitespaceRegex, ' ') + '</name>\n' +
							 	'		<description>' + this.getDescription(way) + '</description>\n';
			
			var currentCurvatureLevel = 0;

			var index = 0;
			var segments = way.segments;
			for (var k = 0, l = segments.length; k < l; k++) {
				var segment = segments[k];
			
				if (segment.curvature_level != currentCurvatureLevel || !index) {
					currentCurvatureLevel = segment.curvatureLevel;
					
					// Close the open LineString
					if (index)
						tempResult += 	'</coordinates>\n' +
										'		</LineString>\n' + 
										'		</Placemark>\n';

					// Start a new linestring for this level
					tempResult += 	'	<Placemark>\n' +
								  	'		<styleUrl>#lineStyle' + currentCurvatureLevel + '</styleUrl>\n' +
								  	'		<LineString>\n' +
								  	'			<tessellate>1</tessellate>\n' +
								  	'			<coordinates>';

					tempResult += _util.format("%d,%d ", segment.start.lon.toFixed(6), segment.start.lat.toFixed(6));
				}

				tempResult += _util.format("%d,%d ", segment.end.lon.toFixed(6), segment.end.lat.toFixed(6));
				index++;
			}

			if (index) {
				tempResult += 	'</coordinates>\n' + 
								'		</LineString>\n' + 
								'	</Placemark>\n';
			}

		    tempResult += '	</Folder>\n';
            
            result += tempResult;
		}

		return result;
	};
};

_util.inherits(MultiColorKmlOutput, KmlOutput);

MultiColorKmlOutput.prototype.filenameSuffix = function() {
    return '.multicolor';
};