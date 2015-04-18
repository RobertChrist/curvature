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
var RoadFilter 	 = require('./RoadFilter');
var RoadCollector= require('./RoadCollector');
var TabOutput 	 = require('./curvature.output').TabOutput;
var SingleColorKmlOutput 	= require('./curvature.output').SingleColorKmlOutput;
var MultiColorKmlOutput 	= require('./curvature.output').MultiColorKmlOutput;


var getCollector = function (args) {
	var RoadCollectorConfig = new RoadCollectorConfig()

	var collector = new RoadCollector();
	
	collector.verbose = args.v;
	collector.ignoredSurfaces = args.ignoredSurfaces.split(',');
	collector.roads = args.highwayTypes.split(',');
	collector.level1MaxRadius = args.level1MaxRadius;
	collector.level1Weight = args.level1Weight;
	collector.level2MaxRadius = args.level2MaxRadius;
	collector.level2Weight = args.level2Weight;
	collector.level3MaxRadius = args.level3MaxRadius;
	collector.level3Weight = args.level3Weight;
	collector.level4MaxRadius = args.level4MaxRadius;
	collector.level4Weight = args.level4Weight;
	collector.minLatBound = args.minLatBound;
	collector.maxLatBound = args.maxLatBound;
	collector.minLonBound = args.minLonBound;
	collector.maxLonBound = args.maxLonBound;
	collector.straightSegmentSplitThreshold = args.straightSegmentSplitThreshold * 1609;

	return collector;
};

var getOutputPath = function (args, fileName) {
	var path;
	if (!args.outputPath) 
		path = os.path.dirname(fileName);
	else 
		path = args.outputPath;

	return path;
};

var getBasename = function (args, filename) {
	var basename;
	if (!args.outputBasename) {
		basename = os.path.basename(fileName);
		parts = os.path.splitext(basename);
		basename = parts[0];
	} else {
		basename = os.path.basename(args.outputBasename);
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

	writeKMLFile(colorize, useKM, filter, collector.ways, path, basename);
};

var parseFile = function (args, file, collector, filter) {
	if (args.v)
		console.log("Loading {" + file.name + "}\n");
		
	collector.loadFile(file.name);
	
	// Output our tabular data
	if (args.t) {
		var tab = TabOutput(defaultFilter);
		tab.output(collector.ways);
	}
	
	if (args.noKML) 
		return ;

	if (args.v) 
		console.log("generating KML output\n");

	var path = getOutputPath(args, file.name);
	var basename = getBasename(args, file.name);

	writeKMLFile(args.colorize, args.KM, filter, collector.ways, path, basename);

	if (!args.addKML)
		return;

	for (var k = 0, l = args.addKML.length; k < l; k++) {
		var optString = args.addKML[k]; 

		generateAdditionalKMLFile(args.colorize, optString, filter);
	}
};


/* ---------- Main Script ---------- */
var args = _parser.parseArgs();
var config = new Config(args);

var settings = config.settings;

var defaultFilter = new RoadFilter(settings.minLength.value, 
								   settings.maxLength.value, 
								   settings.minCurvature.value, 
								   settings.maxCurvature.value);

var collector = getCollector(settings);

parseFile(settings, settings.file, collector, defaultFilter);

if (settings.v)
	console.log("done.\n");