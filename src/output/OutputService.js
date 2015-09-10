var TabOutput = require('./writers/TabOutput');
var SingleColorKmlOutput = require('./writers/SingleColorKmlOutput');
var MultiColorKmlOutput = require('./writers/MultiColorKmlOutput');
var WayFilter = require('../WayFilter');

/* This module is responsible for newing up the correct output writing classes,
 * and using them to write the result output in the correct formats and locations.
 *
 * @param {Logger} _logger - The instance we should log with.
 */
module.exports = function(_logger) {

    /* Returns a kml file writer that is configured according to the passed in arguments.
     *
     * @param {bool} colorize - Should the kml file be multicolored or not?
     * @param {bool} kmUnits - Should the file be in kilometers, or miles?
     * @param {WayFilter} filter - The filter that should be used to determine if a way should be written.
     * @returns {KmlOutput} kmlWriter - The kmlWriter instance that will write the kml file.
     */
    function getKMLWriter(colorize, kmUnits, filter) {
        var kml = colorize ? new MultiColorKmlOutput(filter) 
                           : new SingleColorKmlOutput(filter);
        
        if (kmUnits)
            kml.units = 'km';

        return kml;
    }

    /* A function that will parse colorize, optString, and defaultFilter, and returns
     * the objects required to get a kmlWriter for writing additional kml files.
     * 
     * @param {bool} colorize - Should the kml file be multicolored or not?
     * @param {string, delimited by ,} optString - The options for the additional kml files.
     * @param {WayFilter} filter - The filter that should supply default values if not otherwise specified in optstring.
     */
    function parseOptions(colorize, optString, defaultFilter) {
        var tempColor = false;
        var filter = new WayFilter(defaultFilter.minLength, defaultFilter.maxLength, 
    							   defaultFilter.minCurvature, defaultFilter.maxCurvature);
        
        var opts = optString.split(',');
        
        for (var i = 0, j = opts.length; i < j; i++) {
            var opt = opts[i];
            opt = opt.split('=');
            var key = opt[0];
            
            if (opt.length < 2) {
                _logger.forceLog("Key '" + key + "' passed to --addKML has no value, ignoring.\n");
                continue;
            }
            
            var value = opt[1];
            if (key === 'colorize') {
                tempColor = value == 1 ? true : false;
            }
            else if (key === 'minCurvature')
                filter.minCurvature = parseFloat(value);	// when debugging, check that value is a number.
            else if (key === 'maxCurvature')
                filter.maxCurvature = parseFloat(value);
            else if (key === 'minLength')
                filter.minLength = parseFloat(value);
            else if (key === 'maxLength')
                filter.maxLength = parseFloat(value);
            else
                _logger.forceLog("Ignoring unknown key '" + key + "'' passed to --addKML\n");
        }
        
        return {'colorize': tempColor, 'filter': filter};
    }

    /* Filters the input ways with the filter, and output the results in the manner and to the locations
     * specified by the other input arguments. 
     *
     * @param {[way]} ways - All of our calculated way objects.
     * @param {WayFilter} filter - The filter that should be used to determine if a way should be outputted or ignored.
     * @param {string} outputFileBaseName - Optional - Output files should share this string in the file name.
     * @param {string} path - The directory the output file should be saved to.
     * @param {bool} colorize - Should the output KML file should include colorized styles (red/orange/yellow/etc)?
     * @param {bool} useKM - If true, program will output values in kilometers.  Otherwise, miles.
     * @param {bool} outputToScreen - If true, program will (also) output values to the logger object.
     * @param {bool} skipKMLFile - If true, the output kml file is not created.
     * @param {obj} additionalKML - Multiple files can be created using this option, see README.md
     */
    this.outputResults = function(ways, filter, outputFileBaseName, path, colorize, useKM, outputToScreen, skipKMLFile, additionalKML) {
        
        if (outputToScreen) {
            var tab = new TabOutput(filter);
            tab.write(ways, _logger);
        }

        var kmlWriter;
        
        if (!skipKMLFile) {

            _logger.log("Generating KML file.");

            kmlWriter = getKMLWriter(colorize, useKM, filter);
            kmlWriter.write(ways, path, outputFileBaseName);
        }

        if (additionalKML) {

            _logger.log("Generating additional kml files.");

            for (var k = 0, l = additionalKML.length; k < l; k++) {
                var optString = additionalKML[k];

                var parsedOpts = parseOptions(colorize, optString, filter);
                kmlWriter = getKMLWriter(parsedOpts.colorize, useKM, parsedOpts.filter);
                kmlWriter.write(ways, path, outputFileBaseName);
            }
        }
    };
};