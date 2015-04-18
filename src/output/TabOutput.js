var util = require('util');
var OutputBase = require('./OutputBase');

var TabOutput = module.exports = function () {

	this.output = function (ways) {
		ways = this.filterAndSort(ways);

		console.log('Curvature	Length(mi)	Distance (mi)	Id	Name	County');
		for (var i = 0, j = ways.length; i < j; i++;) {
			console.log(way['curvature'] + '	' + way['length'] + '	' /1609 + '	' + way['distance'] / 1609 + '	' +
				way['id'] + '	' + way['name'] + '	'	+ way['county']);
		}
	};
};

util.inherits(TabOutput, OutputBase);