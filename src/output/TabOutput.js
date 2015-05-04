var _util = require('util');
var OutputBase = require('./OutputBase');

var TabOutput = module.exports = function () {

	this.output = function (ways, logger) {
		ways = this.filterAndSort(ways);

		logger.log('Curvature	Length(mi)	Distance (mi)	Id	Name	County');
		for (var i = 0, j = ways.length; i < j; i++) {
			var way = ways[i];
			logger.log(way['curvature'] + '	' + way['length'] + '	' /1609 + '	' + way['distance'] / 1609 + '	' +
				way['id'] + '	' + way['name'] + '	'	+ way['county']);
		}
	};
};

_util.inherits(TabOutput, OutputBase);