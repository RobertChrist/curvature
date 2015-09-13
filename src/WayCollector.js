var _osm = require('openstreetmap-stream'),
    _through = require('through2');

/* WayCollector is responsible for parsing an osm.pbf file for the ways and coordinates
 * stored within.  It can currently only read osm.pbf, not osm.bz2 files.
 *
 * @class
 * @param {Logger} _logger - Our logging instance.
 * @param {WayParser} _wayParser - The instance we should use to parse information from the osm file.
 * @param {WayCalculator} _wayCalculator - The instance we should use to calculate way curvature.
 */
module.exports = function (_logger, _wayParser, _wayCalculator) {

	var _self = this;

    function readFile(fileNameAndPath, onRead, cb) {
        _osm.createReadStream(fileNameAndPath)
            .pipe(_through.obj(
                onRead,
                function() {
                    cb();
                })
            );
    }

    /* An internal function for WayCollector.js that we've made public to allow unit testing. */
    this._parseWay = function(data, enc, next) {
        if (data.type === 'way')
            _wayParser.parseWay(data);

        next();
    };

	/* An internal function for WayCollector.js that we've made public to allow unit testing. */
    this._parseCoord = function(data, enc, next) {
        if (data.type === 'node')
            _wayParser.parseCoord(data);

        next();
    };

	/* An internal function for WayCollector.js that we've made public to allow unit testing. */
    this._afterAllParsed = function (cb) {
        _logger.log('Consolidating parsed data.');
        _wayParser.joinWays();
        
        var results = _wayParser.getResults();

        if (!results.ways.length)
            return cb('A problem was encountered, no data was loaded from file.  ' +
                'This is most likely because the input file was osm.bz2 and not osm.pbf!');

        _logger.log('FILE LOADING COMPLETE!');

        _logger.log('Calulating curvature, this may take a while.');
        var ways = _wayCalculator.calculate(results.ways, results.coords);

        _logger.log("Calculations complete.");

        cb(null, ways);
    };

    /* Will parse the file located at the input fileNameAndPath looking for ways and coordinates,
     * which will then be used to calculate road curvatures.  Calls cb when complete.
     * 
     * @param {string} fileNameAndPath - the file location and name, ex: C:/RhodeIsland.osm.pbf  
     * 		The passed in file must be a pbf file.
     * @param {function} cb - This will be called on completion.  If no errors occurred, 
 	 *		the second argument will be the ways that were parsed from the file, complete
 	 * 		 with their calculated curvature and additional information.
     */
	this.loadFile = function (fileNameAndPath, cb) {
	    readFile(fileNameAndPath, _self._parseWay, function(err) {

	        _logger.log('Loading Ways complete.  Now loading coordinates.');
	        
	        if (err)
	        	return cb(err);

	        readFile(fileNameAndPath, _self._parseCoord, function(err) {
	            _logger.log('Loading coords complete.  Verifying loaded data.');

	            if (err)
	            	return cb(err);

                _self._afterAllParsed(cb); 
	        });
	    });
	};
};