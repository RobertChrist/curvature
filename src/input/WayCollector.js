var _osm = require('openstreetmap-stream'),
    _through = require('through2'),
    _fs = require('fs');

module.exports = function (_logger, _wayCalculator, _wayTypes, _ignoredSurfaces,
                           _minLatBound,     _maxLatBound, 
                           _minLonBound,     _maxLonBound) {

    /* --------- Object State --------- */
    var _ways = [];
    var _coords = {};

    /* --------- Local Methods --------- */
    
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

	this.loadFile = function (fileName, cb) {
        _ways = [];
        _coords = {};

        _logger.log('Now loading file, this operation may take awhile.');

	    _osm.createReadStream(fileName)
	        .pipe(_through.obj(
                function (data, enc, next) {
                    // TODO: due to the nature of node streams, it would be faster to batch these into arrays, and then do parallel processing on them,
                    // but that obviously comes with memory concerns.  For now, I've ripped out all logging here, to make this simpler, but that should probably be re-added.

                    if (data.type === 'node') 
                        coordCallback(data);

                    if (data.type === 'way')
                        waysCallback(data);

	                next();
	            }, function() {
                    _logger.log('FILE LOADED SUCCESSFULLY!');
                    _logger.log('Calulating curvature, this may take a while.');

                    _ways = _wayCalculator.calculate(_ways, _coords);
                    
                    _logger.log("Calculation complete.");

                    cb();
                })
            );
	}

	this.getWays = function () {
		return _ways;
	}
};