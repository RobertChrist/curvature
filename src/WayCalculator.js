/* This object is responsible for calculating the curvature of ways, given
 * a set of ways, and their corresponding coordinates.
 * 
 * @class
 * 
 * @param {Logger} _logger - The instance we should log with.
 * @param {DeflectionFilter} - The instance that should be used to prune the coordinate data of bad instances.
 * @param {WaySplitterCalculator} - The instance that should be used to determine the curviest sections of road.
 * @param {CurvatureAndDistanceCalculator} - The instance that should be used to determine a road's distance and curvature.
 */
module.exports = function (_logger, _deflectionFilter, _waySplitter, _cAndDCalculator) {

	/* Using the passed in arguments, determines the curviness of each way, 
	 * and each segment of each way. 
	 * 
	 * @param {obj[]} ways - The roads to calculate curviness of.
	 * @param {obj} coords - The coordinates the ways reference.
	 * @returns {obj[]} - The ways, updated with their new curve and distance information.
	 */
	this.calculate = function (ways, coords) {
		var sections = [];

		var way;
		while (way = ways.pop()) {
			try {
				_cAndDCalculator.calculate(way, coords);
				_deflectionFilter.filter(way);
				
				var waySections = _waySplitter.split(way);
				
				sections.push.apply(sections, waySections);
			} catch (err) {
			    _logger.forceLog(err);
			}
		}

		return sections;
	};
};