var _config = require('config').paramNames;
var ArgumentParser = require('argparse').ArgumentParser;

// The config options.
var args = [
	[ ['--' + _config.tabluarOutput],	{ action: 'storeTrue',  defaultValue: _config.tabluarOutput.value,  help: 'Display tabular output' }],
	[ ['--' + _config.noKML], 			{ action: 'storeTrue',  defaultValue: _config.noKML.value, 			help: 'Do not generate a KML file. By default a KML file is generated with the name of the input file followed by .kml' }],
	[ ['--' + _config.km],				{ action: 'storeTrue',  defaultValue: _config.km.value, 			help: 'Output kilometers instead of miles.' }],
	[ ['--' + _config.colorize],		{ action: 'storeTrue',  defaultValue: _config.colorize.value, 		help: 'Colorize KML lines based on the curvature of the road at each segment. Without this option roads will be lines of a single color. For large regions this may make Google Earth run slowly.' }],
	[ ['--' + _config.file],			{ type: 'string',	    defaultValue: _config.file.value, 			help: 'the input file. Should be an OSM XML file.' }],
	[ ['--' + _config.outputPath],		{ type: 'string', 		defaultValue: _config.outputPath.value, 	help: 'The path under which output files should be written' }],
	[ ['--' + _config.outputBaseName],	{ type: 'string', 		defaultValue: _config.outputBaseName.value, help: 'The base of the name for output files. This will be appended with a suffix and extension' }],
	[ ['--' + _config.minLength],		{ type: 'float', 		defaultValue: _config.minLength.value, 		help: 'the minimum length of a way that should be included, in miles, 0 for no minimum. The default is 2.0' }],
	[ ['--' + _config.maxLength],		{ type: 'float', 		defaultValue: _config.maxLength.value, 		help: 'the maximum length of a way that should be included, in miles, 0 for no maximum. The default is 0' }],
	[ ['--' + _config.minCurvature],	{ type: 'float', 		defaultValue: _config.minCurvature.value, 	help: 'the minimum curvature of a way that should be included, 0 for no minimum. The default is 300 which catches most twisty roads.' }],
	[ ['--' + _config.maxCurvature],	{ type: 'float', 		defaultValue: _config.maxCurvature.value, 	help: 'the maximum curvature of a way that should be included, 0 for no maximum. The default is 0' }],
	[ ['--' + _config.level1MaxRadius], { type: 'int', 			defaultValue: _config.level1MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 1. Curves with radii larger than this will be considered straight. The default is 175' }],
	[ ['--' + _config.level1Weight], 	{ type: 'float', 		defaultValue: _config.level1Weight.value, 	help: 'the weight to give segments that are classified as level 1. Default 1' }],
	[ ['--' + _config.level2MaxRadius], { type: 'int', 			defaultValue: _config.level2MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 2. The default is 100' }],
	[ ['--' + _config.level2Weight],  	{ type: 'float', 		defaultValue: _config.level2Weight.value.3, help: 'the weight to give segments that are classified as level 2. Default 1.3' }],
	[ ['--' + _config.level3MaxRadius], { type: 'int', 			defaultValue: _config.level3MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 3. The default is 60' }],
	[ ['--' + _config.level3Weight],  	{ type: 'float', 		defaultValue: _config.level3Weight.value.6, help: 'the weight to give segments that are classified as level 3. Default 1.6' }],
	[ ['--' + _config.level4MaxRadius], { type: 'int', 			defaultValue: _config.level4MaxRadius.value,help: 'the maximum radius of a curve (in meters) that will be considered part of level 4. The default is 30' }],
	[ ['--' + _config.level4Weight],  	{ type: 'float', 		defaultValue: _config.level4Weight.value, 	help: 'the weight to give segments that are classified as level 4. Default 2' }],
	[ ['--' + _config.minLatBound],		{ type: 'float', 		defaultValue: _config.minLatBound.value, 	help: 'The minimum latitude to include.'}],
	[ ['--' + _config.maxLatBound],		{ type: 'float', 		defaultValue: _config.maxLatBound.value, 	help: 'The maximum latitude to include.' }],
	[ ['--' + _config.minLonBound],		{ type: 'float', 		defaultValue: _config.minLonBound.value, 	help: 'The minimum longitude to include.' }],
	[ ['--' + _config.maxLonBound],		{ type: 'float', 		defaultValue: _config.maxLonBound.value, 	help: 'The maximum longitude to include.' }],
	[ ['--' + _config.ignoredSurfaces], { type: 'string',  		defaultValue: _config.ignoredSurfaces.value,help: 'a list of the surfaces that should be ignored. The default is dirt,unpaved,gravel,sand,grass,ground' }], 
	[ ['--' + _config.highwayTypes], 	{ type: 'string', 	    defaultValue: _config.highwayTypes.value, 	help: 'a list of the highway types that should be included. The default is secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' }],
	[ ['--' + _config.addKML],			{ type: 'string',		metavar: 'PARAMETERS',	action: 'append', 	help: 'Output an additional KML file with alternate output parameters. PARAMETERS should be a comma-separated list of option=value that may include any of the following options: colorize, min_curvature, max_curvature, min_length, and max_length. Example: --add_kml colorize=1,min_curvature=1000' }],
	[ ['--' + _config.straightSegmentSplitThreshold], { type: 'float', 	defaultValue: _config.straightSegmentSplitThreshold.value, help: 'If a way has a series of non-curved segments longer than this (miles), the way will be split on that straight section. Use 0 to never split ways. The default is 1.5' }]
];

module.exports = parser = new ArgumentParser({
	description: 'Find the roads that are most twisty in an Open Street Map (OSM) XML file.'
});

args.map(function (arg) {
	parser.addArgument(arg[0], arg[1]);
});