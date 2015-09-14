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
			var target = new SingleColorKmlOutput(false, filter);
			var base = new KmlOutput(filter);

			var keys = Object.keys(base);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				expect(target[key] === 0 || target[key]).toBeTruthy();
			}
		});
	});

	describe ('writeSegments', function () {
		it ('given no segments, throws exception', function () {
			expect(new SingleColorKmlOutput(false, filter).writeSegments).toThrow();
		});

		it ('given lots of decimal points, truncates to 6 decimals', function () {
			var segments = [{
				start: {
					lon: 1.234567,
					lat: 4.5678912
				},
				end: {
					lon:9.8765432,
					lat: 123456.456723
				}
			}];

			var result = new SingleColorKmlOutput(false, filter).writeSegments(segments);
			expect(result).toBe('1.234567,4.567891 9.876543,123456.456723 ');
		});

		it ('given few decimal points, pads 6 decimals', function () {
			var segments = [{
				start: {
					lon: 1.23,
					lat: 4.56
				},
				end: {
					lon:9.876,
					lat: 123456.45
				}
			}];

			var result = new SingleColorKmlOutput(false, filter).writeSegments(segments);
			expect(result).toBe('1.230000,4.560000 9.876000,123456.450000 ');
		});

		it ('result has trailing space', function () {
			var segments = [{
				start: {
					lon: 1.23,
					lat: 4.56
				},
				end: {
					lon:9.876,
					lat: 123456.45
				}
			}];

			var result = new SingleColorKmlOutput(false, filter).writeSegments(segments);
			expect(result[result.length - 1]).toBe(' ');
		});
	});

	describe ('getStyles', function () {
		it ('returns an object', function () {
			var result = new SingleColorKmlOutput(false, filter).getStyles();
			
			expect(result).not.toBeNull();
		});

		it ('returns an object that has line styles for keys', function () {
			var result = new SingleColorKmlOutput(false, filter).getStyles();
			
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

			var result = new SingleColorKmlOutput(false, filter).getStyles();
			
			var keys = Object.keys(result);

			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				var value = result[key];

				expect(value.color).toBeTruthy();
				expect(isHexColor(value.color.substring(2))).toBe(true); //(aRGB values)
			}
		});
	});

	describe ('writeWays', function () {
		it ('given no ways, returns empty string', function () {
			var result = new SingleColorKmlOutput(false, filter).writeWays([]);

			expect(result).toBe('');
		});

		it ('given empty way, returns empty string', function () {
			var ways = [{ }];

			var result = new SingleColorKmlOutput(false, filter).writeWays(ways);

			expect(result).toBe('');
		});

		it ('given way with no segments, returns empty string', function () {
			var ways = [{
				segments: null
			}];

			var result = new SingleColorKmlOutput(false, filter).writeWays(ways);

			expect(result).toBe('');
		});

		function getOneWayString(lineStlyeNumber, name) {
			return '	<Placemark>\n' +
                '		<styleUrl>#lineStyle' + lineStlyeNumber + '</styleUrl>\n' +
                '		<name>' + name + '</name>\n' +
                '		<description>seeGetDescriptionTests</description>\n' +
                '		<LineString>\n' +
                '			<tessellate>1</tessellate>\n' +
                '			<coordinates>seeWriteSegmentTests</coordinates>\n' +
                '		</LineString>\n' +
        		'	</Placemark>\n';
		}

		it ('way is less than min curvature', function () {
			var ways = [{
				name: 'some name',
				curvature: 2,
				segments: [{}]
			}];

			var target = new SingleColorKmlOutput(false, new WayFilter(3,3,3,3));
			target.getDescription = function () { return 'seeGetDescriptionTests'; };
			target.writeSegments = function () { return 'seeWriteSegmentTests'; };
			

			var result = target.writeWays(ways);

			expect(result).toBe(getOneWayString(0, 'some name'));
		});

		it ('escapes name, but not whitespaces', function () {
			var ways = [{
				name: 'some name>',
				curvature: 10,
				segments: [{}]
			}];

			var filter = new WayFilter(0, 0, 0, 0);

			var target = new SingleColorKmlOutput(false, filter);
			target.maxCurvature = 100;
			target.getDescription = function () { return 'seeGetDescriptionTests'; };
			target.writeSegments = function () { return 'seeWriteSegmentTests'; };
			

			var result = target.writeWays(ways);

			expect(result).toBe(getOneWayString(2, 'some name%3E'));
		});

		describe ('relative /absolute color tests', function () {
			var ways = [{
				name: 'some name',
				curvature: 10,
				segments: [{}]
			}];

			var filter = new WayFilter(0, 0, 0, 0);

			function getOutputter (relativeColor, maxCurvature) {
				var target = new SingleColorKmlOutput(relativeColor, filter);
				target.maxCurvature = maxCurvature;
				target.getDescription = function () { return 'seeGetDescriptionTests'; };
				target.writeSegments = function () { return 'seeWriteSegmentTests'; };

				return target;
			}

			describe ('absolute', function () {
				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 0;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(1, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 10;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(2, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 40;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(3, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 80;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(6, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 40000;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(506, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(false, 100);

					ways[0].curvature = 60000;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(506, 'some name'));
				});
			});

			describe ('relative', function () {
				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 0;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(1, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 1;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(24, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 40;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(430, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 80;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(498, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 40000;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(511, 'some name'));
				});

				it ('scales lineStyle by curvature', function () {
					var target = getOutputter(true, 100);

					ways[0].curvature = 60000;

					var result = target.writeWays(ways);

					expect(result).toBe(getOneWayString(511, 'some name'));
				});
			});
		});
	});
});