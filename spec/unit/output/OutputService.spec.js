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
		var mockRelativeColor = false;


		function getOutputMock(mockType) {
			var mockWrite = function (calledWays, calledPath, calledBaseName) { 
				mockCalledTimes++;
				mockUnits = this.units;
				mockWays = calledWays;
				mockPath = calledPath;
				mockBaseName = calledBaseName;
			};

			var returnMe;
			if (mockType === 'SingleColorKmlOutput')
				returnMe = function (relativeColor, filter) { mockFilter = filter; mockRelativeColor = relativeColor; this.write = mockWrite; };
			else if (mockType === 'ReducedPointsSingleColorKmlOutput')
				returnMe = function (limitPoints, relativeColor, filter) { mockFilter = filter; mockRelativeColor = relativeColor; this.write = mockWrite; }
			else if (mockType === 'MultiColorKmlOutput' || mockType === 'TabOutput')
				returnMe = function (filter) { mockFilter = filter; this.write = mockWrite;  }

			var locationString = './writers/' + mockType;
			var proxyQuireMock = {};
			proxyQuireMock[locationString] = returnMe;

			return proxyquire('../../../src/output/OutputService', proxyQuireMock);
		}

		beforeEach(function () {
			mockCalledTimes = 0;
			mockFilter = null;
			mockUnits = null;
			mockWays = null;
			mockPath = null;
			mockBaseName = null;
		});

		function assertMockCalled(altPath) {
			var expectedPath = altPath ? altPath : path;

			expect(mockCalledTimes).toBe(1);
			expect(_.isEqual(mockWays, ways)).toBe(true);
			expect(_.isEqual(mockPath, expectedPath)).toBe(true);
			expect(_.isEqual(mockBaseName, baseName)).toBe(true);
		}

		it ('is a function', function () {
			expect(typeof new OutputService().outputResults).toBe('function');
		});

		describe (' - tab outputter  ', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = getOutputMock('TabOutput');

				target = new mockedTarget(logger);
			});

			it ('given output to screen, outputs to screen', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, true, true, false);

				expect(mockCalledTimes).toBe(1);
				expect(_.isEqual(mockWays, ways)).toBe(true);
			});

			it ('told not to log, does not output to screen', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, false);

				expect(mockCalledTimes).toBe(0);
			});
		});

		describe (' - ReducedPoints SingleColor Outputter', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = getOutputMock('ReducedPointsSingleColorKmlOutput');

				target = new mockedTarget(logger);
			});

			it ('reduced kml writer is chosen if true, and multicolored isnt', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 4, false, false, false, false);

				assertMockCalled();
			});

			it ('reduced kml writer is not chosen if multicolored is true', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 4, false, false, true, false);

				expect(mockCalledTimes).toBe(0);
			});

			it ('reduced kml writer is not chosen if if false', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, false, false, true, false);

				expect(mockCalledTimes).toBe(0);
			});

			it ('uses km values', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 4, true, false, false, false);

				expect(mockUnits).toBe('km');
			});

			it ('uses miles', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 4, false, false, false, false);

				expect(mockUnits).toBe(undefined);
			});

			it ('with relative color', function () {
				target.outputResults(ways, filter, baseName, path, true, false, 4, false, false, false, false);

				expect(mockRelativeColor).toBe(true);
			});

			it ('without relative color', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 4, false, false, false, false);

				expect(mockRelativeColor).toBe(false);
			});
		});

		describe (' - single color kml outputter', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);
			});

			it ('file writes kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, false, false);

				assertMockCalled();
			});

			it ('does not write kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, false);

				expect(mockCalledTimes).toBe(0);
			});

			it ('uses km values', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, true, false, false, false);

				expect(mockUnits).toBe('km');
			});

			it ('uses miles', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, false, false);

				expect(mockUnits).toBe(undefined);
			});

			it ('with relative color', function () {
				target.outputResults(ways, filter, baseName, path, true, false, 0, false, false, false, false);

				expect(mockRelativeColor).toBe(true);
			});

			it ('without relative color', function () {
				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, false, false);

				expect(mockRelativeColor).toBe(false);
			});
		});
		
		describe (' - multi color kml outputter', function () {
			var target;

			beforeEach(function () {
				var mockedTarget = getOutputMock('MultiColorKmlOutput');

				target = new mockedTarget(logger);
			});

			it ('writes kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, false, false, false, false);

				assertMockCalled();
			});

			it ('does not write kml file', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, false, false, true, false);

				expect(mockCalledTimes).toBe(0);
			});

			it ('uses km values', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, true, false, false, false);

				expect(mockUnits).toBe('km');
			});

			it ('uses miles', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, false, false, false, false);

				expect(mockUnits).toBe(undefined);
			});

			it ('with relative color', function () {
				target.outputResults(ways, filter, baseName, path, true, true, 0, false, false, false, false);

				expect(mockRelativeColor).toBe(false);
			});

			it ('without relative color', function () {
				target.outputResults(ways, filter, baseName, path, false, true, 0, false, false, false, false);

				expect(mockRelativeColor).toBe(false);
			});
		});

		describe (' - additional kml files', function () {
			var target;

			it ('write multicolored', function () {
				var mockedTarget = getOutputMock('MultiColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=1,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0']);

				assertMockCalled();
			});

			it ('write singlecolored', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0']);

				assertMockCalled();
			});

			it ('write singlecolored (limitPoints)', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0,limitPoints=0']);

				assertMockCalled();
			});

			it ('write multicolored (limitPoints)', function () {
				var mockedTarget =  getOutputMock('MultiColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=1,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0,limitPoints=0']);

				assertMockCalled();
			});

			it ('write multicolored (limitPoints - 5)', function () {
				var mockedTarget = getOutputMock('MultiColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=1,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0,limitPoints=5']);

				assertMockCalled();
			});

			it ('write limitPoints', function () {
				var mockedTarget = getOutputMock('ReducedPointsSingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0,minLength=0,maxLength=0,minCurvature=0,maxCurvature=0,limitPoints=5']);

				assertMockCalled();
			});

			it ('updates filter settings', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0,minLength=2,maxLength=2,minCurvature=2,maxCurvature=2']);

				expect(mockFilter.minLength).toBe(2);
				expect(mockFilter.maxLength).toBe(2);
				expect(mockFilter.minCurvature).toBe(2);
				expect(mockFilter.maxCurvature).toBe(2);
			});

			it ('respects default filter settings', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0']);

				expect(mockFilter.minLength).toBe(1);
				expect(mockFilter.maxLength).toBe(1);
				expect(mockFilter.minCurvature).toBe(1);
				expect(mockFilter.maxCurvature).toBe(1);
			});


			it ('respects default relative color settings', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				new mockedTarget(logger).outputResults(ways, filter, baseName, path, true, false, 0, false, false, true, ['minLength=2']);

				expect(mockRelativeColor).toBe(true);
			});

			it ('can specifiy relative color', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				new mockedTarget(logger).outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['minLength=2,relativeColor=1']);

				expect(mockRelativeColor).toBe(true);
			});

			it ('does not have to be relative color', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				new mockedTarget(logger).outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['minLength=2']);

				expect(mockRelativeColor).toBe(false);
			});

			it ('respects default colorize settings', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['minLength=2,maxLength=2,minCurvature=2,maxCurvature=2']);

				assertMockCalled();
			});

			it ('respects default limit Points settings', function () {
				var mockedTarget = getOutputMock('ReducedPointsSingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 3, false, false, true, ['minLength=2,maxLength=2,minCurvature=2,maxCurvature=2']);

				assertMockCalled();
			});

			it ('can have alternative path', function () {
				var mockedTarget = getOutputMock('ReducedPointsSingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 3, false, false, true, ['outputPath=asdf']);

				assertMockCalled('asdf');
			});

			it ('can write multiple files', function () {
				var mockedTarget = getOutputMock('SingleColorKmlOutput');

				target = new mockedTarget(logger);

				target.outputResults(ways, filter, baseName, path, false, false, 0, false, false, true, ['colorize=0', 'colorize=0']);

				expect(mockCalledTimes).toBe(2);
			});


		});
	});
});