var _mathUtils = require('./mathUtils');

/* This object is responsible for calculating the curvature of ways, given
 * a set of ways, and their corresponding coordinates.
 * 
 * @class
 * @param {Logger} _logger - The instance we should log with.
 * @param {Number} _straightSegmentSplitThreshold - TODO: 
 * @param {Number} _level1MaxRadius - TODO:
 * @param {Number} _level1Weight - TODO:
 * @param {Number} _level2MaxRadius -TODO: 
 * @param {Number} _level2Weight - TODO:
 * @param {Number} _level3MaxRadius - TODO:
 * @param {Number} _level3Weight - TODO:
 * @param {Number} _level4MaxRadius - TODO:
 * @param {Number} _level4Weight - TODO:
 */
module.exports = function (_logger,
                           _straightSegmentSplitThreshold,
						   _level1MaxRadius, _level1Weight, 
						   _level2MaxRadius, _level2Weight, 
						   _level3MaxRadius, _level3Weight, 
						   _level4MaxRadius, _level4Weight) {

	/* Returns a scalar value for the "curviness" of the way segment.
	 *
	 * @param {obj} segment - The portion of the curve to determine the curviness for.
	 * @returns {Number} - The curviness rating.
	 */ 
	function getCurvatureForSegment (segment) {
		if (segment.radius < _level4MaxRadius)
			return segment.length * _level4Weight;

		if (segment.radius < _level3MaxRadius)
			return segment.length * _level3Weight;

		if (segment.radius < _level2MaxRadius)
			return segment.length * _level2Weight;

		if (segment.radius < _level1MaxRadius)
			return segment.length * _level1Weight;

		return 0;
	}

	/* Determines how long the given section is in real life (assuming a straight line),
	 * using the latitude and longitude arguments on the section argument.
	 * 
	 * @param {obj} section - The portion of the curve to determine the curivness for.
	 * @returns {Number} - The distance between these two points on the earth.
	 */
	function getSectionDistance(section) {
		var start = section.segments[0].start;
		var lastSectionIndex = section.segments.length - 1;
		var end = section.segments[lastSectionIndex].end;
		return _mathUtils.distanceBetweenPoints(start.lat, start.lon, end.lat, end.lon);
	}

	/* Iterates over the segments of the section, and sums the curviness
	 * and length of each section in order to determine the total curviness and length
	 * of this entire road section.
	 * 
	 * @param {obj} section - An entire turn, made up of sub segments.
	 * @returns {obj} - { curvature: the Curviness Rating, 
 			length: The length of the section }
	 */
	function getSectionLengthAndCurvature(section) {
		var curvature = 0;
		var length = 0;
		
		for (var i = 0, j = section.segments.length; i < j; i++) {
			var sectSegment = section.segments[i];
			curvature += getCurvatureForSegment(sectSegment);
			length += sectSegment.length;
		}

		return { curvature: curvature, length: length };
	}

	/* TODO: */
	function getCurveRatedSection (way, startPoint, endPoint) {
		var section = JSON.parse(JSON.stringify(way));

		section.segments = !endPoint ? way.segments.slice(startPoint) : way.segments.slice(startPoint, endPoint);

		var curveAndLength = getSectionLengthAndCurvature(section);
		section.curvature = curveAndLength.curvature;
		section.length = curveAndLength.length;

		section.distance = getSectionDistance(section);
		return section;
	}

	/* TODO: */
	function splitWaySections (way) {
		var sections = [];

		// Special case where ways will never be split
		if (_straightSegmentSplitThreshold <= 0) {
			sections.push(way);
			return sections;
		}

		var curveStart = 0,
			curveDistance = 0,
			straightStart = null,
			straightDistance = 0;

		for (var i = 0, j = way.segments.length; i < j; i++) {
			var segment = way.segments[i];

			// Reset the straight distance if we have a significant curve
			if (segment.curvatureLevel) {
				// Ignore any preceding long straight sections
				if (straightDistance > _straightSegmentSplitThreshold || curveStart === null)
					curveStart = i;

				straightStart = null;
				straightDistance = 0;
				curveDistance += segment.length;
			} else {
				// add to our straight distance
				if (straightStart === null)
					straightStart = i;
				
				straightDistance += segment.length;
			}

			// If we are more than about 1.5 miles of straight, split off the last curved part.
			if (straightDistance > _straightSegmentSplitThreshold && 
				straightStart > 0 && curveDistance > 0) {
				
				sections.push(getCurveRatedSection(way, curveStart, straightStart));
				curveDistance = 0;
				curveStart = null;
			}
		}

		// Add any remaining curved section to the sections
		if (curveDistance > 0)
			sections.push(getCurveRatedSection(way, curveStart));

		return sections;
	}

	// TODO: I think this function breaks on all curves that have more than 4 reference points, because all later twisties get added to the 4th segment
	// as a result of it working in a loop.  If refs never have more than 4 segments, then we can greatly simplify this method by not working in a loop.
	// if they have more than 4, then I have to wonder how that affects our numbers.  Maybe the assumption is it won't change much?
	function calculateDistanceAndCurvature (way, coords) {
		way.distance = 0.0;
		way.curvature = 0.0;
		way.length = 0.0;
		var start = coords[way.refs[0]],
			end = coords[way.refs[way.refs.length - 1]];

		way.distance = _mathUtils.distanceBetweenPoints(start.lat, start.lon, end.lat, end.lon);

		var second = 0, third = 0, segments = [];
		var firstSecondLength;

		for (var i = 0, j = way.refs.length; i < j; i++) {
			var ref = way.refs[i];
			var first = coords[ref];

			if (!second) {
				second = first;
				continue;
			}

			firstSecondLength = _mathUtils.distanceBetweenPoints(first.lat, first.lon, second.lat, second.lon);
			way.length += firstSecondLength;

			var secondThirdLength;
			if (!third) {
				third = second;
				second = first;
				secondThirdLength = firstSecondLength;
				continue;
			}

			// ignore curvature from zero-distance
			var firstThirdLength = _mathUtils.distanceBetweenPoints(first.lat, first.lon, third.lat, third.lon);
			var r = 0;
			if (firstThirdLength > 0 && firstSecondLength > 0 && secondThirdLength > 0) {
				r = _mathUtils.circumcircleRadius(firstThirdLength, firstSecondLength, secondThirdLength);
			} else {
				r = 100000;
			}

			if (!segments.length) {
				// add the first segment using the first point
				segments.push({'start': third, 'end': second, 'length': secondThirdLength, 'radius': r });
			}
			else {
				var lastSegmentIndex = segments.length - 1;
				// set the radius of the previous segment to the smaller radius of the two circumcircles its a part of
				if (segments[lastSegmentIndex].radius > r)
					segments[lastSegmentIndex].radius = r;
			}

			// add our latest segment
			segments.push({'start': second, 'end': first, 'length': firstSecondLength, 'radius': r });

			third = second;
			second = first;
			secondThirdLength = firstSecondLength;
		}

		// special case for two-coordinate ways
		if (way.refs.length == 2) 
			segments.push({ 'start': coords[way.refs[0]], 'end': coords[way.refs[1]], 'length': firstSecondLength, 'radius': 100000 });

		way.segments = segments;
		delete way.refs;  // refs are no longer needed now that we have loaded our segments.

		// calculate the curvature as a weighted distance traveled at each curvature.
		way.curvature = 0;
		for (var k = 0, l = segments.length; k < l; k++) {
			var segment = segments[k];

			if (segment.radius < _level4MaxRadius)
				segment.curvatureLevel = 4;
			else if (segment.radius < _level3MaxRadius)
				segment.curvatureLevel = 3;
			else if (segment.radius < _level2MaxRadius)
				segment.curvatureLevel = 2;
			else if (segment.radius < _level1MaxRadius)
				segment.curvatureLevel = 1;
			else
				segment.curvatureLevel = 0;

			way.curvature += getCurvatureForSegment(segment);
		}
	}

	/* Using the passed in arguments, determines the curviness of each way, 
	 * and each segment of each way. 
	 * 
	 * @param {obj[]} ways - The roads to calculate curviness of.
	 * @param {obj} coords - The coordinates the ways reference.
	 * @returns {obj[]} - The ways, updated with their new curve and distaince information.
	 */
	this.calculate = function (ways, coords) {
		var sections = [];

		var way;
		while (way = ways.pop()) {
			try {
				calculateDistanceAndCurvature(way, coords);
				var waySections = splitWaySections(way);
				sections.push.apply(sections, waySections);
			} catch (err) {
			    _logger.forceLog(err);
				continue;
			}
		}

		return sections;
	};
};