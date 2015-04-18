import sys
import math

class MultiColorKmlOutput(KmlOutput):
	def _filename_suffix(self):
		return '.multicolor'
	
	def _write_ways(self, f, ways):
		f.write('	<Style id="folderStyle">\n')
		f.write('		<ListStyle>\n')
		f.write('			<listItemType>checkHideChildren</listItemType>\n')
		f.write('		</ListStyle>\n')
		f.write('	</Style>\n')
		
		for way in ways:
			f.write('	<Folder>\n')
			f.write('		<styleUrl>#folderStyle</styleUrl>\n')
			f.write('		<name>' + escape(way['name']) + '</name>\n')
			f.write('		<description>' + self.get_description(way) + '</description>\n')
			current_curvature_level = 0
			i = 0
			for segment in way['segments']:
				if segment['curvature_level'] != current_curvature_level or not i:
					current_curvature_level = segment['curvature_level']
					# Close the open LineString
					if i:
						f.write('</coordinates>\n')
						f.write('			</LineString>\n')
						f.write('		</Placemark>\n')
					# Start a new linestring for this level
					f.write('		<Placemark>\n')
					f.write('			<styleUrl>#lineStyle%d</styleUrl>\n' % (current_curvature_level))
					f.write('			<LineString>\n')
					f.write('				<tessellate>1</tessellate>\n')
					f.write('				<coordinates>')
					f.write("%.6f,%6f " %(segment['start'][1], segment['start'][0]))
				f.write("%.6f,%6f " %(segment['end'][1], segment['end'][0]))
				i = i + 1
			if i:
				f.write('</coordinates>\n')
				f.write('			</LineString>\n')
				f.write('		</Placemark>\n')
			f.write('	</Folder>\n')