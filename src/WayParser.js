/* Used for parsing out the information we need from the osm.pbf file.
 * 
 * @param {string[]} _wayTypes - Acceptable road types to return.  All others should be ignored.
 * @param {string[]} _ignoredSurfaces - road surfaces that should be ignored (unpaved / dirt, for example).
 * @param {Number} _minLatBound - The minimum latitude that should be parsed from the file.
 * @param {Number} _maxLatBound - The maximum latitude that should be parsed from the file.
 * @param {Number} _minLonBound - The minimum longitude that should be parsed from the file.
 * @param {Number} _maxLonBound - The maximum longitude that should be parsed from the file. 
 */
module.exports = function (_wayTypes, _ignoredSurfaces,
                           _minLatBound, _maxLatBound, 
                           _minLonBound, _maxLonBound) {

    var _ways = [];
    var _coords = {};
    var _routes = {};
    
    /* This function takes in a coord that was read from the file, and if
     * it matches through our configuration, adds it to the local _coords object.
     * Coords are only loaded into memory if they have been marked as necessary by a way
     * that was passed into parseWay, which means all ways must be parsed before any coords are parsed.
     * This is done as a memory saving technique.
     * 
     * @param {obj} coord - The raw data instance read from the osm file. 
     */
    this.parseCoord = function(coord) {
        var osmId = coord.id, lon = coord.lon, lat = coord.lat;

        if (_minLatBound && lat < _minLatBound)
            return;

        if (_maxLatBound && lat > _maxLatBound)
            return;

        if (_minLonBound && lon < _minLonBound)
            return;

        if (_maxLonBound && lon > _maxLonBound)
            return;

        if (!_coords[osmId])
            return;
        
        _coords[osmId] = { 'lat': lat, 'lon': lon };
    };
    
    /* This function takes in a way that was read from the file, and if
     * it matches through our configuration, adds it to the local _ways object.
     * All coordinates that are included in the way are marked as true, in the local coords object.
     * When parseCoord is called, only coords marked as true will be updated to include latitude and longitude
     * data as a memory savings.  This means, however, that parseWay must be called for all ways before 
     * parseCoords is called for any coord.
     * 
     * @param {obj} way - The raw data instance read from the osm file. 
     */
    this.parseWay = function(way) {
        var osmId = way.id, tags = way.tags, refs = way.refs;

        // ignore circular ways (Maybe we don't need this)
        if (refs[0] === refs[refs.length - 1])
            return;

        if (!tags.name && !tags.ref)
            return;

        if (tags.surface && _ignoredSurfaces.indexOf(tags.surface) !== -1)
            return;

        if (!tags.highway || _wayTypes.indexOf(tags.highway) === -1)
            return;

        var newWay = { 'id': osmId, 'type': tags.highway, 'refs': refs };

        if (!tags.name)
            newWay.name = tags.ref;
        else if (tags.ref)
            newWay.name = tags.name + "(" + tags.ref + ")";
        else
            newWay.name = tags.name;

        newWay.county = tags['tiger:county'] ? tags['tiger:county'] : '';

        newWay.surface = tags.surface ? tags.surface : 'unknown';

        // Add our ways to a route collection if we can match them either
        // by route-number or alternatively, by name. These route-collections
        // will later be joined into longer segments so that curvature
        // calculations can extend over multiple way-segments that might be
        // split due to bridges, local names, speed limits, or other metadata
        // changes.
        if (tags.ref) {

            var routes = tags.ref.split(';');
            for (var i = 0, j = routes.length; i < j; i++) {
                var route = routes[i];

                if (!_self.routes[route])
                    _self.routes[route] = [];

                _self.routes[route].push(JSON.parse(JSON.stringify(newWay)));
            }
        } 
        else {
            if (newWay.name) {
                if (!_self.routes[newWay.name])
                    _self.routes[newWay.name] = [];

                _self.routes[newWay.name].push(newWay);
            }
            else
                _ways.push(newWay);
        }

        for (var i = 0, j = refs.length; i < j; i++) {
            _coords[refs[i]] = true;
        }
    };

    /* Once all of the data has been parsed from its raw form,
     * it still needs to be cleaned up to the state that we can work with it.
     * So call this once all your way / coord parsing is done, and before calling getResults.
     */
    this.joinWays = function () {
        // Join routes end-to-end and add them to the way list.

        var routeKeys = Object.keys(_self.routes);
        for (var i = 0, j = routeKeys.length; i < j; i++) {
            var route = routeKeys[i];
            var ways = _self.routes[route];

            while (ways.length > 0) {
                var baseWay = ways.pop();

                // Loop through all our ways at least as many times as we have ways
                // to be able to catch any that join onto the end after others have
                // been joined on.
                var maxLoop = ways.length;
                for (var k = 0, l = maxLoop; k < l; k++) {

                    // try to join to the begining or end
                    var unusedWays = [];
                    while (ways.length > 0) {
                        var way = ways.pop();

                        // join to the end of the base in order
                        if (baseWay.refs[baseWay.refs.length - 1] === way.refs[0] && !baseWay.refs[way.refs[way.refs.length - 1]]) {
                            // Drop the matching first-ref in the way so that we don't have a duplicate point.
                            way.refs.splice(0, 1);

                            baseWay.refs = baseWay.refs.concat(way.refs);
                            if (baseWay.name !== way.name) {
                                baseWay.name = route;
                            }
                        }
                        // join to the end of the base in reverse order
                        else if (baseWay.refs[baseWay.refs.length - 1] === way.refs[way.refs.length - 1] && !baseWay.refs[way.refs[0]]) {
                            way.refs.reverse();
                            
                            // Drop the matching first-ref in the way so that we don't have a duplicate point.
                            way.refs.splice(0, 1);

                            baseWay.refs = baseWay.refs.concat(way.refs);

                            if (baseWay.name !== way.name)
                                baseWay.name = route;
                        }
                        // join to the beginning of the base in order
                        else if (baseWay.refs[0] === way.refs[way.refs.length - 1] && !baseWay.refs[way.refs[0]]) {
                            // Drop the matching last-ref in the way so that we don't have a duplicate point.
                            way.refs.splice(way.refs.length - 1, 1);

                            baseWay.refs = way.refs.concat(baseWay.refs);

                            if (baseWay.name !== way.name)
                                baseWay.name = route;
                        }
                        // join to the beginning of the base in reverse order
                        else if (baseWay.refs[0] === way.refs[0] && !baseWay.refs[way.refs[way.refs.length - 1]]) {
                            way.refs.reverse();

                            // Drop the matching last-ref in the way so that we don't have a duplicate point.
                            way.refs.splice(way.refs.length - 1, 1);

                            baseWay.refs = way.refs.concat(baseWay.refs);

                            if (baseWay.name !== way.name)
                                baseWay.name = route;
                        }
                        else {
                            unusedWays.push(way);
                        }
                    }

                    // Continue on joining the rest of the ways in this route.
                    ways = unusedWays;
                }

                // Add this base way to our ways list
                _self.ways.push(baseWay);
            }
        }
    };

    /* @returns {{ways: '[]', coords: {}}} - Returns an object of all parsed coordinates and ways */
    this.getResults = function() {
        return { ways: _ways, coords: _coords };
    };
};