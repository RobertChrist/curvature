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

var _parser = require('./input/commandLineParser');
var Logger = require('./Logger');
var WayFilter = require('./WayFilter');
var WayParser = require('./input/WayParser');
var WayCollector = require('./input/WayCollector');
var WayCalculator = require('./WayCalculator');
var CurvatureRunner = require('./CurvatureRunner');


/* ---------- Main Script ---------- */

var config = _parser.parseArgs();
var settings = config.settings;
var logger = new Logger(settings.verbose.value);

var defaultFilter = new WayFilter(settings.minLength.value, 
								   settings.maxLength.value, 
								   settings.minCurvature.value, 
								   settings.maxCurvature.value);

var parser = new WayParser(settings.wayTypes.value.split(','), 
							settings.ignoredSurfaces.value.split(','),
							settings.minLatBound.value, 
							settings.maxLatBound.value, 
							settings.minLonBound.value, 
							settings.maxLatBound.value);

var calculator = new WayCalculator(logger,
                                   settings.straightSegmentSplitThreshold.value, 
								   settings.level1MaxRadius.value, 
								   settings.level1Weight.value, 
								   settings.level2MaxRadius.value, 
								   settings.level2Weight.value, 
								   settings.level3MaxRadius.value, 
								   settings.level3Weight.value, 
								   settings.level4MaxRadius.value, 
								   settings.level4Weight.value);

var collector = new WayCollector( logger,
								  parser,
                                  calculator);

var runner = new CurvatureRunner(logger,
								 settings.file.value,
								 settings.tabularOutput.value,
								 settings.outputBasename,
								 settings.noKML.value,
								 settings.colorize.value,
								 settings.outputPath.value, 
								 settings.km.value,
								 settings.addKML.value);

runner.run(defaultFilter, collector);