var _osm = require('openstreetmap-stream'),
    _through = require('through2'),
    _fs = require('fs');

/* WayCollector is responsible for parsing an osm.pbf file for the ways and coordinates
 * stored within.  It can currently only read osm.pbf, not osm.bz2 files.
 *
 * @class
 * @param {Logger} _logger - Our logging instance.
 * @param {WayCalculator} _wayCalculator - The instance we should use to calculate way curvature.
 * @param {string[]} _wayTypes - Acceptable road types to return.  All others should be ignored.
 * @param {string[]} _ignoredSurfaces - road surfaces that should be ignored (unpaved / dirt, for example).
 * @param {Number} _minLatBound - The minimum latitude that should be parsed from the file.
 * @param {Number} _maxLatBound - The maximum latitude that should be parsed from the file.
 * @param {Number} _minLonBound - The minimum longitude that should be parsed from the file.
 * @param {Number} _maxLonBound - The maximum longitude that should be parsed from the file. 
 */
module.exports = function (_logger, _wayCalculator, _wayTypes, _ignoredSurfaces,
                           _minLatBound,     _maxLatBound, 
                           _minLonBound,     _maxLonBound) {

    /* --------- Object State --------- */
    var _ways = [];
    var _coords = {};

    /* --------- Local Methods --------- */
    
    /* This function takes in a coord that was read from the file, and if
     * it matches through our configuration, adds it to the local _coords object.
     * 
     * @param {obj} coord - The raw data instance read from the osm file. 
     */
    function coordCallback (coord) {
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

        _coords[osmId] = {'lat': lat, 'lon': lon};
    }

    /* This function takes in a way that was read from the file, and if
     * it matches through our configuration, adds it to the local _ways object.
     * It also seems to delete things from the _coords object, but currently that is buggy, 
     * and I don't know why.  TODO: 
     * 
     * @param {obj} way - The raw data instance read from the osm file. 
     */
    function waysCallback (way) {
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

        for (var k = 0, l = refs.length; k < l; k++) {
            delete _coords[refs[k]];
        }
    }

    /* Will parse the file located at the input fileNameAndPath looking for ways and coordinates,
     * which will then be used to calculate road curvatures.  Calls cb when complete.
     * 
     * @param {string} fileNameAndPath - the file location and name, ex: C:/RhodeIsland.osm.pbf  
     * 		The passed in file must be a pbf file.
     * @param {function} cb - This will be called with no arguments on completion.
     */
	this.loadFile = function (fileNameAndPath, cb) {
        _ways = [];
        _coords = {};

        _logger.log('Now loading file, this operation may take awhile.');

	    _osm.createReadStream(fileNameAndPath)
	        .pipe(_through.obj(
                function (data, enc, next) {
                    // TODO: due to the nature of node streams, it would be faster to batch these
                    // into arrays, and then do parallel processing on them,
                    // but that obviously comes with memory concerns.  For now, I've ripped out all 
                    // logging here, to make this simpler, but that should probably be re-added.

                    if (data.type === 'node') 
                        coordCallback(data);

                    if (data.type === 'way')
                        waysCallback(data);

	                next();
	            }, function() {
	            	if (!_ways.length)
	            		throw new Error('A problem was encountered, no data was loaded from file.  ' + 
	            			'This is most likely because the input file was osm.bz2 and not osm.pbf!');

                    _logger.log('FILE LOADING COMPLETE!');
                    _logger.log('Calulating curvature, this may take a while.');

                    // todo: why is this called here?  why not from curvature runner?
                    _ways = _wayCalculator.calculate(_ways, _coords);
                    
                    _logger.log("Calculation complete.");

                    cb();
                })
            );
	};

	/* Returns the ways that were parsed from the file during this.loadFile
	 * 
	 * @output {obj[]} - The ways that were parsed from the file, complete 
	 *	with their calculated curvature and additional information.
	 */
	this.getWays = function () {
		return _ways;
	};
};