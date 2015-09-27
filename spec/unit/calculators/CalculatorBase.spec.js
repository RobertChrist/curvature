var CalculatorBase = require('../../../src/calculators/CalculatorBase');

// A new Config object.
var _target;

describe('CalculatorBase', function () {

	beforeEach(function () {
		 _target = new CalculatorBase(	1000, 1,  // if a radius is < 1000, weight it x1
		 								100, 10, 
 										10, 100, 
 										1, 1000); // if a radius is < 1, weight it x 1000
	});

	describe('Constructor', function () {
		it('is a function', function () {
			expect(typeof CalculatorBase).toBe('function');
		});
	});

	describe('getCurvatureForSegment', function () {
		it ('segment has no radius', function () {
			var result = _target.getCurvatureForSegment({length: 1})

			expect(result).toBe(0);
		});

		it ('segment has 0 radius', function () {
			var result = _target.getCurvatureForSegment({radius: 0, length: 1})

			expect(result).toBe(1000);
		});

		it ('segment radius is on cutoff point', function () {
			var result = _target.getCurvatureForSegment({radius: 1, length: 1})
			expect(result).toBe(100);

			var result = _target.getCurvatureForSegment({radius: 10, length: 1})
			expect(result).toBe(10);

			var result = _target.getCurvatureForSegment({radius: 100, length: 1})
			expect(result).toBe(1);

			var result = _target.getCurvatureForSegment({radius: 1000, length: 1})
			expect(result).toBe(0);
		});

		/* TODO: original curvature library doesn't handle this case, should double check it never happens.
		it ('segment has negative radius', function () {
			var result = _target.getCurvatureForSegment({radius: -1})

			expect(result).toBe(0);
		});
		*/

		it ('segment has completely invalid radius', function () {
			var result = _target.getCurvatureForSegment({radius: 'asdf'})

			expect(result).toBe(0);
		});

		it ('segments with smaller than 1 radius, weighted 1000x times', function () {
			var result = _target.getCurvatureForSegment({radius: .5, length: 3})

			expect(result).toBe(3000);
		});

		it ('segment radius smaller than 10, weighted 100 times', function () {
			var result = _target.getCurvatureForSegment({radius: 9, length: 3})

			expect(result).toBe(300);
		});

		it ('segment radius smaller than 100, weighted 10 times', function () {
			var result = _target.getCurvatureForSegment({radius: 90, length: 3})

			expect(result).toBe(30);
		});

		it ('segment radius smaller than 1000, weighted 1 times', function () {
			var result = _target.getCurvatureForSegment({radius: 900, length: 3})

			expect(result).toBe(3);
		});

		it ('segment radius larger than max, weighted 0', function () {
			var result = _target.getCurvatureForSegment({radius: 1900, length: 3})

			expect(result).toBe(0);
		});
	});
});