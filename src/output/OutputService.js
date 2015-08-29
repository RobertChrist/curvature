var TabOutput = require('./writers/TabOutput');
var SingleColorKmlOutput = require('./writers/SingleColorKmlOutput');
var MultiColorKmlOutput = require('./writers/MultiColorKmlOutput');

/* This module is responsible for newing up the correct output writing classes,
 * and using them to write the result output in the correct formats and locations.
 *
 * @param {Logger} _logger - The instance we should log with.
 */
module.exports = function(_logger) {

    function getKMLWriter(colorize, kmUnits, filter) {
        var kml = colorize ? new MultiColorKmlOutput(filter) 
                           : new SingleColorKmlOutput(filter);
        
        if (kmUnits)
            kml.units = 'km';

        return kml;
    }

    function parseOptions(colorize, optString, defaultFilter) {
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
                if (typeof value === "number")
                    colorize = 1;
                else
                    colorize = 0;
            } else if (key === 'minCurvature')
                filter.minCurvature = value;	// when debugging, check that value is a number.
            else if (key === 'maxCurvature')
                filter.maxCurvature = value;
            else if (key === 'minLength')
                filter.minLength = value;
            else if (key === 'maxLength')
                filter.maxLength = value;
            else
                _logger.forceLog("Ignoring unknown key '" + key + "'' passed to --addKML\n");
        }
        
        return {'colorize': colorize, 'filter': filter};
    }

    /* @param {string} fileNameAndPath - The relative or absolute name or name and path of the file we should load.
     * @param {bool} outputToScreen - Whether we should output the results to the screen 
     * @param {string } baseName - Optional - Output files should share this base file name.
     * @param {bool} skipKMLFile - If true, the output file is not created.
     * @param {bool} colorize - The output KML file should include colorized styles (red/orange/yellow/etc)
     * @param {bool} useKM - If true, program will output values in kilometers.
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

                var parsedOpts = parseOptions(optString);

                kmlWriter = getKMLWriter(parsedOpts.colorize, useKM, parsedOpts.filter);
                kmlWriter.write(ways, path, outputFileBaseName);
            }
        }
    };
};