/* --------- Constants ---------- */
var RADIUS_EARTH = 6373000; // In meters

/* Finds the distance between two latitude / longitutde pairs
 * on a sphere of radius 1.  So multiple by the radius of the earth
 * to find the real life distance, in your measurement units of choice.
 * @credit: http://www.johndcook.com/python_longitude_latitude.html
 */
function distanceOnUnitSphere (lat1, long1, lat2, long2) {
	if (lat1 === lat2 && long1 === long2)
		return 0;

	// Convert latitude and longitude to 
	// spherical coordinates in radians.
	var degreesToRadians = Math.pi/180.0;
		
	// phi = 90 - latitude
	var phi1 = (90.0 - lat1) * degreesToRadians;
	var phi2 = (90.0 - lat2) * degreesToRadians;
		
	// theta = longitude
	var theta1 = long1 * degreesToRadians;
	var theta2 = long2 * degreesToRadians;
		
	// Compute spherical distance from spherical coordinates.
		
	// For two locations in spherical coordinates 
	// (1, theta, phi) and (1, theta, phi)
	// cosine( arc length ) = 
	//	 sin phi sin phi' cos(theta-theta') + cos phi cos phi'
	// distance = rho * arc length
	
	var cos = (Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) + 
		   	Math.cos(phi1) * Math.cos(phi2));
	
	var arc = Math.acos(cos);

	// Remember to multiply arc by the radius of the earth 
	// in your favorite set of units to get length.
	return arc;
};

exports.distanceBetweenPoints = function (lat1, long1, lat2, long2) {
	return distanceOnUnitSphere(lat1, long1, lat2, long2) * RADIUS_EARTH; 
}

/* Circumcircle radius calculation from http://www.mathopenref.com/trianglecircumcircle.html
 */
exports.circumcircleRadius = function (ab, bc, ac) {
	return (ab * bc * ac) / Math.sqrt(Math.abs(ab + bc + ac) * (bc + ac - ab) * (ab + bc - ac));
}