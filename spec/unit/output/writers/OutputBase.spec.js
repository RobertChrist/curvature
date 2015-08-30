var _ = require('lodash');
var WayFilter = require('../../../../src/WayFilter');
var OutputBase = require('../../../../src/output/writers/OutputBase');

var filter = new WayFilter(0, 0, 0, 0);

describe ('OutputBase.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof OutputBase).toBe('function');
		});

		it ('sets filter', function () {
			var target = new OutputBase(filter);

			expect(target.filter).toBe(filter);
		});
	});

	describe ('filterAndSort', function () {
		var ways = [{
			curvature: 1,
			type: 'highway'
		}, {
			curvature: 2,
			length: 2300
		}, {
			curvature: 3.456,
			surface: 'gravel',
			length: 2000
		}, {
			curvature: 2.87,
			length: 4000
		}];

		describe ('maxCurvature', function () {
			it ('given no ways, is 0', function () {
				var target = new OutputBase(filter);

				target.filterAndSort([]);

				expect(target.maxCurvature).toBe(0);
			});

			it ('sets Max Curvature', function () {
				var waysClone = _.clone(ways);

				var target = new OutputBase(filter);

				target.filterAndSort(waysClone);

				expect(target.maxCurvature).toBe(3.456);
			});
		});

		it ('returns sorted ways', function () {
			var waysClone = _.clone(ways);

			var target = new OutputBase(filter);

			var result = target.filterAndSort(waysClone);

			expect(_.isEqual(result[0], ways[0])).toBe(true);
			expect(_.isEqual(result[1], ways[1])).toBe(true);
			expect(_.isEqual(result[2], ways[3])).toBe(true);
			expect(_.isEqual(result[3], ways[2])).toBe(true);
			expect(result.length).toBe(4);
		});

		it ('filters ways', function () {
			var filterWasCalled = false;

			var target = new OutputBase({ 
				filter: function (w) {
					filterWasCalled = true;
					return w;
				}
			});

			var waysClone = _.clone(ways);

			var result = target.filterAndSort(waysClone);

			expect(filterWasCalled).toBe(true);
		});

		it ('all together now', function () {
			var target = new OutputBase(new WayFilter(1, 3, 1, 3));

			var waysClone = _.clone(ways);

			var result = target.filterAndSort(waysClone);

			expect(result.length).toBe(2);
			expect(_.isEqual(result[0], ways[1])).toBe(true);
			expect(_.isEqual(result[1], ways[3])).toBe(true);
			expect(target.maxCurvature).toBe(2.87);
		});
	});
});