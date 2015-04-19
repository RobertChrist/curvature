var util = require('util');
var OutputBase = require('./OutputBase');

var TabOutput = module.exports = function () {

	this.output = function (roads) {
		roads = this.filterAndSort(roads);

		console.log('Curvature	Length(mi)	Distance (mi)	Id	Name	County');
		for (var i = 0, j = roads.length; i < j; i++;) {
			var road = roads[i];
			console.log(road['curvature'] + '	' + road['length'] + '	' /1609 + '	' + road['distance'] / 1609 + '	' +
				road['id'] + '	' + road['name'] + '	'	+ road['county']);
		}
	};
};

util.inherits(TabOutput, OutputBase);