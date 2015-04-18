var ArgumentParser = require('argparse').ArgumentParser;

// The config options.
var args = [
	[ ['-t'], 					{ action: 'storeTrue',  help: 'Display tabular output' }],
	[ ['--no_kml'], 			{ action: 'storeTrue',  help: 'Do not generate a KML file. By default a KML file is generated with the name of the input file followed by .kml' }],
	[ ['--km'], 				{ action: 'storeTrue',  help: 'Output kilometers instead of miles.' }],
	[ ['--colorize'], 			{ action: 'storeTrue',  help: 'Colorize KML lines based on the curvature of the road at each segment. Without this option roads will be lines of a single color. For large regions this may make Google Earth run slowly.' }],
	[ ['--file'], 				{ type: 'string',	    nargs: '+',				help: 'the input file. Should be an OSM XML file.' }],
	[ ['--outputPath'], 		{ type: 'string', 		defaultValue: '.', 		help: 'The path under which output files should be written' }],
	[ ['--outputBaseName'], 	{ type: 'string', 		defaultValue: null, 	help: 'The base of the name for output files. This will be appended with a suffix and extension' }],
	[ ['--minLength'], 		    { type: 'float', 		defaultValue: 1, 		help: 'the minimum length of a way that should be included, in miles, 0 for no minimum. The default is 2.0' }],
	[ ['--maxLength'], 		    { type: 'float', 		defaultValue: 0, 		help: 'the maximum length of a way that should be included, in miles, 0 for no maximum. The default is 0' }],
	[ ['--minCurvature'], 		{ type: 'float', 		defaultValue: 300, 		help: 'the minimum curvature of a way that should be included, 0 for no minimum. The default is 300 which catches most twisty roads.' }],
	[ ['--maxCurvature'], 		{ type: 'float', 		defaultValue: 0, 		help: 'the maximum curvature of a way that should be included, 0 for no maximum. The default is 0' }],
	[ ['--level1MaxRadius'],   	{ type: 'int', 			defaultValue: 175, 		help: 'the maximum radius of a curve (in meters) that will be considered part of level 1. Curves with radii larger than this will be considered straight. The default is 175' }],
	[ ['--level1Weight'],  		{ type: 'float', 		defaultValue: 1, 		help: 'the weight to give segments that are classified as level 1. Default 1' }],
	[ ['--level2MaxRadius'],   	{ type: 'int', 			defaultValue: 100, 		help: 'the maximum radius of a curve (in meters) that will be considered part of level 2. The default is 100' }],
	[ ['--level2Weight'],   	{ type: 'float', 		defaultValue: 1.3, 		help: 'the weight to give segments that are classified as level 2. Default 1.3' }],
	[ ['--level3MaxRadius'],   	{ type: 'int', 			defaultValue: 60, 		help: 'the maximum radius of a curve (in meters) that will be considered part of level 3. The default is 60' }],
	[ ['--level3Weight'],   	{ type: 'float', 		defaultValue: 1.6, 		help: 'the weight to give segments that are classified as level 3. Default 1.6' }],
	[ ['--level4MaxRadius'],    { type: 'int', 			defaultValue: 30, 		help: 'the maximum radius of a curve (in meters) that will be considered part of level 4. The default is 30' }],
	[ ['--level4Weight'],   	{ type: 'float', 		defaultValue: 2, 		help: 'the weight to give segments that are classified as level 4. Default 2' }],
	[ ['--minLatBound'], 		{ type: 'float', 		defaultValue: null, 	help: 'The minimum latitude to include.'}],
	[ ['--maxLatBound'], 		{ type: 'float', 		defaultValue: null, 	help: 'The maximum latitude to include.' }],
	[ ['--minLonBound'], 		{ type: 'float', 		defaultValue: null, 	help: 'The minimum longitude to include.' }],
	[ ['--maxLonBound'], 		{ type: 'float', 		defaultValue: null, 	help: 'The maximum longitude to include.' }],
	[ ['--addKML'], 			{ type: 'string',		metavar: 'PARAMETERS',	action: 'append', 		help: 'Output an additional KML file with alternate output parameters. PARAMETERS should be a comma-separated list of option=value that may include any of the following options: colorize, min_curvature, max_curvature, min_length, and max_length. Example: --add_kml colorize=1,min_curvature=1000' }],
	[ 
		['--ignoredSurfaces'], { 
			type: 'string',  
			defaultValue:'dirt,unpaved,gravel,sand,grass,ground', 	
			help: 'a list of the surfaces that should be ignored. The default is dirt,unpaved,gravel,sand,grass,ground'
		}
	], [
		['--highwayTypes'], { 
		    type: 'string', 	
		    defaultValue:'secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified', 
		    help: 'a list of the highway types that should be included. The default is secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' 
		}
	], [ 
		['--straightSegmentSplitThreshold'], 
		{ 
			type: 'float', 
			defaultValue: 1.5, 
			help: 'If a way has a series of non-curved segments longer than this (miles), the way will be split on that straight section. Use 0 to never split ways. The default is 1.5' 
		}
	] 
];

module.exports = parser = new ArgumentParser({
	description: 'Find the roads that are most twisty in an Open Street Map (OSM) XML file.'
});

args.map(function (arg) {
	parser.addArgument(arg[0], arg[1]);
});