var _mathUtils = require('../mathUtils');
var _util = require('util');
var CalculatorBase = require('./CalculatorBase');

/* A given road usually isn't curvy for its entire length.  But we're only interested
 * in the curvy parts.  So this class is responsible for splitting up ways into their curvy sections.
 * 
 * @class
 * @augments  CalculatorBase
 *
 * @param {Number} _straightSegmentSplitThreshold - If a way has a series of non-curved segments longer than this (miles), the way will be split on that straight section. 
 * @param {Number} _level1MaxRadius - The max meters of a radius of level 1.
 * @param {Number} _level1Weight - The weight given to segments of level 1.
 * @param {Number} _level2MaxRadius -The max meters of a radius of level 2. 
 * @param {Number} _level2Weight - The weight given to segments of level 2.
 * @param {Number} _level3MaxRadius - The max meters of a radius of level 3.
 * @param {Number} _level3Weight - The weight given to segments of level 3.
 * @param {Number} _level4MaxRadius - The max meters of a radius of level 4.
 * @param {Number} _level4Weight - The weight given to segments of level 4.
 */
var WaySplitterCalculator = module.exports = function (_straightSegmentSplitThreshold, _level1MaxRadius, _level1Weight, _level2MaxRadius, _level2Weight, _level3MaxRadius, _level3Weight, _level4MaxRadius, _level4Weight) {
	WaySplitterCalculator.super_.call(this, _level1MaxRadius, _level1Weight, _level2MaxRadius, _level2Weight, _level3MaxRadius, _level3Weight, _level4MaxRadius, _level4Weight);
	var _self = this;

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
			curvature += _self.getCurvatureForSegment(sectSegment);
			length += sectSegment.length;
		}

		return { curvature: curvature, length: length };
	}

	/* Split the way into segments, and calculate their curvature, length and distance.
	 *
	 * @param {way} way - The way to calculate.
	 * @param {int} startPoint - The first segment index of the way.
	 * @param {int} endPoint - (optional) - The end segment index of the array.
	 * @returns {way} a deep clone of the way, with added calculated curvature, length and distance.
	 */
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
	this.split = function (way) {
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
};

_util.inherits(WaySplitterCalculator, CalculatorBase);