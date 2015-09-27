var WayFilter = require('../../../src/WayFilter');
var TabOutput = require('../../../src/output/TabOutput');

var filter = new WayFilter();

describe ('TabOutput.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof TabOutput).toBe('function');
		});
	});

	describe('write', function () {
		it ('is a function', function () {
			expect(typeof new TabOutput().write).toBe('function');
		});

		// I'll cover testing this for real in the integration tests.
	});
});