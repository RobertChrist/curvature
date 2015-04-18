import sys
import math

class SurfaceKmlOutput(SingleColorKmlOutput):
	def get_styles(self):
		return {
			'unknown':{'color':'F0FFFFFF'},
			'paved':{'color':'F0000000'},
			'asphalt':{'color':'F0FF0000'},
			'concrete':{'color':'F0FF4444'},
			'concrete:lanes':{'color':'F0FFCCCC'},
			'concrete:plates':{'color':'F0FFCCCC'},
			'cobblestone':{'color':'F0FF8888'},
			'cobblestone:flattened':{'color':'F0FF8888'},
			'paving_stones':{'color':'F0FF8888'},
			'paving_stones:20':{'color':'F0FF8888'},
			'paving_stones:30':{'color':'F0FF8888'},
			
			'unpaved':{'color':'F000FFFF'},
			'fine_gravel':{'color':'F00055FF'},
			'pebblestone':{'color':'F000AAFF'},
			'gravel':{'color':'F000AAFF'},
			'dirt':{'color':'F06780E5'},#E58067
			'sand':{'color':'F000AAAA'},
			'salt':{'color':'F000AAAA'},
			'ice':{'color':'F000AAAA'},
			'grass':{'color':'F000FF00'},
			'ground':{'color':'F000FF00'},
			'earth':{'color':'F000FF00'},
			'mud':{'color':'F00000FF'},

		}
	
	def line_style(self, way):
		return way['surface']
	
	def get_filename(self, basename):
		filename = basename + '.surfaces'
		if self.filter.min_length > 0 or self.filter.max_length > 0:
			filename += '.l_{0:.0f}'.format(self.filter.min_length)
		if self.filter.max_length > 0:
			filename += '-{0:.0f}'.format(self.filter.max_length)
		filename += self._filename_suffix() + '.kml'
		return filename;
		
	def get_description(self, way):
		return 'Type: %s\nSurface: %s' % (way['type'], way['surface'])