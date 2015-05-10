var _target = require('../src/Logger');

describe('Logger', function () {
	describe('Constructor', function () {
		it('is a function', function () {
			expect(typeof _target).toBe('function');
		});

		it('throws an error if not used as a constructor', function () {
			expect(_target).toThrow();
		});

		it('has a logging function', function () {
			var logger = new _target();
			expect(logger.log).toBeTruthy();
		});

		it('has a forced logging function', function () {
			var logger = new _target();
			expect(logger.forceLog).toBeTruthy();
		});
	});
});