var OutputBase = require('./OutputBase');
var util = require('util');
var codecs = require('Fck/codecs');

var KmlOutput = module.exports = function () {
	var _units = 'mi';

	function writeHeader (f) {
		writeDocStart(f);
		writeStyles(f, this.getStyles());
	}

	function writeDocStart (f) {
		f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
		f.write('<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n')
		f.write('<Document>\n')
	}

	function writeStyles (f, styles) {
		for (var i = 0, j = styles.length; i < j; i++) {
			var style in styles[i];

			if (!style['width'])
				style['width'] = 4;

			if (style['color'])
				style['color'] = 'F0FFFFFF';

			f.write('	<Style id="' + id + '">\n')
			f.write('		<LineStyle>\n')
			f.write('			<color>' + style['color'] + '</color>\n')
			f.write('			<width>' + style['width'] + '</width>\n')
			f.write('		</LineStyle>\n')
			f.write('	</Style>\n')	
		}
	}

	function writeFooter (f) {
		f.write('</Document>\n')
		f.write('</kml>\n')
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
			'lineStyle0':{'color':'F000E010'}, // Straight roads
			'lineStyle1':{'color':'F000FFFF'}, // Level 1 turns
			'lineStyle2':{'color':'F000AAFF'}, // Level 2 turns
			'lineStyle3':{'color':'F00055FF'}, // Level 3 turns
			'lineStyle4':{'color':'F00000FF'}, // Level 4 turns
		};
	};

	this.write = function (roads, path, basename) {
		roads = this.filterAndSort(roads);
		roads.reverse()
		
		f = codecs.open(path + '/' + this.getFilename(basename), 'w', "utf-8")
		
		this.writeHeader(f);
		this.writeRoads(f);
		this.writeFooter(f);
		f.close()
	};

};

util.inherits(KmlOutput, OutputBase);