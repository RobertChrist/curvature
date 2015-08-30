module.exports = function (filter) {
	this.maxCurvature = 0;

	this.filter = filter;

	this.filterAndSort = function (ways) {
		// Filter out ways that are too short/long or too straight or too curvy
		ways = this.filter.filter(ways);

		// Sort the ways based on curvature.
		ways = ways.sort(function (a, b) {
			return a.curvature - b.curvature;
		});

		for (var i = 0, j = ways.length; i < j; i++) {
			if (ways[i].curvature > this.maxCurvature) 
				this.maxCurvature = ways[i].curvature;
        }

	    return ways;
	};
};