var _util = require('util');
var OutputBase = require('./OutputBase');

var TabOutput = module.exports = function () {

	this.output = function (ways, logger) {
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