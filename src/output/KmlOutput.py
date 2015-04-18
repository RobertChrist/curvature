import codecs
from xml.sax.saxutils import escape
class KmlOutput(Output):
	units = 'mi'
	
	def _write_header(self, f):
		self._write_doc_start(f)
		self._write_styles(f, self.get_styles())
	
	def _write_doc_start(self, f):
		f.write('<?xml version="1.0" encoding="UTF-8"?>\n')
		f.write('<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n')
		f.write('<Document>\n')
	
	def get_styles(self):
		return {
			'lineStyle0':{'color':'F000E010'}, # Straight roads
			'lineStyle1':{'color':'F000FFFF'}, # Level 1 turns
			'lineStyle2':{'color':'F000AAFF'}, # Level 2 turns
			'lineStyle3':{'color':'F00055FF'}, # Level 3 turns
			'lineStyle4':{'color':'F00000FF'}, # Level 4 turns
		}
			
		
	def _write_styles(self, f, styles):
		for id in styles:
			style = styles[id]
			if 'width' not in style:
				style['width'] = '4'
			if 'color' not in style:
				style['color'] = 'F0FFFFFF'
			
			f.write('	<Style id="' + id + '">\n')
			f.write('		<LineStyle>\n')
			f.write('			<color>' + style['color'] + '</color>\n')
			f.write('			<width>' + style['width'] + '</width>\n')
			f.write('		</LineStyle>\n')
			f.write('	</Style>\n')		
	
	def _write_footer(self, f):
		f.write('</Document>\n')
		f.write('</kml>\n')
	
	def _filename_suffix(self):
		return ''
		
	def write (self, ways, path, basename):
		ways = self.filter_and_sort(ways)
		ways.reverse()
		
		f = codecs.open(path + '/' + self.get_filename(basename), 'w', "utf-8")
		
		self._write_header(f)
		self._write_ways(f, ways)
		self._write_footer(f)
		f.close()
	
	def get_filename(self, basename):
		filename = basename + '.c_{0:.0f}'.format(self.filter.min_curvature)
		if self.filter.max_curvature > 0:
			filename += '-{0:.0f}'.format(self.filter.max_curvature)
		if self.filter.min_length != 1 or self.filter.max_length > 0:
			filename += '.l_{0:.0f}'.format(self.filter.min_length)
		if self.filter.max_length > 0:
			filename += '-{0:.0f}'.format(self.filter.max_length)
		filename += self._filename_suffix() + '.kml'
		return filename;
	
	def get_description(self, way):
		if self.units == 'km':
			return 'Curvature: %.2f\nDistance: %.2f km\nType: %s\nSurface: %s' % (way['curvature'], way['length'] / 1000, way['type'], way['surface']) 
		else:
			return 'Curvature: %.2f\nDistance: %.2f mi\nType: %s\nSurface: %s' % (way['curvature'], way['length'] / 1609, way['type'], way['surface']) 