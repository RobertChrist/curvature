var OutputBase = require('./OutputBase');
var util = require('util');
var fs = require('fs');

var KmlOutput = module.exports = function () {
	var _units = 'mi';

	function writeHeader () {
		return getDocStart() + writeStyles(getStyles());
	}

	function writeDocStart () {
		return '<?xml version="1.0" encoding="UTF-8"?>\n' + 
		'<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
		'<Document>\n';
	}

	function writeStyles (styles) {
		var result = '';

		for (var i = 0, j = styles.length; i < j; i++) {
			var style in styles[i];

			if (!style['width'])
				style['width'] = 4;

			if (style['color'])
				style['color'] = 'F0FFFFFF';

			result += '	<Style id="' + i + '">\n';
			result += '		<LineStyle>\n';
			result += '			<color>' + style['color'] + '</color>\n';
			result += '			<width>' + style['width'] + '</width>\n';
			result += '		</LineStyle>\n';
			result += '	</Style>\n');
		}

		return result;
	}

	function writeFooter () {
		return '</Document>\n' +
			   '</kml>\n';
	}

	function filenameSuffix () {
		return '';
	}

	function getFilename (basename) {
		var filename = basename + '.c_{0:.0f}'.format(this.filter.minCurvature;

		if this.filter.maxCurvature > 0
			filename += '-{0:.0f}'.format(this.filter.maxCurvature);

		if this.filter.minLength != 1 or this.filter.maxLength > 0
			filename += '.l_{0:.0f}'.format(this.filter.minLength);

		if this.filter.maxLength > 0:
			filename += '-{0:.0f}'.format(this.filter.maxLength);

		filename += this.filenameSuffix() + '.kml'
		return filename;
	}

	this.getDescription = function (way) {
		if (_units === 'km'):
			return 'Curvature: %.2f\nDistance: %.2f km\nType: %s\nSurface: %s' % (way['curvature'], way['length'] / 1000, way['type'], way['surface']);
		else
			return 'Curvature: %.2f\nDistance: %.2f mi\nType: %s\nSurface: %s' % (way['curvature'], way['length'] / 1609, way['type'], way['surface']);
	};

	this.getStyles = function () {
		return {
			'lineStyle0':{'color':'F000E010'}, // Straight ways
			'lineStyle1':{'color':'F000FFFF'}, // Level 1 turns
			'lineStyle2':{'color':'F000AAFF'}, // Level 2 turns
			'lineStyle3':{'color':'F00055FF'}, // Level 3 turns
			'lineStyle4':{'color':'F00000FF'}, // Level 4 turns
		};
	};

	this.write = function (ways, path, basename) {
		ways = this.filterAndSort(ways);
		ways.reverse()
		
		var kmlDoc = this.writeHeader();
		kmlDoc += this.writeWays(ways);
		kmlDoc += writeFooter();
		
		fs.writeFileSync(path + '/' + getFilename(basename), kmlDoc);
	};
};

util.inherits(KmlOutput, OutputBase);