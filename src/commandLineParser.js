var Config = require('./Config');
var ArgumentParser = require('argparse').ArgumentParser;

var config = new Config();
var setting = config.settings;

// The config options.
var args = [
	[ ['--' + setting.verbose.name],   			{ action: 'storeTrue',  defaultValue: setting.verbose.value,  		help: 'Display additional logging.' }],
	[ ['--' + setting.tabluarOutput.name],   	{ action: 'storeTrue',  defaultValue: setting.tabluarOutput.value,  help: 'Display tabular output' }],
	[ ['--' + setting.noKML.name],    			{ action: 'storeTrue',  defaultValue: setting.noKML.value, 			help: 'Do not generate a KML file. By default a KML file is generated with the name of the input file followed by .kml' }],
	[ ['--' + setting.km.name],   				{ action: 'storeTrue',  defaultValue: setting.km.value, 			help: 'Output kilometers instead of miles.' }],
	[ ['--' + setting.colorize.name],   		{ action: 'storeTrue',  defaultValue: setting.colorize.value, 		help: 'Colorize KML lines based on the curvature of the road at each segment. Without this option roads will be lines of a single color. For large regions this may make Google Earth run slowly.' }],
	[ ['--' + setting.file.name],   			{ type: 'string',	    defaultValue: setting.file.value, 			help: 'the input file. Should be an OSM XML file.' }],
	[ ['--' + setting.outputPath.name],   		{ type: 'string', 		defaultValue: setting.outputPath.value, 	help: 'The path under which output files should be written' }],
	[ ['--' + setting.outputBaseName.name],   	{ type: 'string', 		defaultValue: setting.outputBaseName.value, help: 'The base of the name for output files. This will be appended with a suffix and extension' }],
	[ ['--' + setting.minLength.name],   		{ type: 'float', 		defaultValue: setting.minLength.value, 		help: 'the minimum length of a way that should be included, in miles, 0 for no minimum. The default is 2.0' }],
	[ ['--' + setting.maxLength.name],   		{ type: 'float', 		defaultValue: setting.maxLength.value, 		help: 'the maximum length of a way that should be included, in miles, 0 for no maximum. The default is 0' }],
	[ ['--' + setting.minCurvature.name],   	{ type: 'float', 		defaultValue: setting.minCurvature.value, 	help: 'the minimum curvature of a way that should be included, 0 for no minimum. The default is 300 which catches most twisty roads.' }],
	[ ['--' + setting.maxCurvature.name],   	{ type: 'float', 		defaultValue: setting.maxCurvature.value, 	help: 'the maximum curvature of a way that should be included, 0 for no maximum. The default is 0' }],
	[ ['--' + setting.level1MaxRadius.name],    { type: 'int', 			defaultValue: setting.level1MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 1. Curves with radii larger than this will be considered straight. The default is 175' }],
	[ ['--' + setting.level1Weight.name],    	{ type: 'float', 		defaultValue: setting.level1Weight.value, 	help: 'the weight to give segments that are classified as level 1. Default 1' }],
	[ ['--' + setting.level2MaxRadius.name],    { type: 'int', 			defaultValue: setting.level2MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 2. The default is 100' }],
	[ ['--' + setting.level2Weight.name],     	{ type: 'float', 		defaultValue: setting.level2Weight.value, 	help: 'the weight to give segments that are classified as level 2. Default 1.3' }],
	[ ['--' + setting.level3MaxRadius.name],    { type: 'int', 			defaultValue: setting.level3MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 3. The default is 60' }],
	[ ['--' + setting.level3Weight.name],     	{ type: 'float', 		defaultValue: setting.level3Weight.value,   help: 'the weight to give segments that are classified as level 3. Default 1.6' }],
	[ ['--' + setting.level4MaxRadius.name],    { type: 'int', 			defaultValue: setting.level4MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 4. The default is 30' }],
	[ ['--' + setting.level4Weight.name],     	{ type: 'float', 		defaultValue: setting.level4Weight.value, 	help: 'the weight to give segments that are classified as level 4. Default 2' }],
	[ ['--' + setting.minLatBound.name],   		{ type: 'float', 		defaultValue: setting.minLatBound.value, 	help: 'The minimum latitude to include.'}],
	[ ['--' + setting.maxLatBound.name],   		{ type: 'float', 		defaultValue: setting.maxLatBound.value, 	help: 'The maximum latitude to include.' }],
	[ ['--' + setting.minLonBound.name],   		{ type: 'float', 		defaultValue: setting.minLonBound.value, 	help: 'The minimum longitude to include.' }],
	[ ['--' + setting.maxLonBound.name],   		{ type: 'float', 		defaultValue: setting.maxLonBound.value, 	help: 'The maximum longitude to include.' }],
	[ ['--' + setting.ignoredSurfaces.name],    { type: 'string',  		defaultValue: setting.ignoredSurfaces.value,help: 'a list of the surfaces that should be ignored. The default is dirt,unpaved,gravel,sand,grass,ground' }], 
	[ ['--' + setting.highwayTypes.name],    	{ type: 'string', 	    defaultValue: setting.highwayTypes.value, 	help: 'a list of the highway types that should be included. The default is secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' }],
	[ ['--' + setting.addKML.name],   			{ type: 'string',		metavar: 'PARAMETERS',	action: 'append', 	help: 'Output an additional KML file with alternate output parameters. PARAMETERS should be a comma-separated list of option=value that may include any of the following options: colorize, min_curvature, max_curvature, min_length, and max_length. Example: --add_kml colorize=1,min_curvature=1000' }],
	[ ['--' + setting.straightSegmentSplitThreshold.name],    { type: 'float', 	defaultValue: setting.straightSegmentSplitThreshold.value, help: 'If a way has a series of non-curved segments longer than this (miles), the way will be split on that straight section. Use 0 to never split ways. The default is 1.5' }]
];

var argParser = new ArgumentParser({
	description: 'Find the roads that are most twisty in an Open Street Map (OSM) XML file.'
});

args.map(function (arg) {
	argParser.addArgument(arg[0], arg[1]);
});

exports.parseArgs = function () {
	var results = argParser.parseArgs();

	config.updateSettings(results);

	return config;
}