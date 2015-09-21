var _ = require('lodash');
var _fs = require('fs');
var _path = require('path');
var _childProcess = require('child_process');
var _xml2js = require('xml2js');
var Config = require('../../src/input/Config');
var deepSorter = require('deep-sort-object');

ddescribe('Single Color integration tests, node output matches master', function () {
	var _originalTimeout;
	var _config;
	var _xmlParser = new _xml2js.Parser();

	function runApp(arguments, cb) {
		var command = 'node ' + _path.resolve('src/app.js') + arguments + ' --file ./spec/integration/testData/auckland_new-zealand.osm.pbf --outputPath "' + _path.resolve('spec/integration/actualResults/0 - AllDefaults') + '"';
		
console.log(command);

		_childProcess.exec(command, function (err, enc, data) {
			cb(err, data);
		});
	}

	function convertToJson(relativePath, cb) {
		var location = _path.resolve(relativePath);

		_fs.readFile(location, function(err, data) {
			if (err) return cb(err);

			_xmlParser.parseString(data, cb);
		});
	}

	beforeEach(function () {
		_originalTimeout = jasmine.getEnv().defaultTimeoutInterval;

		jasmine.getEnv().defaultTimeoutInterval = 60000;

		_config = new Config();
	});

	afterEach(function () {
		jasmine.getEnv().defaultTimeoutInterval = _originalTimeout;
	});

	iit ('with all defaults', function (done) {
		runApp('', function (err, data) {
			if (err) return done(err);

			convertToJson('spec/integration/expectedResults/0 - AllDefaults/auckland_new-zealand.c_300.kml', function (err, expectedJson) {
				if (err) return done(err);

				convertToJson('spec/integration/actualResults/0 - AllDefaults/auckland_new-zealand.c_300.kml', function (err, actualJson) {
					if (err) return done(err);

					expectedJson = deepSorter(expectedJson);
					actualJson = deepSorter(actualJson);

_fs.writeFileSync('/home/bobito/expected', JSON.stringify(expectedJson));
_fs.writeFileSync('/home/bobito/actual', JSON.stringify(actualJson));

					expect(_.isEqual(expectedJson, actualJson)).toBe(true);
					done();
				});
			});
		});
	});
	
	it ('with verbose on', function (done) {
		_config.updateSettingsByName({ 'v': true });
	});
	
	it ('with tabulator output on', function (done) {
		_config.updateSettingsByName({ 't': true });
	});
	
	it ('with no kml output on', function (done) {
		_config.updateSettingsByName({ 'noKML': true });
	});
	
	it ('with miles on', function (done) {
		_config.updateSettingsByName({ 'km': false });
	});
	
	it ('with limitPoints set to 1', function (done) {
		_config.updateSettingsByName({ 'limitPoints': 1 });
	});
	
	it ('with limitPoints set to 3', function (done) {
		_config.updateSettingsByName({ 'limitPoints': 3 });
	});
	
	it ('with limitPoints set to 30', function (done) {
		_config.updateSettingsByName({ 'limitPoints': 30 });
	});
	
	it ('with relative color on', function (done) {
		_config.updateSettingsByName({ 'relativeColor': true });
	});
	
	it ('with output base name specified', function (done) {
		_config.updateSettingsByName({ 'outputBaseName': 'exampleBaseName' });
	});
	
	it ('with minLength specified', function (done) {
		_config.updateSettingsByName({ 'minLength': 5 });
	});
	
	it ('with maxLength specified', function (done) {
		_config.updateSettingsByName({ 'maxLength': 8 });
	});
	
	it ('with min curvature set', function (done) {
		_config.updateSettingsByName({ 'minCurvature': 300 });
	});
	
	it ('with max curvature set to different values', function () {
		_config.updateSettingsByName({ 'maxCurvature': 500 });
	});
	
	it ('with maxRadii specified', function (done) {
		_config.updateSettingsByName({ 
			'level1MaxRadius': 200,
			'level2MaxRadius': 175,
			'level3MaxRadius': 100,
			'level4MaxRadius': 60, 
		});
	});
	
	it ('with maxRadii specified to higher values', function (done) {
		_config.updateSettingsByName({ 
			'level1MaxRadius': 300,
			'level2MaxRadius': 275,
			'level3MaxRadius': 200,
			'level4MaxRadius': 160, 
		});
	});
	
	it ('with level weights specified', function (done) {
		_config.updateSettingsByName({ 
			'level1Weight': 2,
			'level2Weight': 2.5,
			'level3Weight': 3,
			'level4Weight': 3.5, 
		});
	});
	
	it ('with level weights specified to higher values', function (done) {
		_config.updateSettingsByName({ 
			'level1Weight': 20,
			'level2Weight': 25,
			'level3Weight': 30,
			'level4Weight': 35, 
		});
	});
	
	it ('with min/max lat/lon specified', function (done) {
		expect(true).toBe(false);
	});
	
	it ('with min/max lat/lon specified to different values', function (done) {
		expect(true).toBe(false);
	});
	
	it ('with non-default ignored surfaces', function (done) {
		_config.updateSettingsByName({ 
			'ignoredSurfaces': 'dirt,unpaved,ground'
		});
	});
	
	it ('with non-default way types', function (done) {
		_config.updateSettingsByName({ 
			'highwayTypes': 'secondary,motorway_link,road,trunk,trunk_link,unclassified'
		});
	});
	
	it ('with straight segments split threshold specified', function (done) {
		_config.updateSettingsByName({ 
			'straightSegmentSplitThreshold': 4000
		});
	});
	
	it ('with straight segments split threshold specified to a different value', function (done) {
		_config.updateSettingsByName({ 
			'straightSegmentSplitThreshold': 8000
		});
	});
	
	it ('with all set', function (done) {
		expect(true).toBe(false);
	});
	

	describe ('add kml', function () {
		it ('with default values', function (done) {});
		
		it ('with min/max curvature set', function (done) {
			_config.updateSettingsByName({ 
				'noKML': true,
				'addKML': ['minCurvature=300,maxCurvature=500']
			});
		});
		
		it ('with min/max length set', function (done) {
			_config.updateSettingsByName({ 
				'noKML': true,
				'addKML': ['minLength=3,maxLength=8']
			});
		});
		
		it ('with limit points set', function (done) {
			_config.updateSettingsByName({ 
				'noKML': true,
				'addKML': ['limitPoints=30']
			});
		});
		
		it ('with relative color set', function (done) {
			_config.updateSettingsByName({ 
				'noKML': true,
				'addKML': ['relativeColor=1']
			});
		});
		
		it ('with output _path set', function (done) {
			expect(false).toBe(true);
		});
		
		it ('with all of the above set', function (done) {});
		
	});
});
