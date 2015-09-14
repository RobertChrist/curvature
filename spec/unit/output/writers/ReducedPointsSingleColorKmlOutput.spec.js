var WayFilter = require('../../../../src/WayFilter');
var SingleColorKmlOutput = require('../../../../src/output/writers/SingleColorKmlOutput');
var ReducedPointsSingleColorKmlOutput = require('../../../../src/output/writers/ReducedPointsSingleColorKmlOutput');

var filter = new WayFilter();

describe ('ReducedPointsSingleColorKmlOutput.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof ReducedPointsSingleColorKmlOutput).toBe('function');
		});

		it ('inherits from SingleColorKmlOutput', function () {
			var target = new ReducedPointsSingleColorKmlOutput(false, 2, filter);
			var base = new SingleColorKmlOutput(false, filter);

			var keys = Object.keys(base);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(target[key] === 0 || target[key]).toBeTruthy();
			}
		});

		it ('given invalid limitPoints, defaults to 2', function () {
			var target = new ReducedPointsSingleColorKmlOutput(-1, filter);
			expect(target.limitPoints).toBe(2);

			target = new ReducedPointsSingleColorKmlOutput(0, filter);
			expect(target.limitPoints).toBe(2);

			target = new ReducedPointsSingleColorKmlOutput(null, filter);
			expect(target.limitPoints).toBe(2);

			target = new ReducedPointsSingleColorKmlOutput(undefined, filter);
			expect(target.limitPoints).toBe(2);
		});
	});

	describe ('writeSegments', function () {
		
		it ('given no segments, throws exception', function () {
			expect(new ReducedPointsSingleColorKmlOutput(2, filter).writeSegments).toThrow();
		});

		it ('given lots of decimal points, truncates to 6 decimals', function () {
			var segments = [{ start: { lon: 1.234567, lat: 1.5678912 }, end: { lon:1.8765432, lat: 123456.456723 } }];

			var result = new ReducedPointsSingleColorKmlOutput(2, filter).writeSegments(segments);
			expect(result).toBe('1.234567,1.567891 1.876543,123456.456723 ');
		});

		it ('given few decimal points, pads 6 decimals', function () {
			var segments = [{
				start: {
					lon: 1.23,
					lat: 4.56
				},
				end: {
					lon:9.876,
					lat: 123456.45
				}
			}];

			var result = new ReducedPointsSingleColorKmlOutput(2, filter).writeSegments(segments);
			expect(result).toBe('1.230000,4.560000 9.876000,123456.450000 ');
		});

		it ('result has trailing space', function () {
			var segments = [{
				start: {
					lon: 1.23,
					lat: 4.56
				},
				end: {
					lon:9.876,
					lat: 123456.45
				}
			}];

			var result = new ReducedPointsSingleColorKmlOutput(2, filter).writeSegments(segments);
			expect(result[result.length - 1]).toBe(' ');
		});

		function get10Segments() {
			return [
				{ start: { lon: 1.234567, lat: 1.5678912 }, end: { lon:1.8765432, lat: 123456.456723 } },
				{ start: { lon: 2.234567, lat: 2.5678912 }, end: { lon:2.8765432, lat: 223456.456723 } },
				{ start: { lon: 3.234567, lat: 3.5678912 }, end: { lon:3.8765432, lat: 323456.456723 } },
				{ start: { lon: 4.234567, lat: 4.5678912 }, end: { lon:4.8765432, lat: 423456.456723 } },
				{ start: { lon: 5.234567, lat: 5.5678912 }, end: { lon:5.8765432, lat: 523456.456723 } },
				{ start: { lon: 6.234567, lat: 6.5678912 }, end: { lon:6.8765432, lat: 623456.456723 } },
				{ start: { lon: 7.234567, lat: 7.5678912 }, end: { lon:7.8765432, lat: 723456.456723 } },
				{ start: { lon: 8.234567, lat: 8.5678912 }, end: { lon:8.8765432, lat: 823456.456723 } },
				{ start: { lon: 9.234567, lat: 9.5678912 }, end: { lon:9.8765432, lat: 923456.456723 } },
				{ start: { lon: 0.234567, lat: 0.5678912 }, end: { lon:0.8765432, lat: 23456.456723 } }
			];
		}

		it ('given 2 as limitPoint, prints limitedly', function () {
			var segments = get10Segments();

			var result = new ReducedPointsSingleColorKmlOutput(2, filter).writeSegments(segments);
			expect(result).toBe('1.234567,1.567891 0.876543,23456.456723 ');
		});

		it ('given 4 as limitPoint, prints limitedly', function () {
			var segments = get10Segments();

			var result = new ReducedPointsSingleColorKmlOutput(4, filter).writeSegments(segments);
			expect(result).toBe('1.234567,1.567891 4.876543,423456.456723 8.876543,823456.456723 0.876543,23456.456723 ');
		});

		it ('given higher points limit than segments in way prints all', function () {
			var segments = get10Segments();

			var result = new ReducedPointsSingleColorKmlOutput(20, filter).writeSegments(segments);
			expect(result).toBe('1.234567,1.567891 1.876543,123456.456723 2.876543,223456.456723 3.876543,323456.456723 ' +
				'4.876543,423456.456723 5.876543,523456.456723 6.876543,623456.456723 7.876543,723456.456723 ' + 
				'8.876543,823456.456723 9.876543,923456.456723 0.876543,23456.456723 ');
		});
	});
});