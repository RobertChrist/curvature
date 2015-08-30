var WayFilter = require('../../../../src/WayFilter');
var KmlOutput = require('../../../../src/output/writers/KmlOutput');
var SingleColorKmlOutput = require('../../../../src/output/writers/SingleColorKmlOutput');

var filter = new WayFilter();

describe ('SingleColorKmlOutput.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof SingleColorKmlOutput).toBe('function');
		});

		it ('inherits from KmlOutput', function () {
			var target = new SingleColorKmlOutput(filter);
			var base = new KmlOutput(filter);

			var keys = Object.keys(base);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(target[key] === 0 || target[key]).toBeTruthy();
			}
		});
	});

	describe ('writeWays', function () {
		it ('is a function', function () {
			expect(typeof new SingleColorKmlOutput().writeWays).toBe('function');
		});

		// I'll cover testing this for real in the integration tests.
	});

	describe ('getStyles', function () {
		it ('returns an object', function () {
			var result = new SingleColorKmlOutput(filter).getStyles();
			
			expect(result).not.toBeNull();
		});

		it ('returns an object that has line styles for keys', function () {
			var result = new SingleColorKmlOutput(filter).getStyles();
			
			var keys = Object.keys(result);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(key.indexOf('lineStyle')).toBe(0);
				expect(key.length > 9).toBe(true);
			}
		});

		it ('returned object values have color values', function () {
			function isHexColor(sNum){
				return (typeof sNum === "string") && sNum.length === 6 && !isNaN(parseInt(sNum, 16));
			}

			var result = new SingleColorKmlOutput(filter).getStyles();
			
			var keys = Object.keys(result);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				var value = result[key];

				expect(value.color).toBeTruthy();
				expect(isHexColor(value.color.substring(2))).toBe(true); //(aRGB values)
			}
		});
	});
});