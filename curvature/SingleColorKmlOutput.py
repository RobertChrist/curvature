import sys
import math

class SingleColorKmlOutput(KmlOutput):
	
	def get_styles(self):
		styles = {'lineStyle0':{'color':'F000E010'}} # Straight roads
		
		# Add a style for each level in a gradient from yellow to red (00FFFF - 0000FF)
		for i in range(256):
			styles['lineStyle{}'.format(i + 1)] = {'color':'F000{:02X}FF'.format(255 - i)}
		return styles
	
	def _write_ways(self, f, ways):
		
		for way in ways:
			if 'segments' not in way or not len(way['segments']):
# 				sys.stderr.write("\nError: way has no segments: {} \n".format(way['name']))
				continue
			f.write('	<Placemark>\n')
			f.write('		<styleUrl>#' + self.line_style(way) + '</styleUrl>\n')
			f.write('		<name>' + escape(way['name']) + '</name>\n')
			f.write('		<description>' + self.get_description(way) + '</description>\n')
			f.write('		<LineString>\n')
			f.write('			<tessellate>1</tessellate>\n')
			f.write('			<coordinates>')
			f.write("%.6f,%6f " %(way['segments'][0]['start'][1], way['segments'][0]['start'][0]))
			for segment in way['segments']:
				f.write("%.6f,%6f " %(segment['end'][1], segment['end'][0]))
			f.write('</coordinates>\n')
			f.write('		</LineString>\n')
			f.write('	</Placemark>\n')
	
	def level_for_curvature(self, curvature):
		if self.filter.min_curvature > 0:
			offset = self.filter.min_curvature
		else:
			offset = 0
		
		if curvature < offset:
			return 0
		
		curvature_pct = (curvature - offset) / (self.max_curvature - offset)
		# Use the square route of the ratio to give a better differentiation between
		# lower-curvature ways
		color_pct = math.sqrt(curvature_pct)
		level = int(round(255 * color_pct)) + 1		
		return level
	
	def line_style(self, way):
		return 'lineStyle{}'.format(self.level_for_curvature(way['curvature']))