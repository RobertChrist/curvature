/** curvature.js
*
* Find roads that are the most curved or twisty based on Open Street Map (OSM) data.
*
* The goal of this script is to help those who enjoy twisty roads (such as 
* motorcycle or driving enthusiasts) to find promising roads that are not well known.
* It works by calculating a synthetic "curvature" parameter for each road segment
* (known as a "way" in OSM parlance) that represents how twisty that segment is. 
* These twisty segments can then be output as KML files that can be viewed in Google Earth
* or viewed in tabular form.
* 
* About the "curvature" parameter:
* The "curvature" of a way is determined by iterating over every set of three points
* in the line. Each set of three points form a triangle and that triangle has a circumcircle
* whose radius corresponds to the radius of the curve for that set. Since every line
* segment (between two points) is part of two separate triangles, the radius of the curve
* at that segment is considdered to be the average of the radii for its member sets.
* Now that we have a curve radius for each segment we can categorize each segment into
* ranges of radii from very tight (short radius turn) to very broad or straight (long radius turn).
* Once each segment is categorized its length can be multiplied by a weighting (by default
* zero for straight segments, 1 for broad curves, and up to 2 for the tightest curves).
* The sum of all of these weighting gives us a number for curvature that corresponds
* proportionally to the distance (in meters) that you will be in a turn.*
* 
* * If all weights are 1 then the curvature parameter will be exactly the distance
*   in turns. The goal of this project however is to prefer tighter turns, so sharp
*   corners are given an increased weight.
* 
* Original Author: Adam Franco - https://github.com/adamfranco/curvature - Copyright 2012 Adam Franco
* License: GNU General Public License Version 3 or later
*/

var _path = require('path');
var _parser = require('./input/commandLineParser');
var _async = require('async');
var Logger = require('./Logger');
var WayFilter 	 = require('./WayFilter');
var WayCollector = require('./input/WayCollector');
var TabOutput 	 = require('./output/TabOutput');
var SingleColorKmlOutput 	= require('./output/SingleColorKmlOutput');
var MultiColorKmlOutput 	= require('./output/MultiColorKmlOutput');

var getBasename = function (settings, fileName) {
	var basename;
	if (!settings.outputBasename || !settings.outputBasename.value) {
		basename = _path.basename(fileName);
	} else {
		basename = _path.basename(settings.outputBasename.value);
	}

	return basename;
};

var writeKMLFile = function (colorize, kmUnits, defaultFilter, ways, path, basename) {
    var kml = colorize ? new MultiColorKmlOutput(defaultFilter) : new SingleColorKmlOutput(defaultFilter);
    
	if (kmUnits)
		kml.units = 'km';

	kml.write(ways, path, basename);
};

var generateAdditionalKMLFile = function (colorize, optString, defaultFilter, useKM, basename, logger) {
	var filter = new WayFilter(defaultFilter.minLength, defaultFilter.maxLength, defaultFilter.minCurvature, defaultFilter.maxCurvature);

	var opts = optString.split(',');

	for (var i = 0, j = opts.length; i < j; i++) {
		var opt = opts[i];
		opt = opt.split('=');
		var key = opt[0];
		
		if (opt.length < 2) {
			logger.forceLog("Key '" + key + "' passed to --addKML has no value, ignoring.\n");
			continue;
		}

		var value = opt[1];
		if (key === 'colorize') {
			if (typeof value === "number")
				colorize = 1;
			else
				colorize = 0;
		} else if (key === 'minCurvature')
			filter.minCurvature = value;	// when debugging, check that value is a number.
		else if (key === 'maxCurvature')
			filter.maxCurvature = value;
		else if (key === 'minLength')
			filter.minLength = value;
		else if (key === 'maxLength')
			filter.maxLength = value;
		else
			logger.forceLog("Ignoring unknown key '" + key + "'' passed to --addKML\n");
	}

	writeKMLFile(colorize, useKM, filter, collector.getWays(), path, basename);
};

var parseFile = function (settings, fileNameAndPath, collector, filter, logger) {
	logger.log(settings, "Loading {" + fileNameAndPath + "}")

    _async.series([
        function(cb) { collector.loadFile(fileNameAndPath, cb);}
    ], function (err) {
        if (err)
            throw err;
        
        if (settings.tabluarOutput.value) {
            var tab = new TabOutput(filter);
            tab.output(collector.getWays(), logger);
        }
        
        if (settings.noKML.value)
            return;
        
        logger.log(settings, "generating KML output");
        
        var path = !settings.outputPath.value ? _path.dirname(fileNameAndPath) : settings.outputPath.value;
        var basename = getBasename(settings, fileNameAndPath);
        
        writeKMLFile(settings.colorize.value, settings.km.value, filter, collector.getWays(), path, basename);
        
        if (!settings.addKML.value)
            return;
        
        for (var k = 0, l = settings.addKML.value.length; k < l; k++) {
            var optString = settings.addKML.value[k];
            
            generateAdditionalKMLFile(settings.colorize.value, optString, filter, basename, logger);
        }
    });
};


/* ---------- Main Script ---------- */


var config = _parser.parseArgs();
var settings = config.settings;
var logger = new Logger(settings.verbose.value);

var defaultFilter = new WayFilter(settings.minLength.value, 
								   settings.maxLength.value, 
								   settings.minCurvature.value, 
								   settings.maxCurvature.value);

var collector = new WayCollector( logger,
								  settings.verbose.value, 
								  settings.minLatBound.value, 
								  settings.maxLatBound.value, 
								  settings.minLonBound.value, 
								  settings.maxLatBound.value, 
								  settings.wayTypes.value.split(','), 
								  settings.ignoredSurfaces.value.split(','), 
								  settings.straightSegmentSplitThreshold.value, 
								  settings.level1MaxRadius.value, 
								  settings.level1Weight.value, 
								  settings.level2MaxRadius.value, 
								  settings.level2Weight.value, 
								  settings.level3MaxRadius.value, 
								  settings.level3Weight.value, 
								  settings.level4MaxRadius.value, 
								  settings.level4Weight.value);

parseFile(settings, _path.resolve(settings.file.value), collector, defaultFilter, logger);

logger.forceLog("done.");
