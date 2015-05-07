var _path = require('path');
var _async = require('async');
var TabOutput 	 = require('./output/TabOutput');
var SingleColorKmlOutput 	= require('./output/SingleColorKmlOutput');
var MultiColorKmlOutput 	= require('./output/MultiColorKmlOutput');

module.exports = function (_logger, _fileName, _outputDataToLogger, _baseName, _skipKMLFile, _colorize, _outputPath, _useKM, _additionalKML) {

    function writeKMLFile (colorize, kmUnits, defaultFilter, ways, path, basename) {
        var kml = colorize ? new MultiColorKmlOutput(defaultFilter) : new SingleColorKmlOutput(defaultFilter);
        
    	if (kmUnits)
    		kml.units = 'km';

    	kml.write(ways, path, basename);
    }

    function generateAdditionalKMLFile (colorize, optString, defaultFilter, useKM, basename) {
    	var filter = new WayFilter(defaultFilter.minLength, defaultFilter.maxLength, defaultFilter.minCurvature, defaultFilter.maxCurvature);

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

    	writeKMLFile(colorize, useKM, filter, collector.getWays(), path, basename);
    }

    this.run = function (filter, wayCollector) {
        var fileNameAndPath;
        var outputFileBaseName;

    	var setFileNameAndPath = function (cb) {
    		fileNameAndPath = _path.resolve(_fileName);

    	    _logger.log("Loading {" + fileNameAndPath + "}");

    		cb(null);
        };
        
        var getFileNameAndPath = function(cb) {
            cb(null, fileNameAndPath);
        }

    	var outputDataToLogger = function (cb) {
            if (_outputDataToLogger) {
                var tab = new TabOutput(filter);
                tab.output(wayCollector.getWays(), _logger);
            }

            cb();
        };

        var setBaseName = function (cb) {
            if (!_baseName) {
                outputFileBaseName = _path.basename(fileNameAndPath);
            } else {
                outputFileBaseName = _path.basename(_baseName);
            }
            
            cb();
        };

    	var outputKMLFile = function (cb) {
    		if (_skipKMLFile)
                return cb();

            _logger.log("generating KML output");
            
            var path = !_outputPath ? _path.dirname(fileNameAndPath) : _outputPath;
            writeKMLFile(_colorize, _useKM, filter, wayCollector.getWays(), path, outputFileBaseName);

            cb();
    	};

    	var outputAdditionalFile = function (cb) {
    		if (!_additionalKML)
                return;
            
            for (var k = 0, l = _additionalKML.length; k < l; k++) {
                var optString = _additionalKML[k];
                
                generateAdditionalKMLFile(_colorize, optString, filter, outputFileBaseName);
            }

            cb();
    	};


    	_logger.forceLog('curvature is starting.');

        _async.waterfall([
            setFileNameAndPath,
        	getFileNameAndPath,
            wayCollector.loadFile,
            outputDataToLogger,
            setBaseName,
            outputKMLFile,
            outputAdditionalFile
        ], function (err) {
            if (err)
                throw err;
            
            _logger.forceLog('curvature has finished successfully.');
        });
    }
}