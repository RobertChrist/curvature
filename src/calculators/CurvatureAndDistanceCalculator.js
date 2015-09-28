var _mathUtils = require('../mathUtils');
var _util = require('util');
var CalculatorBase = require('./CalculatorBase');

/* Given a way, will calculate that way's total distance and curvature setting.
 * 
 * @class
 * @augments  CalculatorBase
 *
 * @param {Number} _level1MaxRadius - The max meters of a radius of level 1.
 * @param {Number} _level1Weight - The weight given to segments of level 1.
 * @param {Number} _level2MaxRadius -The max meters of a radius of level 2. 
 * @param {Number} _level2Weight - The weight given to segments of level 2.
 * @param {Number} _level3MaxRadius - The max meters of a radius of level 3.
 * @param {Number} _level3Weight - The weight given to segments of level 3.
 * @param {Number} _level4MaxRadius - The max meters of a radius of level 4.
 * @param {Number} _level4Weight - The weight given to segments of level 4.
 */
var thisObject = module.exports = function (  _level1MaxRadius, _level1Weight, 
											  _level2MaxRadius, _level2Weight, 
											  _level3MaxRadius, _level3Weight,
											  _level4MaxRadius, _level4Weight) {

	thisObject.super_.call(this, _level1MaxRadius, _level1Weight, 
								 _level2MaxRadius, _level2Weight, 
						 		 _level3MaxRadius, _level3Weight, 
						 		 _level4MaxRadius, _level4Weight);
	var _self = this;

	function getWayDistance(way, coords) {
		var start = coords[way.refs[0]],
			end = coords[way.refs[way.refs.length - 1]];

		return _mathUtils.distanceBetweenPoints(start.lat, start.lon, end.lat, end.lon);
	}

	/* An internal function used by this class to calculate the way by segments.
	 * Made public here to allow for more granular unit testing. */
	this.getSegments = function (way, coords) {
		way.curvature = 0.0;
		way.length = 0.0;

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
				r = _mathUtils.circumcircleRadius(firstSecondLength, secondThirdLength, firstThirdLength);
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

		return segments;
	};

	// TODO: I think this function breaks on all curves that have more than 4 reference points, because all later twisties get added to the 4th segment
	// as a result of it working in a loop.  If refs never have more than 4 segments, then we can greatly simplify this method by not working in a loop.
	// if they have more than 4, then I have to wonder how that affects our numbers.  Maybe the assumption is it won't change much?
	this.calculate = function (way, coords) {
		
		way.distance = getWayDistance(way, coords);
		way.segments = _self.getSegments(way, coords);

		delete way.refs;  // refs are no longer needed now that we have loaded our segments.

		// calculate the curvature as a weighted distance traveled at each curvature.
		way.curvature = 0;
		for (var k = 0, l = way.segments.length; k < l; k++) {
			var segment = way.segments[k];

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

			way.curvature += _self.getCurvatureForSegment(segment);
		}
	}
};

_util.inherits(thisObject, CalculatorBase);