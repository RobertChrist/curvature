var _mathUtils = require('../mathUtils');

/* OSM data isn't perfect, and a few misaligned GPS points will make our calculations
 * think there are intense curves where the road is actually straight.  Here, we try
 * to filter out some of those problems spots.
 * 
 * @class
 *
 * @param {Bool} _keepEliminated - Mostly for debugging, doesn't actually remove 
 * 		(only flags) the sections that were determined to be misaligned OSM points.
 * @param {Number} _level1MaxRadius - The max meters of a radius of level 1.
 */
module.exports = function (_keepEliminated, _level1MaxRadius) {

	function getSegmentHeading(segment) {
		return 180 + Math.atan2((segment.end[0] - segment.start[0]),(segment.end[1] - segment.start[1])) * (180 / Math.PI);	//todo: move to math utils
	}

	function filterDeflectionOfStraightSegments(segments, startIndex, lookAhead) {
		if (lookAhead < 3)
			throw new Error('lookAhead must be 3 or more');

		try {
			var firstStraight = segments[startIndex];
			var nextStraight = segments[startIndex + lookAhead];

			// if (first_straight['curvature_level'] and not 'eliminated' in first_straight) or (next_straight['curvature_level'] and not 'eliminated' in next_straight):
			if ( (firstStraight.curvatureLevel && !firstStraight.eliminated)  || (nextStraight.curvatureLevel && !nextStraight.eliminated))
				return;

			var headingA = getSegmentHeading(firstStraight);
			var headingB = getSegmentHeading(nextStraight);
			var headingDiff = Math.abs(headingA - headingB);
			
			// Compare the difference in heading to the angle that wold be expected
			// for a curve just barely meeting our threshold for straight/curved.
			var gapDistance = _mathUtils.distanceBetweenPoints(firstStraight.end[0], firstStraight.end[1], nextStraight.start[0], nextStraight.start[1]);
			var minVariance = gapDistance / _level1MaxRadius;

			if (Math.abs(headingDiff) < minVariance) {
				// mark them as eliminated so that we can show them in the output
				for (var i = startIndex + 1, j = startIndex + lookAhead - 1; i < j; i++) {
					if (segments[i].curvatureLevel)
						segments[i].eliminated = true;
				}

				if (!_keepEliminated) {
					// unset the curvature level of the intermediate segments
					for (i = startIndex + 1, j = startIndex + lookAhead - 1; i < j; i++) {
						segments[i].curvatureLevel = 0;
					}
				}
			}
		} catch (e) {	// index error, usually
			return;
		}
	}

	this.filter = function(way) {
		var segments = way.segments;

		for (var i = 0, j = segments.length; i < j; i++) {
			// While we are in straight segments, be wary of single-point (two-segment)
			// deflections from our straight line if the next two segments are followed
			// by a straight section. E.g. __/\__
			// We want to differentiate a jog off of an otherwise straight line from a
			// curve between two straight sections like these:
			//     __ __    __
			//   /        /   \
			filterDeflectionOfStraightSegments(segments, i, 3);

			// While we are in straight segments, be wary of two/three-point (three/four-segment)
			// deflections from our straight line if the next two segments are followed
			// by a straight section. E.g. __/\ _   __
			//                                   \/
			// We want to differentiate a jog off of an otherwise straight line from a
			// curve between two straight sections like these:
			//     __ __    __
			//   /        /   \
			filterDeflectionOfStraightSegments(segments, i, 4);
			filterDeflectionOfStraightSegments(segments, i, 5);
		}
	}

};