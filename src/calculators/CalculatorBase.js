/* This is a base class for all of the calculators.  Holds simple, reusable methods.
 *
 * @abstract
 * @class
 * 
 * @param {Number} _level1MaxRadius - The max meters of a radius of level 1.
 * @param {Number} _level1Weight - The weight given to segments of level 1.
 * @param {Number} _level2MaxRadius -The max meters of a radius of level 2. 
 * @param {Number} _level2Weight - The weight given to segments of level 2.
 * @param {Number} _level3MaxRadius - The max meters of a radius of level 3.
 * @param {Number} _level3Weight - The weight given to segments of level 3.
 * @param {Number} _level4MaxRadius - The max meters of a radius of level 4.
 * @param {Number} _level4Weight - The weight given to segments of level 4. */
module.exports = function (_level1MaxRadius, _level1Weight, 
						   _level2MaxRadius, _level2Weight, 
						   _level3MaxRadius, _level3Weight, 
						   _level4MaxRadius, _level4Weight) {

	/* Returns a scalar value for the "curviness" of the way segment.
	 *
	 * @param {obj} segment - The portion of the curve to determine the curviness for.
	 * @returns {Number} - The curviness rating.
	 */ 
	this.getCurvatureForSegment = function (segment) {
		if (segment.radius < _level4MaxRadius)
			return segment.length * _level4Weight;

		if (segment.radius < _level3MaxRadius)
			return segment.length * _level3Weight;

		if (segment.radius < _level2MaxRadius)
			return segment.length * _level2Weight;

		if (segment.radius < _level1MaxRadius)
			return segment.length * _level1Weight;

		return 0;
	};
}