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
    
    /* This function takes in a coord that was read from the file, and if
     * it matches through our configuration, adds it to the local _coords object.
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

        if (_coords[osmId])
            return;

        if (_coords[osmId])
            _coords[osmId] = { 'lat': lat, 'lon': lon };
    };
    
    /* This function takes in a way that was read from the file, and if
     * it matches through our configuration, adds it to the local _ways object.
     * It also seems to delete things from the _coords object, but currently that is buggy, 
     * and I don't know why.  TODO: 
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

        _ways.push(newWay);

        for (var i = 0, j = refs.length; i < j; i++) {
            _coords[refs[i]] = true;
        }
    };

    this.getResults = function() {
        return { ways: _ways, coords: _coords };
    };
};