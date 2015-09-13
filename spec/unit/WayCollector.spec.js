var WayCollector = require('../../src/WayCollector');

describe ('WayCollector', function () {

	var _parseWayCalled = false;
	var _parseCoordCalled = false;
	var _getResultsCalled = false;
	var _joinWaysCalled = false;

	var _loggerMock = {
		log: function () {}
	};

	var _wayParserMock = {
		parseWay: function (data) {
			_parseWayCalled = true;
		},
		parseCoord: function (data) {
			_parseCoordCalled = true;
		},
		getResults: function () {
			_getResultsCalled = true;

			return {
				ways: []
			};
		},
		joinWays: function () {
			_joinWaysCalled = true;
		}
	};

	var _wayCalculatorMock = {};

	var _target;

	beforeEach(function () {
		_parseWayCalled = false;
		_parseCoordCalled = false;
		_getResultsCalled = false;
		_joinWaysCalled = false;

		_target = new WayCollector(_loggerMock, _wayParserMock, _wayCalculatorMock);
	});

	describe ('constructor', function () {
		it('is a function', function () {
			expect(typeof WayCollector).toBe('function');
		});
	});

	describe ('_parseWay', function () {
		it ('is given bad data, does not parse, but does call next', function () {
			var ways = [{ type: 'notway' }, { way: 'not' }, { }];

			for (var i = 0, j = ways.length; i < j; i++){
				var way = ways[i];

				var wasNextCalled = false;

				_target._parseWay(way, null, function () {
					wasNextCalled = true;
				});

				expect(wasNextCalled).toBe(true);
			}
			
			expect(_parseWayCalled).toBe(false);

		});

		it ('is given a way, parses way and calls next', function () {
			var way = {
				type: 'way'
			};

			var wasNextCalled = false;

			_target._parseWay(way, null, function () {
				wasNextCalled = true;
			});

			expect(wasNextCalled).toBe(true);
			expect(_parseWayCalled).toBe(true);
		});
	});

	describe ('_parseCoord', function () {
		it ('is given bad data, does not parse, but does call next', function () {
			var ways = [{ type: 'notway' }, { way: 'not' }, { }];

			for (var i = 0, j = ways.length; i < j; i++){
				var way = ways[i];

				var wasNextCalled = false;

				_target._parseCoord(way, null, function () {
					wasNextCalled = true;
				});

				expect(wasNextCalled).toBe(true);
			}
			
			expect(_parseCoordCalled).toBe(false);

		});

		it ('is given a way, parses way and calls next', function () {
			var way = {
				type: 'node'
			};

			var wasNextCalled = false;

			_target._parseCoord(way, null, function () {
				wasNextCalled = true;
			});

			expect(wasNextCalled).toBe(true);
			expect(_parseCoordCalled).toBe(true);
		});
	});

	describe ('_afterAllParsed', function () {
		it ('gets results from parser', function () {
			_target._afterAllParsed(function (err, res) {
			});

			expect(_getResultsCalled).toBe(true);
		});

		it ('tells parser to clean its data', function () {
			_target._afterAllParsed(function (err, res) {
			});

			expect(_joinWaysCalled).toBe(true);
		});

		it ('tells parser to clean its data before calling calculate', function () {
			var target = new WayCollector(_loggerMock, { 
				joinWays: function () { 
					_joinWaysCalled = true;
					throw ''; }
			}, _wayCalculatorMock);

			var errorThrown = false;
			try {
				target._afterAllParsed(function (err, res) { });
			} catch (e) {
				errorThrown = true;
				expect(_getResultsCalled).toBe(false);
			}

			if (!errorThrown) expect(false).toBe(true);
		});

		it ('throws error on null results', function () {
			_target._afterAllParsed(function (err, res) {
				expect(err).not.toBeNull();
			});

			expect(_getResultsCalled).toBe(true);
		});

		it ('calls for ways to be calculated', function () {
			_wayParserMock.getResults = function () {
				return {
					ways: [{}],
					coords: []
				};
			};

			_wayCalculatorMock.calculate = function () { return true; };

			_target._afterAllParsed(function (err, res) {
				expect(err).toBeNull();
				expect(res).toBe(true);
			});
		});

		describe ('loadFile', function () {
			// I'm going to skip this, as the amount of logic that isn't boilerplate is minimal.
			// if you're reading this and disagree, its pretty easy to use proxyquire to mock out
			// through2 and etc.  I welcome all pull requests : )
		});
	});
});