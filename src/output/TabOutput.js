var _util = require('util');
var OutputBase = require('./OutputBase');

/* Responsible for outputting the passed in ways (post-filter)
 * to the logger.
 *
 * @class
 * @augments OutputBase
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
var TabOutput = module.exports = function (defaultFilter) {
	TabOutput.super_.call(this, defaultFilter);

	/* Writes the input ways to the console, if they pass the filter.
	 * 
	 * @param {[way]} ways - The ways to save into the kml file.
	 * @param {Logger} logger - The logging tool that should be used to output the data.
	 */
	this.write = function (ways, logger) {
		ways = this.filterAndSort(ways);

		logger.log('Curvature	Length(mi)	Distance (mi)	Id	Name	County');
		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];
			logger.log(way.curvature + '\t' + way.length + '\t' /1609 + '\t' + way.distance / 1609 + '\t' +
				way.id + '\t' + way.name + '\t'	+ way.county);
		}
	};
};

_util.inherits(TabOutput, OutputBase);