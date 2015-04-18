import sys
import math
import resource
import copy
from imposm.parser import OSMParser
rad_earth_m = 6373000 # Radius of the earth in meters
	
class NoCurvatureWayCollector(WayCollector):
	def calculate_distance_and_curvature(self, way):
		way['distance'] = 0.0
		way['curvature'] = 0.0
		way['length'] = 0.0
		start = self.coords[way['refs'][0]]
		end = self.coords[way['refs'][-1]]
		second = 0
		third = 0
		segments = []
		for ref in way['refs']:
			first = self.coords[ref]
			
			if not second:
				second = first
				continue
			
			if not third:
				third = second
				second = first
				continue
						
			if not len(segments):
				# Add the first segment using the first point
				segments.append({'start': third, 'end': second})
			
			# Add our latest segment
			segments.append({'start': second, 'end': first})
			
			third = second
			second = first
		
		# Special case for two-coordinate ways
		if len(way['refs']) == 2:
			segments.append({'start': self.coords[way['refs'][0]], 'end': self.coords[way['refs'][1]]})
		
		way['segments'] = segments

		# Calculate the curvature as a weighted distance traveled at each curvature.
		way['curvature'] = 0
		for segment in segments:
			segment['radius'] = 0
			segment['curvature_level'] = 0
	