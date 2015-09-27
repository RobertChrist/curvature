var WayFilter = require('../../../src/WayFilter');
var KmlOutput = require('../../../src/output/KmlOutput');
var MultiColorKmlOutput = require('../../../src/output/MultiColorKmlOutput');

var filter = new WayFilter();

describe ('MultiColorKmlOutput.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof MultiColorKmlOutput).toBe('function');
		});

		it ('inherits from KmlOutput', function () {
			var target = new MultiColorKmlOutput(filter);
			var base = new KmlOutput(filter);

			var keys = Object.keys(base);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(target[key] === 0 || target[key]).toBeTruthy();
			}
		});
	});

	describe ('filenameSuffix', function () {
		it ('returns a string', function () {
			var suffix = new KmlOutput(filter).filenameSuffix();

			expect(typeof suffix === 'string' || suffix instanceof String).toBe(true);
		});
	});

	describe('writeWays', function () {
		it ('is a function', function () {
			expect(typeof new MultiColorKmlOutput().writeWays).toBe('function');
		});

		// I'll cover testing this for real in the integration tests.
	});
});