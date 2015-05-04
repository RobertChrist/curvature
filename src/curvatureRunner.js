var _path = require('path');
var _async = require('async');
var TabOutput 	 = require('./output/TabOutput');
var SingleColorKmlOutput 	= require('./output/SingleColorKmlOutput');
var MultiColorKmlOutput 	= require('./output/MultiColorKmlOutput');

var writeKMLFile = function (colorize, kmUnits, defaultFilter, ways, path, basename) {
    var kml = colorize ? new MultiColorKmlOutput(defaultFilter) : new SingleColorKmlOutput(defaultFilter);
    
	if (kmUnits)
		kml.units = 'km';

	kml.write(ways, path, basename);
};

var generateAdditionalKMLFile = function (colorize, optString, defaultFilter, useKM, basename, logger) {
	var filter = new WayFilter(defaultFilter.minLength, defaultFilter.maxLength, defaultFilter.minCurvature, defaultFilter.maxCurvature);

	var opts = optString.split(',');

	for (var i = 0, j = opts.length; i < j; i++) {
		var opt = opts[i];
		opt = opt.split('=');
		var key = opt[0];
		
		if (opt.length < 2) {
			logger.forceLog("Key '" + key + "' passed to --addKML has no value, ignoring.\n");
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
			logger.forceLog("Ignoring unknown key '" + key + "'' passed to --addKML\n");
	}

	writeKMLFile(colorize, useKM, filter, collector.getWays(), path, basename);
};


exports.run = function (logger, settings, filter, wayCollector) {
    var fileNameAndPath;
    var outputFileBaseName;

	var setFileNameAndPath = function (cb) {
		fileNameAndPath = _path.resolve(settings.file.value);

	    logger.log("Loading {" + fileNameAndPath + "}");

		cb(null);
    };
    
    var getFileNameAndPath = function(cb) {
        cb(null, fileNameAndPath);
    }

	var outputDataToLogger = function (cb) {
        if (settings.tabluarOutput.value) {
            var tab = new TabOutput(filter);
            tab.output(wayCollector.getWays(), logger);
        }

        cb();
    };

    var setBaseName = function (cb) {
        if (!settings.outputBasename || !settings.outputBasename.value) {
            outputFileBaseName = _path.basename(fileNameAndPath);
        } else {
            outputFileBaseName = _path.basename(settings.outputBasename.value);
        }
        
        cb();
    };

	var outputKMLFile = function (cb) {
		if (settings.noKML.value)
            return cb();

        logger.log("generating KML output");
        
        var path = !settings.outputPath.value ? _path.dirname(fileNameAndPath) : settings.outputPath.value;
        writeKMLFile(settings.colorize.value, settings.km.value, filter, wayCollector.getWays(), path, outputFileBaseName);

        cb();
	};

	var outputAdditionalFile = function (cb) {
		if (!settings.addKML.value)
            return;
        
        for (var k = 0, l = settings.addKML.value.length; k < l; k++) {
            var optString = settings.addKML.value[k];
            
            generateAdditionalKMLFile(settings.colorize.value, optString, filter, outputFileBaseName, logger);
        }

        cb();
	};


	logger.forceLog('curvature is starting.');

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
        
        logger.forceLog('curvature has finished successfully.');
    });
}