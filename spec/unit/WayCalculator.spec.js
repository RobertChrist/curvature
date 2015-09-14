var WayCalculator = require('../../src/WayCalculator');

describe('WayCalculator', function () {
	describe ('constructor', function () {
		it('is a function', function () {
			expect(typeof WayCalculator).toBe('function');
		});
	});

	describe ('calculate', function () {
		//TODO: 
		// The only sane way to test this is by either breaking it up, or integration tests.
		// I don't understand why everything is done the way it is well enough to break it up yet, 
		// so I'll rely on integration tests for now.
	});
});