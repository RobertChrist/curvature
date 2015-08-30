var WayFilter = require('../../src/WayFilter');
var _ = require('lodash');

describe ('WayFilter', function () {
	describe ('constructor', function () {
		it('is a function', function () {
			expect(typeof WayFilter).toBe('function');
		});

		it ('sets minLength correctly', function () {
			var target = new WayFilter(3, 0, 0, 0);

			expect(target.minLength).toBe(3);
		});

		it ('sets maxLength correctly', function () {
			var target = new WayFilter(0, 3, 0, 0);

			expect(target.maxLength).toBe(3);
		});

		it ('sets minCurvature correctly', function () {
			var target = new WayFilter(0, 0, 3, 0);

			expect(target.minCurvature).toBe(3);
		});

		it ('sets maxCurvature correctly', function () {
			var target = new WayFilter(0, 0, 0, 3);

			expect(target.maxCurvature).toBe(3);
		});
	});

	describe('filter', function () {
		var _ways = [
				{ length: 0, curvature: 0 }, { length: 0, curvature: 1 }, { length: 0, curvature: 2 }, { length: 0, curvature: 3 }, { length: 0, curvature: 4 },
				{ length: 1609, curvature: 0 }, { length: 1609,	curvature: 1 }, { length: 1609, curvature: 2 }, { length: 1609, curvature: 3 }, { length: 1609, curvature: 4 },
				{ length: 3218, curvature: 0 }, { length: 3218, curvature: 1 }, { length: 3218, curvature: 2 }, { length: 3218, curvature: 3 }, { length: 3218, curvature: 4 },
				{ length: 8000, curvature: 0 }, { length: 8000, curvature: 1 }, { length: 8000, curvature: 2 }, { length: 8000, curvature: 3 }, { length: 8000, curvature: 4 }];

		function testFilter (filter, expectedFilterFunction) {
			var filtered = filter.filter(_.clone(_ways, true));
			var expected = _.clone(_ways, true).filter(expectedFilterFunction);

			expect(_.isEqual(filtered, expected)).toBe(true);			
		}

		// No Filter Test
		it ('given no filter values, does not filter', function () {
			var ways = _.clone(_ways, true);

			var filter = new WayFilter(0, 0, 0, 0);

			var filtered = filter.filter(ways);

			expect(_.isEqual(filtered, ways)).toBe(true);
		});

		// Length Tests
		it ('given minLength filter value, filters on only minLength', function () {
			testFilter(new WayFilter(1, 0, 0, 0), function (way) { return way.length / 1609 > 1; })
		});

		it ('given maxLength filter value, filters on only maxLength', function () {
			testFilter(new WayFilter(0, 1, 0, 0), function (way) { return way.length / 1609 < 1; })
		});

		it ('given min and maxLength filter values, filters on lengths', function () {
			testFilter(new WayFilter(1, 3, 0, 0), function (way) { return way.length / 1609 > 1 && way.length / 1609 < 3; })
		});

		// Curvature Tests
		it ('given minCurv filter value, filters on only minCurv', function () {
			testFilter(new WayFilter(0, 0, 1, 0), function (way) { return way.curvature > 1; })
		});

		it ('given maxCurv filter value, filters on only maxCurv', function () {
			testFilter(new WayFilter(0, 0, 0, 1), function (way) { return way.curvature < 1; })
		});

		it ('given min and maxCurv filter values, filters on curvature', function () {
			testFilter(new WayFilter(0, 0, 1, 3), function (way) { return way.curvature > 1 && way.curvature < 3; })
		});

		// Mixed Filter Tests
		it ('given minLength and minCurv', function () {
			testFilter(new WayFilter(1, 0, 1, 0), function (way) { return way.length / 1609 > 1 && way.curvature > 1; })
		});

		it ('given maxCurv and maxLength', function () {
			testFilter(new WayFilter(0, 2, 0, 1), function (way) { return way.length / 1609 < 2 && way.curvature < 1; })
		});

		it ('given minLength and maxCurv', function () {
			testFilter(new WayFilter(1, 0, 0, 1), function (way) { return way.length / 1609 > 1 && way.curvature < 1; })
		});

		it ('given maxLength and minCurv', function () {
			testFilter(new WayFilter(0, 2, 1, 0), function (way) { return way.length / 1609 < 2 && way.curvature > 1; })
		});

		// All four specified
		it ('given maxLength and minCurv', function () {
			testFilter(new WayFilter(1, 3, 1, 3), function (way) { return way.length / 1609 > 1 && way.length / 1609 < 3 && way.curvature > 1 && way.curvature < 3; })
		});

		// Invalid inputs
		if ('given invalid inputs, ignores them', function () {
			var ways = _.clone(_ways, true);

			var filtered 	= filter.filter(new WayFilter(0,	0,	0,	0));
			filtered 		= filter.filter(new WayFilter(-1,	0,	0,	0));
			filtered 		= filter.filter(new WayFilter(0,	-1,	0,	0));
			filtered 		= filter.filter(new WayFilter(0,	0,	-1,	0));
			filtered 		= filter.filter(new WayFilter(0,	0,	0,	-1));
			filtered 		= filter.filter(new WayFilter('a',	0,	0,	0));
			filtered 		= filter.filter(new WayFilter(0,	'b',0,	0));
			filtered 		= filter.filter(new WayFilter(0,	0,	'c',0));
			filtered 		= filter.filter(new WayFilter(0,	0,	0,	'd'));

			expect(_.isEqual(filtered, ways)).toBe(true);
		});
	});
});