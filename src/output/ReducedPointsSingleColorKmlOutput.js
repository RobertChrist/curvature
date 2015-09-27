var _util = require('util');
var SingleColorKmlOutput = require('./SingleColorKmlOutput');

/* An alternative to the SingleColorKmlOutputter, which will
 * limit the filesize of the final file, by limiting the number of points
 * for each way.
 *
 * @class
 * @augments SingleColorKmlOutput
 * 
 * @param {int} limitPoints - The number of points per way.
 * @param {bool} relativeColor - colors in file (if colorize is false) should be relative to max in file, or absolute?
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
var ReducedPointsSingleColorKmlOutput = module.exports = function (_limitPoints, _relativeColor, _defaultFilter) {
    ReducedPointsSingleColorKmlOutput.super_.call(this, _relativeColor, _defaultFilter);

    this.limitPoints = 2;

    if (_limitPoints > this.limitPoints)
    	this.limitPoints = _limitPoints;
};

_util.inherits(ReducedPointsSingleColorKmlOutput, SingleColorKmlOutput);

/* @inheritDoc
 * @augments writeSegments on SingleColorKmlOutput
 */
ReducedPointsSingleColorKmlOutput.prototype.writeSegments = function (segments) {
	var numSegments = segments.length;
	var interval = Math.ceil(numSegments / (this.limitPoints - 1));

	var tempResult = _util.format('%s,%s ', segments[0].start.lon.toFixed(6), segments[0].start.lat.toFixed(6));

	var k = 0, l = 0;
	for (var i = 0, j = segments.length; i < j; i++) {
		var segment = segments[i];

		k++;
		l++;

		if (l == interval || k == numSegments) {
			tempResult += _util.format("%s,%s ", segment.end.lon.toFixed(6), segment.end.lat.toFixed(6));
			l = 0;
		}
	}

	return tempResult; 
};