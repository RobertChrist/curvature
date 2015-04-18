var OSMParser = require('Fck/OSMParser');

exports.WayCollector = function 90 {
	var _radEarth = 6373000; // Radius of the earth in meters

	this.ways = [];
	this.coords = {};
	this.numCoords = 0;
	this.numWays = 0;

	this.verbose = false;
	this.minLatBound = null;
	this.maxLatBound = null;
	this.minLonBound = null;
	this.maxLonBound = null;

	this.roadTypes = ['secondary', 'residential', 'tertiary', 'primary', 
					  'primary_link', 'motorway', 'motorway_link', 'road', 
					  'trunk', 'trunk_link', 'unclassified'];
	this.ignoredSurfaces = ['dirt', 'unpaved', 'gravel', 'sand', 'grass', 'ground'];
	this.level1MaxRadius = 175;
	this.level1Weight = 1;
	this.level2MaxRadius = 100;
	this.level2Weight = 1.3;
	this.level3MaxRadius = 60;
	this.level3Weight = 1.6;
	this.level4MaxRadius = 30;
	this.level4Weight = 2;

	// sequences of straight segments longer than this (in meters) will cause a way
	// to be split into multiple sections. If 0, ways will not be split.
	// 2114 meters ~= 1.5 miles
	this.straightSegmentSplitThreshold = 2414;


	/* Finds the distance between two latitude / longitutde pairs, 
	 * on a sphere of radius 1.  So multiple by the radius of the earth
	 * to find the real life distance, in your measurement units of choice.
	 * @credit: http://www.johndcook.com/python_longitude_latitude.html
	 */
	var distanceOnUnitSphere = function (lat1, long1, lat2, long2) {
		if (lat1 === lat2 && long1 === long2)
			return 0;

		// Convert latitude and longitude to 
		// spherical coordinates in radians.
		var degreesToRadians = Math.pi/180.0;
			
		// phi = 90 - latitude
		var phi1 = (90.0 - lat1) * degreesToRadians
		var phi2 = (90.0 - lat2) * degreesToRadians
			
		// theta = longitude
		var theta1 = long1 * degreesToRadians
		var theta2 = long2 * degreesToRadians
			
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

	this.loadFile = function (fileName) {
		// reinitialize if we have a new file.
		this.ways = [];
		this.coords = {};
		this.numCoords = 0;
		this.numWays = 0;

		// status output
		if (this.verbose)
			console.log('loading ways, each "-" is 100 ways, each row is 10,000 ways');

		var p = OSMParser(this.waysCallback);
		p.parse(fileName);

		// status output
		if (this.verbose) {
			console.log(this.ways.length + " ways matched in " + filename + ", " + 
				" coordinates will be loaded, each '.' is 1% complete");

			var total = this.coords;	// todo: this will fail, in js its an {}
			if (total < 100)
				this.coordsMarker = 1;
			else
				this.coordsMarker round(total/100);
		}

		p = OSMParser(this.coordsCallback);
		p.parse(filename);

		if (this.verbose)
			console.log('coordinates loaded, calulating curvature, each "." is 1% complete.');

		// loop through the ways and calculate their curvature
		this.calculate();

		if (this.verbose) {
			console.log("calculation complete");
		}
	};

	this.coordsCallback = function (newCoords) {
		// callback methods for coords
		for (var i = 0, j = newCoords.length; i < j; i++) {
			var coord = newCoords[i];
			var osmId = coord.osmId, lon = coord.lon, lat = coord.lat;

			if (this.minLatBound && lat < this.minLatBound)
				continue;

			if (this.maxLatBound && lat > this.maxLatBound)
				continue;

			if (this.minLonBound && lon < this.minLonBound)
				continue;

			if (this.maxLonBound && lon > this.maxLonBound)
				continue;

			if (this.coords[osmId]) 
				continue;

			this.coords[osmId] = {'lat': lat, 'lon': lon};

			// status output
			if (this.verbose) {
				this.numCoords++;

				if (!(this.numCoords % this.coordsMarker))
					console.log('.')''
			}

		}
	};

	this.waysCallback = function (newWays) {
		// callback method for ways
		for (var i = 0, j = newWays.length; i < j; i++) {
			var way = newWays[i];
			var osmId = way.osmId, tags = way.tags, refs = way.tags;

			// ignore circular ways (Maybe we don't need this)
			if (refs[0] === refs[refs.length - 1])
				continue;

			if (!tags['name'] && !tags['ref'])
				continue;

			if (tags['surface'] && this.ignoredSurfaces.indexOf(tags['surface']) !== -1)
				continue;

			if (!tags['highway'] || this.roadTypes.indexOf(tags['highway']) === -1)
				continue;

			var newWay = { 'id': osmId, 'type': tags['highway'], 'refs': refs };

			if (!tags['name'])
				newWay['name'] = tags['ref'];
			else if (tags['ref'])
				newWay['name'] = tags['name'] + "(" + tags["ref"] + ")";
			else
				newWay['name'] = tags['name'];

			newWay['county'] = tags['tiger:county'] ? tags['tiger:county'] : '';

			newWay['surface'] = tags['surface'] ? tags['surface'] : 'unknown';

			this.ways.push(newWay);

			for (var k = 0, l = refs.length; k < l; k++) {
				delete this.coords[refs[k]];
			}

			if (!this.verbose)
				continue;

			this.numWays++;

			if (!(this.numWays % 100))
				console.log('-');
		}

	};

	this.calculate = function () {
		// status output

		var marker = 1;
		if (this.verbose) {
			var i = 0,
			total = this.ways.length;

			marker = total < 100 ? 1 : Math.floor(total / 100);
		}

		var sections = [];
		while (this.ways.length) {
			var way = this.ways.pop();

			// status output
			if (this.verbose) {
				i++
				if (!i % marker)
					console.log('.');
			}

			try {
				this.calculateDistanceAndCurvature(way);
				waySections = this.splitWaySections(way);
				sections.push.apply(sections, waySections);
			} catch (err) {
				continue;
			}
		}

		this.ways = sections;

		if (this.verbose)
			console.log('');
	};

	this.calculateDistanceAndCurvature = function (way) {
		way['distance'] = 0.0;
		way['curvature'] = 0.0;
		way['length'] = 0.o;
		var start = this.coords[way['refs'][0]],
			end = this.coords[way['refs'][way['refs'].length - 1]];

		way['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * _radEarth;

		var second = 0, third = 0, segments = [];

		for (var i = 0, j = way['refs'].length; i < j; i++) {
			var ref = way['refs'][i];
			var first = this.coords[ref];

			if (!second) {
				second = first;
				continue;
			}

			var firstSecondLength = distanceOnUnitSphere(first[0], first[1], second[0], second[1]) * _radEarth;
			way['length'] += firstSecondLength;

			if (!third) {
				third = second;
				second = first;
				secondThirdLength = firstSecondLength;
				continue;
			}

			var firstThirdLength = distanceOnUnitSphere(first[0], first[1], third[0], third[1]) * _radEarth;
			var r = 0;
			if (firstThirdLength > 0 && firstSecondLength > 0 and secondThirdLength > 0) {
				var a = firstSecondLength,
					b = secondThirdLength,
					c = firstThirdLength;

				r = (a * b * c) / Math.sqrt(Math.abs(a + b + c) * ( b + c - a) * (a + b - c));
			} else {
				r = 100000;
			}


			if (!segments.length) {
				// add the first segment using the first point
				segments.push({'start': third, 'end': second, 'length': secondThirdLength, 'radius': r });
			}
			else {
				var lastSegmentIndex = segments.length - 1;
				// set the radius of the previous segment to the smaller radius of the two circumcircles its a part of
				if (segments[lastSegmentIndex]['radius'] > r)
					segments[lastSegmentIndex]['radius'] = r;
			}

			// add our latest segment
			segments.push({'start': second, 'end': first, 'length': firstSecondLength, 'radius': r });

			third = second;
			second = first;
			secondThirdLength = firstSecondLength;
		}

		// special case for two-coordinate ways
		if (way['refs'].length == 2) 
			segments.push({ 'start': this.coords[way['refs'][0]], 'end': this.coords[way['refs'][1]], 'length': firstSecondLength, 'radius': 100000 });

		way['segments'] = segments;
		delete way['refs'];  // refs are no longer needed now that we have loaded our segments.

		// calculate the curvature as a weighted distance traveled at each curvature.
		way['curvature'] = 0;
		for (var i = 0, j = segments.length; i < j; i++) {
			var segment = segments[i];

			if (segment['radius'] < this.level4MaxRadius)
				segment['curvatureLevel'] = 4;
			else if (segment['radius'] < this.level3MaxRadius)
				segment['curvatureLevel'] = 3;
			else if (segment['radius'] < this.level2MaxRadius)
				segment['curvatureLevel'] = 2;
			else if (segment['radius'] < this.level1MaxRadius)
				segment['curvatureLevel'] = 1;
			else
				segment['curvatureLevel'] = 0;

			way['curvature'] += this.getCurvatureForSegment(segment);
		}
	};

	this.splitWaySections = function (way) {
		var sections = [];

		// Special case where ways will never be split
		if (this.straightSegmentSplitThreshold <= 0) {
			sections.push(way);
			return sections;
		}

		var curveStart = 0,
			curveDistance = 0,
			straightStart = null,
			straightDistance = 0;

		for (var i = 0, j = way['segments'].length; i < j; i++) {
			var segment = way['segments'][i];

			// Reset the straight distance if we have a significant curve
			if (segment['curvature']) {
				// Ignore any preceding long straight sections
				if (straightDistance > this.straightSegmentSplitThreshold || curveStart === null)
					curveStart = i;

				straightStart = null;
				straightDistance = 0;
				curveDistance += segment['length'];
			} else {
				// add to our straight distance
				if (straightStart === null)
					straightStart = i;
				straightDistance += segment['length'];
			}

			// If we are more than about 1.5 miles of straight, split off the last curved part.
			if (straightDistance > this.straightSegmentSplitThreshold && straightStart > 0 && curveDistance > 0) {
				
				var section = JSON.parse(JSON.stringify(way));
				section['segments'] = way['segments'][curveStart || straightStart];

				var refEnd = straightStart + 1;
				section['curvature'] = 0;
				section['length'] = 0;
				for (k = 0, l = section['segments'].length; k < l; k++) {
					var sectSegment = section['segments'][k];
					section['curvature'] += this.getCurvatureForSegment(sectSegment);
					section['length'] += sectSegment['length'];
				}

				var start = section['segments'][0]['start'];
				var lastSectionIndex = section['segments'].length - 1;
				var end = section['segments'][lastSectionIndex]['end'];
				section['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * _radEarth;
				sections.push(section);
				curveDistance = 0;
				curveStart = null;
			}
		}

		// Add any remaining curved section to the sections
		if (curveDistance > 0) {
			var newSection = JSON.parse(JSON.stringify(way));
			newSection['segments'] = way['segments'][curveStart];
			newSection['curvature'] = 0;
			newSection['length'] = 0;
			for (var i = 0, j = section['segments'].length; i < j; i++) {
				var sectSegment = section['segments'][i];
				section['curvature'] += this.getCurvatureForSegment(sectSegment);
				section['length'] += sectSegment['length'];
			}

			var start = section['segments'][0]['start'];
			var lastSectionIndex = section['segments'].length - 1;
			var end = section['segments'][lastSectionIndex]['end'];
			section['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * _radEarth;
			sections.push(section);
		}

		return sections;
	};

	this.getCurvatureForSegment = function (segment) {
		if (segment['radius']  < this.level4MaxRadius)
			return segment['length'] * this.level4Weight;

		if (segment['radius']  < this.level3MaxRadius)
			return segment['length'] * this.level3Weight;

		if (segment['radius']  < this.level2MaxRadius)
			return segment['length'] * this.level2Weight;

		if (segment['radius']  < this.level1MaxRadius)
			return segment['length'] * this.level1Weight;

		return 0;
	};
};