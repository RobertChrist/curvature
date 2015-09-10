var proxyquire = require('proxyquire');
var _ = require('lodash');

var WayFilter = require('../../../src/WayFilter');
var OutputService = require('../../../src/output/OutputService');
var Logger = require('../../../src/logging/Logger');

describe ('OutputService.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof OutputService).toBe('function');
		});
	});

	describe('outputResults', function () {
		var logger = new Logger();
		var ways = [{ someKey: 'someValue' }];
		var filter = new WayFilter(1, 1, 1, 1);		
		var path = 'somePath';
		var baseName = 'someBaseName';

		var mockCalledTimes = 0;
		var mockFilter = null;
		var mockUnits = null;
		var mockWays = null;
		var mockPath = null;
		var mockBaseName = null;

		var OutputBaseMock = function (filter) {
			mockFilter = filter;

			this.write = function (calledWays, calledPath, calledBaseName) { 
				mockCalledTimes++;
				mockUnits = this.units;
				mockWays = calledWays;
				mockPath = calledPath;
				mockBaseName = calledBaseName;
			};
		};

		beforeEach(function () {
			mockCalledTimes = 0;
			mockFilter = null;
			mockUnits = null;
			mockWays = null;
			mockPath = null;
			mockBaseName = null;
		});

		function assertMockCalledCorrectly(expectedNumTimes) {
			expect(mockCalledTimes).toBe(expectedNumTimes);
			console.log(mockPath)
			console.log(path)
			expect(_.isEqual(mockWays, ways)).toBe(true);
			expect(_.isEqual(mockPath, path)).toBe(true);
			expect(_.isEqual(mockBaseName, baseName)).toBe(true);
		}

		it ('is a function', function () {
			expect(typeof new OutputService().outputResults).toBe('function');
		});

		describe (' - tab outputter  ', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/TabOutput': OutputBaseMock });

				target = new mockedTarget(logger);
			});

			iit ('given output to screen, outputs to screen', function () {
				target.outputResults(ways, filter, baseName, path, false, false, true, true, false);

				assertMockCalledCorrectly(1);
			});

			it ('told not to log, does not output to screen', function () {
				target.outputResults(ways, filter, baseName, path, false, false, false, true, false);

				assertMockCalledCorrectly(0);
			});
		});
		
		describe (' - single color kml outputter', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/SingleColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);
			});

			it ('file writes kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, false, false, false, false);

				assertMockCalledCorrectly(1);
			});

			it ('does not write kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, false, false, true, false);

				assertMockCalledCorrectly(0);
			});

			it ('uses km values', function () {
				target.outputResults(ways, filter, baseName, path, false, true, false, false, false);

				expect(mockUnits).toBe('km');
			});

			it ('uses miles', function () {
				target.outputResults(ways, filter, baseName, path, false, false, false, false, false);

				expect(mockUnits).toBe(undefined);
			});
		});
		
		describe (' - multi color kml outputter', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/MultiColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);
			});

			it ('writes kml file', function () {
				target.outputResults(ways, filter, baseName, path, true, false, false, false, false);

				assertMockCalledCorrectly(1);
			});

			it ('does not write kml file', function () {
				target.outputResults(ways, filter, baseName, path, true, false, false, true, false);

				assertMockCalledCorrectly(0);
			});

			it ('uses km values', function () {
				target.outputResults(ways, filter, baseName, path, true, true, false, false, false);

				expect(mockUnits).toBe('km');
			});

			it ('uses miles', function () {
				target.outputResults(ways, filter, baseName, path, true, false, false, false, false);

				expect(mockUnits).toBe(undefined);
			});
		});

		describe (' - additional kml files', function () {
			var target;

			it ('write multicolored', function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/MultiColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, false, true, ['colorize=1,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0']);

				assertMockCalledCorrectly(1);
			});

			it ('write singlecolored', function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/SingleColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, false, true, ['colorize=0,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0']);

				assertMockCalledCorrectly(1);
			});

			it ('updates filter settings', function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/SingleColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, false, true, ['colorize=0,minLength=2,maxLength=2,minCurvature=2,maxCurvature=2']);

				expect(mockFilter.minLength).toBe(2);
				expect(mockFilter.maxLength).toBe(2);
				expect(mockFilter.minCurvature).toBe(2);
				expect(mockFilter.maxCurvature).toBe(2);
			});

			it ('respects default filter settings', function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/SingleColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, false, true, ['colorize=0']);

				expect(mockFilter.minLength).toBe(1);
				expect(mockFilter.maxLength).toBe(1);
				expect(mockFilter.minCurvature).toBe(1);
				expect(mockFilter.maxCurvature).toBe(1);
			});

			it ('can write multiple files', function () {
				var mockedTarget = proxyquire('../../../src/output/OutputService', {'./writers/SingleColorKmlOutput': OutputBaseMock });

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, false, true, ['colorize=0', 'colorize=0']);

				assertMockCalledCorrectly(2);
			});
		});
	});
});