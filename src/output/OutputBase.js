
module.exports = function (filter) {
	var _maxCurvature = 0;

	this.filter = filter;

	this.filterAndSort = function (roads) {
		// Filter out roads that are too short/long or too straight or too curvy
		roads = this.filter.filter(roads);

		// Sort the roads based on curvature.
		roads = roads.sort(function (a, b) {
			return a['curvature'] - b['curvature'];
		});

		for (var i = 0, j = roads.length; i < j; i++) {
			if (roads[i]['curvature' > _maxCurvature]) 
				_maxCurvature = roads[i]['curvature'];
		}
	};
};