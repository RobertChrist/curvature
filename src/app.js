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

var _parser 	 = require('./commandLineParser');
var Config	 	 = require('./Config');
var WayFilter 	 = require('./WayFilter');
var WayCollector= require('./WayCollector');
var TabOutput 	 = require('./curvature.output').TabOutput;
var SingleColorKmlOutput 	= require('./curvature.output').SingleColorKmlOutput;
var MultiColorKmlOutput 	= require('./curvature.output').MultiColorKmlOutput;

var getBasename = function (settings, filename) {
	var basename;
	if (!settings.outputBasename) {
		basename = os.path.basename(fileName);
		parts = os.path.splitext(basename);
		basename = parts[0];
	} else {
		basename = os.path.basename(settings.outputBasename);
	}

	return basename;
};

var writeKMLFile = function (colorize, kmUnits, defaultFilter, ways, path, basename) {
	var kml;
	if (colorize)
		kml = MultiColorKmlOutput(defaultFilter);
	else
		kml = SingleColorKmlOutput(defaultFilter);
	
	if (kmUnits)
		kml.units = 'km';

	kml.write(ways, path, basename);
};

var generateAdditionalKMLFile = function (colorize, optString, defaultFilter, useKM) {
	var filter = copy.copy(defaultFilter);
	var opts = optString.split(',');

	for (var i = 0, j = opts.length; i < j; i++) {
		var opt = opts[i];
		opt = opt.split('=');
		var key = opt[0];
		
		if (opt.length < 2) {
			console.log("Key '" + key + "' passed to --addKML has no value, ignoring.\n");
			continue;
		}

		var value = opt[1];
		if (key === 'colorize') {
			if (typeof value === "number")
				colorize = 1;
			else
				colorize = 0;
		} else if (key === 'minCurvature')
			filter.minCurvature = float(value);
		else if (key == 'maxCurvature')
			filter.maxCurvature = float(value);
		else if (key == 'minLength')
			filter.minLength = float(value);
		else if (key == 'maxLength')
			filter.maxLength = float(value);
		else
			console.log("Ignoring unknown key '" + key + "'' passed to --addKML\n");
	}

	writeKMLFile(colorize, useKM, filter, collector.getWays(), path, basename);
};

var parseFile = function (settings, file, collector, filter) {
	if (settings.verbose)
		console.log("Loading {" + file.name + "}");
		
	collector.loadFile(file.name);
	
	if (args.tabluarOutput) {
		var tab = new TabOutput(filter);
		tab.output(collector.getWays());
	}
	
	if (settings.noKML) 
		return;

	if (settings.verbose) 
		console.log("generating KML output");

	var path = !settings.outputPath ? os.path.dirname(file.name) : settings.outputPath;
	var basename = getBasename(settings, file.name);

	writeKMLFile(settings.colorize, settings.KM, filter, collector.getWays(), path, basename);

	if (!settings.addKML)
		return;

	for (var k = 0, l = settings.addKML.length; k < l; k++) {
		var optString = settings.addKML[k]; 

		generateAdditionalKMLFile(settings.colorize, optString, filter);
	}
};


/* ---------- Main Script ---------- */
var args = _parser.parseArgs();
var config = new Config(args);

var settings = config.settings;

var defaultFilter = new WayFilter(settings.minLength.value, 
								   settings.maxLength.value, 
								   settings.minCurvature.value, 
								   settings.maxCurvature.value);

var collector = new WayCollector(settings.verbose, 
								  settings.minLatBound, 
								  settings.maxLatBound, 
								  settings.minLonBound, 
								  settings.maxLatBound, 
								  settings.wayTypes.split(','), 
								  settings.ignoredSurfaces.split(','), 
								  settings.straightSegmentSplitThreshold, 
								  settings.level1MaxRadius, 
								  settings.level1Weight, 
								  settings.level2MaxRadius, 
								  settings.level2Weight, 
								  settings.level3MaxRadius, 
								  settings.level3Weight, 
								  settings.level4MaxRadius, 
								  settings.level4Weight);

parseFile(settings, settings.file, collector, defaultFilter);

if (settings.verbose)
	console.log("done.");