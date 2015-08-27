var Config = require('../src/Config');

// A new Config object.
var _target;

describe('Config', function () {

	beforeEach(function () {
		 _target = new Config();
	});

	describe('Constructor', function () {
		it('is a function', function () {
			expect(typeof Config).toBe('function');
		});
	});

	describe('Settings', function () {
		it ('has 28 properties', function () {
			expect(Object.keys(_target.settings).length).toBe(28);
		});
	});

	describe('updateSettingsByName', function () {
		/* A Config object with all properties set to either default values, 
		 * or specified values, so config.validate will not throw an exception
		 * in its current state.
		 */
		function getNewFullyValidatedTarget() {
			var fullyValidatedTarget = new Config();
			fullyValidatedTarget.updateSettingsByName({file: 'someFile.osm.pbf'});
			return fullyValidatedTarget;
		}

		it ('updates the settings object according to the passed in values.', function () {
			function getSettingsKeyByName (name) {
				var keys = Object.keys(_target.settings);
				for (var i = 0, j = keys.length; i < j; i++) {
					var key = keys[i];

					if (_target.settings[key].name === name)
						return key;
				}
			}

			var updater = {
				'v': true,
				't': true,
				'noKML': true,
				'km': false,	// km is true by default
				'colorize': true,
				'file': 'filename.osm.pbf',
				'outputPath': 'filePath',
				'outputBaseName': 'baseName',
				'minLength': 11,
				'maxLength': 12,
				'minCurvature': 13,
				'maxCurvature': 14,
				'straightSegmentSplitThreshold': 15,
				'level1MaxRadius': 19,
				'level2MaxRadius': 18,
				'level3MaxRadius': 17,
				'level4MaxRadius': 16,
				'level1Weight': 101,
				'level2Weight': 102,
				'level3Weight': 103,
				'level4Weight': 104,
				'minLatBound': 105,
				'maxLatBound': 106,
				'minLonBound': 107,
				'maxLonBound': 108,
				'addKML': 'someValues',
				'ignoredSurfaces': 'value1,value2',
				'highwayTypes': 'value3,value4'
			};

			_target.updateSettingsByName(updater);

			var keys = Object.keys(updater)
			for (var i = 0, j = keys.length; i < j; i++) {
				var key = keys[i];

				var settingsParam = getSettingsKeyByName(key);
				expect(_target.settings[settingsParam].value).toBe(updater[key]);
			}
		});
		
		it ('Ignores values that arent settings keys', function () {
			var updater = {
				'v': true,
				'n': true,
				'file': 'filename.osm.pbf',
				't': true
			};

			_target.updateSettingsByName(updater);

			expect(_target.settings.verbose.value).toBe(true);
			expect(_target.settings.tabularOutput.value).toBe(true);
		});

		it ('Throws an error if a non-optional parameter is set to null', function () {
			function getNonOptionalParams() {
				var settingsKeys = Object.keys(_target.settings);

				var nonOptionalKeys = [];
				for (var i = 0, j = settingsKeys.length; i < j; i++) {
					var key = settingsKeys[i];
					if (!_target.settings[key].optional)
						nonOptionalKeys.push(key);
				}

				return nonOptionalKeys;
			}

			var nonOptionalKeys = getNonOptionalParams();
			var optKey;

			var target = getNewFullyValidatedTarget();
			while (optKey = nonOptionalKeys.pop()) {
				var keyName = _target.settings[optKey].name;

				var updater = {};
				updater[keyName] = null;

				expect(function () { target.updateSettingsByName(updater) }).toThrow();
			}
		});

		it ('Throws a validation error if max radii are out of order', function () {
			var updaters = [{
				level1MaxRadius: 5,
				level2MaxRadius: 10
			}, {
				level2MaxRadius: 5,
				level3MaxRadius: 10
			}, {
				level3MaxRadius: 5,
				level4MaxRadius: 10
			}, {
				level1MaxRadius: 5,
				level3MaxRadius: 10
			}, {
				level2MaxRadius: 5,
				level4MaxRadius: 10
			}, {
				level1MaxRadius: 5,
				level4MaxRadius: 10
			}];

			var updater;
			var target = getNewFullyValidatedTarget();
			while (updater = updaters.pop()) {
				expect(function () { target.updateSettingsByName(updater) }).toThrow();	
			}
		});

		it ('Throws a validation error if any max radii are < 0', function () {
			var radiikeys = ['level1MaxRadius', 'level2MaxRadius', 'level3MaxRadius', 'level4MaxRadius'];

			var target = getNewFullyValidatedTarget();
			var key;
			while (key = radiikeys.pop()) {
				var updater = {};
				updater[key] = -1;
				expect(function () { target.updateSettingsByName(updater) }).toThrow();	
			}
		});

		it ('Throws a validation error if min way length is less than 0', function () {
			var target = getNewFullyValidatedTarget();
			expect(function () { target.updateSettingsByName({ minLength: -1 }); }).toThrow();	
		});

		it ('Throws a validation error if max way length is less than 0', function () {
			var target = getNewFullyValidatedTarget();
			expect(function () { target.updateSettingsByName({ maxLength: -1 }); }).toThrow();	
		});

		it ('Throws a validation error if straightSegmentSplitThreshold === 0', function () {
			var target = getNewFullyValidatedTarget();
			expect(function () { target.updateSettingsByName({ straightSegmentSplitThreshold: 0 }); }).toThrow();	
		});

		it ('Throws a validation error if straightSegmentSplitThreshold < 0', function () {
			var target = getNewFullyValidatedTarget();
			expect(function () { target.updateSettingsByName({ straightSegmentSplitThreshold: -1 }); }).toThrow();	
		});

		it ('Throws a validation error if file is not of type osm.pbf', function () {
			var target = getNewFullyValidatedTarget();
			expect(function () { target.updateSettingsByName({ file: 'someFileName.txt' }); }).toThrow();	
			expect(function () { target.updateSettingsByName({ file: 'someFileName.osm' }); }).toThrow();	
			expect(function () { target.updateSettingsByName({ file: 'someFileName.osm.bz2' }); }).toThrow();	
		});

		it ('Does not update the settings, if the update failed validation', function () {
			var target = getNewFullyValidatedTarget();

			var originalFileValue = target.settings.file.value;

			try {
				target.updateSettingsByName({ file: 'someFileName.txt' });
			} catch (err) {}

			expect(target.settings.file.value).toBe(originalFileValue);
			expect(target.settings.file.value).not.toBe('someFileName.txt');
		})
	});
});