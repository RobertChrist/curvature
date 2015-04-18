/* Once the OSM data has been parsed, we filter out roads that don't meet
 * our search criteria.  That filtering logic is held here.
 *
 * @param {number} minLength - Roads shorter than this are not worth reporting on.
 * @param {number} maxLength - Roads longer than this are not worth reporting on.
 * @param {number} minCurvature - Roads less curvy than this are too boring.
 * @param {number} maxCurvature - Roads curvier than this are too scary.
 */
module.exports = function (minLength, maxLength, minCurvature, maxCurvature) {
	this.minLength = minLength;
	this.maxLength = maxLength;
	this.minCurvature = minCurvature;
	this.maxCurvature = maxCurvature;
	
	/* Filters the passed in array, returning only roads that match this class's settings. 
	 * @param {array} roads - An array of Road objects. */
	this.filter = function (roads) {
		var filterBy = function () { return true; };

		if (this.minLength > 0) 
			filterBy = function (way) { return way['length'] / 1609 > this.minLength; };
		
		if (this.maxLength > 0)
			filterBy = function (way) { return way['length'] / 1609 < this.maxLength; };
		
		if (this.minCurvature > 0) {
			filterBy = function (way) { return way['curvature'] > this.minCurvature; };
		
		if (this.maxCurvature > 0)
			filterBy = function (way) { return way['curvature'] < this.maxCurvature; };
		
		return roads.filter(filterBy);
	};
};
