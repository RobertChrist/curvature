/* Abstract base class for writing a kml output file to disk. 
 *
 * @class
 * @abstract
 * @param {WayFilter} - The filter that should be be run on the inputted ways, 
 * 		to determine whether to write them into the file.
 */
module.exports = function (filter) {
	/* The curviness value of the curviest road that has passed through the filter,
	 * all all curves can later be compared to this.
	 */
	this.maxCurvature = 0;

	/* The filter that should be run against the ways by child classes.
	 * It is exposed here so that the settings on this filter can be read.
	 */
	this.filter = filter;

	/* Runs the passed in ways through this.filter, then sorts the ways
	 * by curvature value.  Sets the this.maxCurvature value,
	 * and returns the subset of sorted ways that passed through the filter.
	 *
	 * @param {[way]} ways - The ways to filter and sort.
	 * @returns {[way]} - The ways that passed the filter, sorted by curviness.
	 */
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