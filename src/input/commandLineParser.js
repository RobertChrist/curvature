var Config = require('../Config');
var ArgumentParser = require('argparse').ArgumentParser;

var config = new Config();
var settings = config.settings;

// The config options.
var args = [
	[ ['--' + settings.verbose.name],   		{ action: 'storeTrue',  defaultValue: settings.verbose.value,  			help: 'Display additional logging.' }],
	[ ['--' + settings.tabularOutput.name],   	{ action: 'storeTrue',  defaultValue: settings.tabularOutput.value, 	help: 'Display tabular output' }],
	[ ['--' + settings.noKML.name],    			{ action: 'storeTrue',  defaultValue: settings.noKML.value, 			help: 'Do not generate a KML file. By default a KML file is generated with the name of the input file followed by .kml' }],
	[ ['--' + settings.km.name],   				{ action: 'storeTrue',  defaultValue: settings.km.value, 				help: 'Output kilometers instead of miles.' }],
	[ ['--' + settings.colorize.name],   		{ action: 'storeTrue',  defaultValue: settings.colorize.value, 			help: 'Colorize KML lines based on the curvature of the road at each segment. Without this option roads will be lines of a single color. For large regions this may make Google Earth run slowly.' }],
	[ ['--' + settings.file.name],   			{ type: 'string',	    defaultValue: settings.file.value, 				help: 'the input file. Should be an OSM XML file.' }],
	[ ['--' + settings.outputPath.name],   		{ type: 'string', 		defaultValue: settings.outputPath.value, 		help: 'The path under which output files should be written' }],
	[ ['--' + settings.outputBaseName.name],   	{ type: 'string', 		defaultValue: settings.outputBaseName.value,	help: 'The base of the name for output files. This will be appended with a suffix and extension' }],
	[ ['--' + settings.minLength.name],   		{ type: 'float', 		defaultValue: settings.minLength.value, 		help: 'the minimum length of a way that should be included, in miles, 0 for no minimum. The default is 2.0' }],
	[ ['--' + settings.maxLength.name],   		{ type: 'float', 		defaultValue: settings.maxLength.value, 		help: 'the maximum length of a way that should be included, in miles, 0 for no maximum. The default is 0' }],
	[ ['--' + settings.minCurvature.name],   	{ type: 'float', 		defaultValue: settings.minCurvature.value, 		help: 'the minimum curvature of a way that should be included, 0 for no minimum. The default is 300 which catches most twisty roads.' }],
	[ ['--' + settings.maxCurvature.name],   	{ type: 'float', 		defaultValue: settings.maxCurvature.value, 		help: 'the maximum curvature of a way that should be included, 0 for no maximum. The default is 0' }],
	[ ['--' + settings.level1MaxRadius.name],   { type: 'int', 			defaultValue: settings.level1MaxRadius.value,	help: 'the maximum radius of a curve (in meters) that will be considered part of level 1. Curves with radii larger than this will be considered straight. The default is 175' }],
	[ ['--' + settings.level1Weight.name],    	{ type: 'float', 		defaultValue: settings.level1Weight.value, 		help: 'the weight to give segments that are classified as level 1. Default 1' }],
	[ ['--' + settings.level2MaxRadius.name],   { type: 'int', 			defaultValue: settings.level2MaxRadius.value,	help: 'the maximum radius of a curve (in meters) that will be considered part of level 2. The default is 100' }],
	[ ['--' + settings.level2Weight.name],     	{ type: 'float', 		defaultValue: settings.level2Weight.value, 		help: 'the weight to give segments that are classified as level 2. Default 1.3' }],
	[ ['--' + settings.level3MaxRadius.name],   { type: 'int', 			defaultValue: settings.level3MaxRadius.value,	help: 'the maximum radius of a curve (in meters) that will be considered part of level 3. The default is 60' }],
	[ ['--' + settings.level3Weight.name],     	{ type: 'float', 		defaultValue: settings.level3Weight.value,   	help: 'the weight to give segments that are classified as level 3. Default 1.6' }],
	[ ['--' + settings.level4MaxRadius.name],   { type: 'int', 			defaultValue: settings.level4MaxRadius.value,	help: 'the maximum radius of a curve (in meters) that will be considered part of level 4. The default is 30' }],
	[ ['--' + settings.level4Weight.name],     	{ type: 'float', 		defaultValue: settings.level4Weight.value, 		help: 'the weight to give segments that are classified as level 4. Default 2' }],
	[ ['--' + settings.minLatBound.name],   	{ type: 'float', 		defaultValue: settings.minLatBound.value, 		help: 'The minimum latitude to include.'}],
	[ ['--' + settings.maxLatBound.name],   	{ type: 'float', 		defaultValue: settings.maxLatBound.value, 		help: 'The maximum latitude to include.' }],
	[ ['--' + settings.minLonBound.name],   	{ type: 'float', 		defaultValue: settings.minLonBound.value, 		help: 'The minimum longitude to include.' }],
	[ ['--' + settings.maxLonBound.name],   	{ type: 'float', 		defaultValue: settings.maxLonBound.value, 		help: 'The maximum longitude to include.' }],
	[ ['--' + settings.ignoredSurfaces.name],   { type: 'string',  		defaultValue: settings.ignoredSurfaces.value,	help: 'a list of the surfaces that should be ignored. The default is dirt,unpaved,gravel,sand,grass,ground' }], 
	[ ['--' + settings.wayTypes.name],       	{ type: 'string', 	    defaultValue: settings.wayTypes.value, 	    	help: 'a list of the highway types that should be included. The default is secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' }],
	[ ['--' + settings.addKML.name],   			{ type: 'string',		metavar: 'PARAMETERS',	action: 'append', 		help: 'Output an additional KML file with alternate output parameters. PARAMETERS should be a comma-separated list of option=value that may include any of the following options: colorize, min_curvature, max_curvature, min_length, and max_length. Example: --add_kml colorize=1,min_curvature=1000' }],
	[ ['--' + settings.straightSegmentSplitThreshold.name],    { type: 'float', 	defaultValue: settings.straightSegmentSplitThreshold.value, help: 'If a way has a series of non-curved segments longer than this (miles), the way will be split on that straight section. Use 0 to never split ways. The default is 1.5' }]
];

var argParser = new ArgumentParser({
	description: 'Find the roads that are most twisty in an Open Street Map (OSM) XML file.'
});

args.map(function (arg) {
	argParser.addArgument(arg[0], arg[1]);
});

/* Reads the arguments on the command line that were passed into this exe, 
 * and returns a configuration object with the requested settingss.  Will additionally
 * validate the user input, and throw exceptions as necessary.
 */
exports.parseArgs = function () {
	var results = argParser.parseArgs();

	config.updateSettingsByName(results);

	return config;
}