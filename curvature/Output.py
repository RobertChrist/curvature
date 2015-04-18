import sys
import math

class Output(object):
	max_curvature = 0
	
	def __init__(self, filter):
		self.filter = filter
	
	def filter_and_sort(self, ways):
		# Filter out ways that are too short/long or too straight or too curvy
		ways = self.filter.filter(ways)
		
		# Sort the ways based on curvature
		ways = sorted(ways, key=lambda k: k['curvature'])
		
		for way in ways:
			if way['curvature'] > self.max_curvature:
				self.max_curvature = way['curvature']
		
		return ways
		