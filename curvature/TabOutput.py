import sys
import math

class TabOutput(Output):
	def output(self, ways):
		ways = self.filter_and_sort(ways)
		
		print "Curvature	Length (mi) Distance (mi)	Id				Name  			County"
		for way in ways:
			print '%d	%9.2f	%9.2f	%10s	%25s	%20s' % (way['curvature'], way['length'] / 1609, way['distance'] / 1609, way['id'], way['name'], way['county'])