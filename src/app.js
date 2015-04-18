/** curvature.py
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
var WayCollector = require('./WayCollector');
var WayFilter 	 = require('./WayFilter');
var TabOutput 	 = require('./curvature.output').TabOutput;
var SingleColorKmlOutput 	= require('./curvature.output').SingleColorKmlOutput;
var MultiColorKmlOutput 	= require('./curvature.output').MultiColorKmlOutput;


var getDefaultFilter = function (args) {
	var defaultFilter = new WayFilter();
	
	defaultFilter.min_length = args.minLength;
	defaultFilter.max_length = args.maxLength;
	defaultFilter.min_curvature = args.minCurvature;
	defaultFilter.max_curvature = args.maxCurvature;

	return defaultFilter;
};

var getCollector = function (args) {
	var collector = new WayCollector();
	
	collector.verbose = args.v;
	collector.ignored_surfaces = args.ignoredSurfaces.split(',');
	collector.roads = args.highwayTypes.split(',');
	collector.level_1_max_radius = args.level1MaxRadius;
	collector.level_1_weight = args.level1Weight;
	collector.level_2_max_radius = args.level2MaxRadius;
	collector.level_2_weight = args.level2Weight;
	collector.level_3_max_radius = args.level3MaxRadius;
	collector.level_3_weight = args.level3Weight;
	collector.level_4_max_radius = args.level4MaxRadius;
	collector.level_4_weight = args.level4Weight;
	collector.min_lat_bound = args.minLatBound;
	collector.max_lat_bound = args.maxLatBound;
	collector.min_lon_bound = args.minLonBound;
	collector.max_lon_bound = args.maxLonBound;
	collector.straight_segment_split_threshold = args.straightSegmentSplitThreshold * 1609;

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
			filter.min_curvature = float(value);
		else if (key == 'maxCurvature')
			filter.max_curvature = float(value);
		else if (key == 'minLength')
			filter.min_length = float(value);
		else if (key == 'maxLength')
			filter.max_length = float(value);
		else
			console.log("Ignoring unknown key '" + key + "'' passed to --addKML\n");
	}

	writeKMLFile(colorize, useKM, filter, collector.ways, path, basename);
};

var parseFile = function (args, file, collector, filter) {
	if (args.v)
		console.log("Loading {" + file.name + "}\n");
		
	collector.load_file(file.name);
	
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

var defaultFilter = getDefaultFilter(args);
var collector = getCollector(args);

for (var i = 0, j = args.file.length; i < j; i++) {
	var file = args.file[i];

	parseFile(args, args.file[i], collector, defaultFilter);
}

if (args.v)
	console.log("done.\n");