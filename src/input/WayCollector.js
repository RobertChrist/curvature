var OSMParser = require('Fck/OSMParser');

exports.RoadCollector = function (verbose, minLatBound, maxLatBound, minLonBound, maxLatBound, roadTypes, ignoredSurfaces, straightSegmentSplitThreshold,
								  _level1MaxRadius, _level1Weight, _level2MaxRadius, _level2Weight, _level3MaxRadius, _level3Weight, _level4MaxRadius, _level4Weight) {
	
	/* --------- Constants ---------- */
	var RADIUS_EARTH = 6373000; // In meters


	/* --------- Object State --------- */
	var _roads = [], _numRoads = 0;
	var _coords = {}, _numCoords = 0;
	var _coordsMarker = 1;


	/* --------- Class - Configuration (ie, readonly) --------- */
	var _verbose = verbose;
	var _minLatBound = minLatBound, _maxLatBound = maxLatBound,
		_minLonBound = minLonBound, _maxLonBound = maxLonBound;
	
	var _level1MaxRadius = level1MaxRadius, _level1Weight = level1Weight,
		_level2MaxRadius = level2MaxRadius, _level2Weight = level2Weight,
		_level3MaxRadius = level3MaxRadius, _level3Weight = level3Weight,
		_level4MaxRadius = level4MaxRadius, _level4Weight = level4Weight;

	var _roadTypes = roadTypes, 
		_ignoredSurfaces = ignoredSurfaces,
		_straightSegmentSplitThreshold = straightSegmentSplitThreshold;


	/* --------- Local Methods --------- */

	function resetObjectState () {
		_roads = [];
		_numRoads = 0;
		_coords = {};
		_numCoords = 0;
	}

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
	}

	function getCurvatureForSegment (segment) {
		if (segment['radius']  < _level4MaxRadius)
			return segment['length'] * _level4Weight;

		if (segment['radius']  < _level3MaxRadius)
			return segment['length'] * _level3Weight;

		if (segment['radius']  < _level2MaxRadius)
			return segment['length'] * _level2Weight;

		if (segment['radius']  < _level1MaxRadius)
			return segment['length'] * _level1Weight;

		return 0;
	}

	function splitWaySections (road) {
		var sections = [];

		// Special case where ways will never be split
		if (_straightSegmentSplitThreshold <= 0) {
			sections.push(road);
			return sections;
		}

		var curveStart = 0,
			curveDistance = 0,
			straightStart = null,
			straightDistance = 0;

		for (var i = 0, j = road['segments'].length; i < j; i++) {
			var segment = road['segments'][i];

			// Reset the straight distance if we have a significant curve
			if (segment['curvature']) {
				// Ignore any preceding long straight sections
				if (straightDistance > _straightSegmentSplitThreshold || curveStart === null)
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
			if (straightDistance > _straightSegmentSplitThreshold && straightStart > 0 && curveDistance > 0) {
				
				var section = JSON.parse(JSON.stringify(road));
				section['segments'] = road['segments'][curveStart || straightStart];

				var refEnd = straightStart + 1;
				section['curvature'] = 0;
				section['length'] = 0;
				for (k = 0, l = section['segments'].length; k < l; k++) {
					var sectSegment = section['segments'][k];
					section['curvature'] += getCurvatureForSegment(sectSegment);
					section['length'] += sectSegment['length'];
				}

				var start = section['segments'][0]['start'];
				var lastSectionIndex = section['segments'].length - 1;
				var end = section['segments'][lastSectionIndex]['end'];
				section['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * RADIUS_EARTH;
				sections.push(section);
				curveDistance = 0;
				curveStart = null;
			}
		}

		// Add any remaining curved section to the sections
		if (curveDistance > 0) {
			var newSection = JSON.parse(JSON.stringify(road));
			newSection['segments'] = road['segments'][curveStart];
			newSection['curvature'] = 0;
			newSection['length'] = 0;
			for (var i = 0, j = section['segments'].length; i < j; i++) {
				var sectSegment = section['segments'][i];
				section['curvature'] += getCurvatureForSegment(sectSegment);
				section['length'] += sectSegment['length'];
			}

			var start = section['segments'][0]['start'];
			var lastSectionIndex = section['segments'].length - 1;
			var end = section['segments'][lastSectionIndex]['end'];
			section['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * RADIUS_EARTH;
			sections.push(section);
		}

		return sections;
	}

	function calculateDistanceAndCurvature (road) {
		road['distance'] = 0.0;
		road['curvature'] = 0.0;
		road['length'] = 0.o;
		var start = _coords[road['refs'][0]],
			end = _coords[road['refs'][road['refs'].length - 1]];

		road['distance'] = distanceOnUnitSphere(start[0], start[1], end[0], end[1]) * RADIUS_EARTH;

		var second = 0, third = 0, segments = [];

		for (var i = 0, j = road['refs'].length; i < j; i++) {
			var ref = road['refs'][i];
			var first = _coords[ref];

			if (!second) {
				second = first;
				continue;
			}

			var firstSecondLength = distanceOnUnitSphere(first[0], first[1], second[0], second[1]) * RADIUS_EARTH;
			road['length'] += firstSecondLength;

			if (!third) {
				third = second;
				second = first;
				secondThirdLength = firstSecondLength;
				continue;
			}

			var firstThirdLength = distanceOnUnitSphere(first[0], first[1], third[0], third[1]) * RADIUS_EARTH;
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
		if (road['refs'].length == 2) 
			segments.push({ 'start': _coords[road['refs'][0]], 'end': _coords[road['refs'][1]], 'length': firstSecondLength, 'radius': 100000 });

		road['segments'] = segments;
		delete road['refs'];  // refs are no longer needed now that we have loaded our segments.

		// calculate the curvature as a weighted distance traveled at each curvature.
		road['curvature'] = 0;
		for (var i = 0, j = segments.length; i < j; i++) {
			var segment = segments[i];

			if (segment['radius'] < _level4MaxRadius)
				segment['curvatureLevel'] = 4;
			else if (segment['radius'] < _level3MaxRadius)
				segment['curvatureLevel'] = 3;
			else if (segment['radius'] < _level2MaxRadius)
				segment['curvatureLevel'] = 2;
			else if (segment['radius'] < _level1MaxRadius)
				segment['curvatureLevel'] = 1;
			else
				segment['curvatureLevel'] = 0;

			road['curvature'] += getCurvatureForSegment(segment);
		}
	}

	function calculate () {
		var marker = 1;
		var index = 0;

		if (_verbose)
			marker = _roads.length < 100 ? 1 : Math.floor(_roads.length / 100);

		var sections = [];
		while (_roads.length) {
			var road = _roads.pop();

			if (_verbose) {
				index++;
				if (!index % marker)
					console.log('.');
			}

			try {
				calculateDistanceAndCurvature(road);
				roadSections = splitWaySections(road);
				sections.push.apply(sections, roadSections);
			} catch (err) {
				continue;
			}
		}

		_roads = sections;

		if (_verbose)
			console.log('');
	};

	function coordsCallback (coords) {
		
		for (var i = 0, j = coords.length; i < j; i++) {
			var coord = coords[i];
			var osmId = coord.osmId, lon = coord.lon, lat = coord.lat;

			if (_minLatBound && lat < _minLatBound) 
				continue;

			if (_maxLatBound && lat > _maxLatBound)
				continue;

			if (_minLonBound && lon < _minLonBound)
				continue;

			if (_maxLonBound && lon > _maxLonBound)
				continue;

			if (_coords[osmId]) 
				continue;

			_coords[osmId] = {'lat': lat, 'lon': lon};

			if (_verbose) {
				_numCoords++;

				if (!(_numCoords % _coordsMarker))
					console.log('.');
			}
		}
	}

	function roadsCallback (roads) {

		for (var i = 0, j = roads.length; i < j; i++) {
			var road = roads[i];
			var osmId = road.osmId, tags = way.tags, refs = way.tags;

			// ignore circular roads (Maybe we don't need this)
			if (refs[0] === refs[refs.length - 1])
				continue;

			if (!tags['name'] && !tags['ref'])
				continue;

			if (tags['surface'] && _ignoredSurfaces.indexOf(tags['surface']) !== -1)
				continue;

			if (!tags['highway'] || _roadTypes.indexOf(tags['highway']) === -1)
				continue;

			var newRoad = { 'id': osmId, 'type': tags['highway'], 'refs': refs };

			if (!tags['name'])
				newRoad['name'] = tags['ref'];
			else if (tags['ref'])
				newRoad['name'] = tags['name'] + "(" + tags["ref"] + ")";
			else
				newRoad['name'] = tags['name'];

			newRoad['county'] = tags['tiger:county'] ? tags['tiger:county'] : '';

			newRoad['surface'] = tags['surface'] ? tags['surface'] : 'unknown';

			_roads.push(newRoad);

			for (var k = 0, l = refs.length; k < l; k++) {
				delete _coords[refs[k]];
			}

			if (!_verbose)
				continue;

			_numRoads++;

			if (!(_numRoads % 100))
				console.log('-');
		}
	}

	/* --------- Public Methods --------- */

	this.loadFile = function (fileName) {
		resetObjectState();

		if (_verbose)
			console.log('loading ways, each "-" is 100 ways, each row is 10,000 ways');

		var p = new OSMParser(roadsCallback);
		p.parse(fileName);

		if (_verbose) {
			console.log(_roads.length + " ways matched in " + fileName + ", " + 
				" coordinates will be loaded, each '.' is 1% complete");

			var total = _coords;	// todo: this will fail, in js its an {}
			_coordsMarker = total < 100 ? 1 : Math.floor(total / 100);
		}

		p = new OSMParser(coordsCallback);
		p.parse(fileName);

		if (_verbose)
			console.log('coordinates loaded, calulating curvature, each "." is 1% complete.');

		calculate();

		if (_verbose) {
			console.log("calculation complete");
		}
	};

	this.getRoads = function () {
		return _roads;
	}
};