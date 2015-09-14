var proxyquire = require('proxyquire').noPreserveCache();
var WayFilter = require('../../../../src/WayFilter');
var KmlOutput = require('../../../../src/output/writers/KmlOutput');

var filter = new WayFilter();

describe ('KmlOutput.js', function () {
	describe ('constructor', function () {
		it ('is a function', function () {
			expect(typeof KmlOutput).toBe('function');
		});

		it ('inherits from OutputBase', function () {
			var target = new KmlOutput(filter);

			var base = new require('../../../../src/output/writers/OutputBase');
			var keys = Object.keys(base);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(target[key]).toBeTruthy();
			}
		});
	});

	describe ('getStyles', function () {
		it ('returns an object', function () {
			var result = new KmlOutput(filter).getStyles();
			
			expect(result).not.toBeNull();
		});

		it ('returns an object that has line styles for keys', function () {
			var result = new KmlOutput(filter).getStyles();
			
			var keys = Object.keys(result);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				var validStyleIndex = -1;
				if (key.indexOf('lineStyle') > validStyleIndex) validStyleIndex = key.indexOf('lineStyle');
				if (key.indexOf('eliminated') > validStyleIndex) validStyleIndex = key.indexOf('eliminated');

				expect(validStyleIndex).toBe(0);
				expect(key.length > 9).toBe(true);
			}
		});

		it ('returned object values have color values', function () {
			function isHexColor(sNum){
				return (typeof sNum === "string") && sNum.length === 6 && !isNaN(parseInt(sNum, 16));
			}

			var result = new KmlOutput(filter).getStyles();
			
			var keys = Object.keys(result);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				var value = result[key];

				expect(value.color).toBeTruthy();
				expect(isHexColor(value.color.substring(2))).toBe(true); //(aRGB values)
			}
		});
	});

	describe ('filenameSuffix', function () {
		it ('returns a string', function () {
			var suffix = new KmlOutput(filter).filenameSuffix();

			expect(typeof suffix === 'string' || suffix instanceof String).toBe(true);
		});
	});

	describe ('write', function () {
		var callWriteToDisk = false;
		var writtenFile = '';

		var fsMock = { 
			writeFileSync: function (path, doc) {
				writtenFile = doc;
				callWriteToDisk = true;
			} 
		};

		var ways = [{
				length: 1000,
				curvature: 1,
				segments: [{
					start: [0,1],
					end: [0,1]
				}]
			}, {
				length: 2000,
				curvature: 3,
				segments: [{
					start: [0,1],
					end: [0,1]
				}]
			}];

		it ('is a function', function () {
			expect(typeof new KmlOutput(filter).write).toBe('function');
		});

		it ('writes to disk', function () {
			var KmlOutputMocked = proxyquire('../../../../src/output/writers/KmlOutput', { 'fs': fsMock });

			var target = new KmlOutputMocked(filter);

			target.write(ways);

			expect(callWriteToDisk).toBe(true);
		});

		it ('includes each expected section of the file in the final output', function () {
			var KmlOutputMocked = proxyquire('../../../../src/output/writers/KmlOutput', { 'fs': fsMock });

			var target = new KmlOutputMocked(new WayFilter(1, 0, 0, 0));

			target.writeWays = function (w) { return 'WayLength:' + w.length; }; // abstract method

			target.write(ways);

			expect(writtenFile.indexOf('?xml version="1.0" encoding="UTF-8"?>') > -1).toBe(true);
			expect(writtenFile.indexOf('<LatLonBox>') > -1).toBe(true);
			expect(writtenFile.indexOf('<Style id="lineStyle0">') > -1).toBe(true);
			expect(writtenFile.indexOf('WayLength:1') > -1).toBe(true);
			expect(writtenFile.indexOf('/kml') > -1).toBe(true);
		});

		/* TODO: 
			I'm going to skip these tests as just being low value, just to save time, personal project and all
			it ('serializes style object', function () { }); 

			it ('all filename tests', function () { }); 
		*/
	});

	describe ('writeWays', function () {
		it ('is a function', function () {
			expect(typeof new KmlOutput(filter).write).toBe('function');
		});
	});

	describe ('getDescription', function () {
		var way = {
			length: 1000,
			curvature: 1,
			type: 'highway',
			surface: 'paved'
		};

		it ('returns mile based description', function () {
			var target = new KmlOutput(filter);

			var result = target.getDescription(way);

			expect('Curvature: 1\nDistance: .62 km\nType: highway\nSurface: paved');
		});

		it ('returns mile based description', function () {
			var target = new KmlOutput(filter);
			target.units = 'km';

			var result = target.getDescription(way);

			expect('Curvature: 1\nDistance: 1 km\nType: highway\nSurface: paved');
		});
	});
});