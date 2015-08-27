var _target = require('../src/mathUtils');

describe ('mathUtils', function () {
	describe ('circumcircleRadius', function () {
		it ('outputs the correct answer for a pythagorean triangle', function () {
			var result = _target.circumcircleRadius(4, 3, 5);

			expect(result).toBe(2.5);
		});

		it ('outputs the correct answer for a much larger pythagorean triangle', function () {
			var result = _target.circumcircleRadius(207, 224, 305);

			expect(result).toBe(152.5);
		});

		it ('outputs the correct answer to the hundredth place for a non pythagorean triangle', function () {
			var result = _target.circumcircleRadius(4, 21.8, 21.2);

			expect(Math.round(result * 100) / 100).toBe(10.92);
		});
	});

	describe ('distanceBetweenPoints', function () {
		it ('Calculates the distance from NYC to LA to nearest meter', function () {
			var result = _target.distanceBetweenPoints(40.7127, 74.0059, 34.0500, 118.2500);

			expect(Math.round(result)/1000).toBe(3937.621);	// kilometers
		});

		it ('Calculates the distance from London to NYC to nearest meter', function () {
			var result = _target.distanceBetweenPoints(40.7127, 74.0059, 51.5072, 0.1275);

			expect(Math.round(result)/1000).toBe(5571.998);	// kilometers
		});
	});
});