
module.exports = function () {
	this.minCurvature = 0;
	this.maxCurvature = 0;
	this.minLength = 0;
	this.maxLength = 0;
	
	// I think ways is supposed to be a private param
	this.filter = function (ways) {
		if this.minLength > 0:
			ways = this.filter(lambda w: w['length'] / 1609 > this.minLength, ways)
		
		if this.maxLength > 0:
			ways = this.filter(lambda w: w['length'] / 1609 < this.maxLength, ways)
		
		if this.minCurvature > 0:
			ways = this.filter(lambda w: w['curvature'] > this.minCurvature, ways)
		
		if this.maxCurvature > 0:
			ways = this.filter(lambda w: w['curvature'] < this.maxCurvature, ways)
		
		return ways
	};

};
