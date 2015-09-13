var fs = require('fs');

/* Holds all of the configuration settings for this application.
 * This object mainly exists so we aren't tied to commandLineParser.js, 
 * as well as giving us a centralized place to do validation on the user input.
 *
 * @class
 */
module.exports = function () {
	this.settings = {
		verbose:						{ name: 'v', 				value: false					}, 
		tabularOutput: 					{ name: 't', 				value: false					},
		noKML: 			 				{ name: 'noKML',			value: false 					},
		km: 			 				{ name: 'km',				value: true 					},
		colorize: 		 				{ name: 'colorize',			value: false 					},
		limitPoints:					{ name: 'limitPoints',		value: 0						},
		relativeColor: 					{ name: 'relativeColor', 	value: false					},
		file: 			 				{ name: 'file',				value: null 					},
		outputPath: 	 				{ name: 'outputPath',		value: '.' 						},
		outputBaseName:  				{ name: 'outputBaseName',	value: null, 	optional: true 	},
		
		minLength: 		 				{ name: 'minLength',		value: 1 						},
		maxLength: 		 				{ name: 'maxLength',		value: 0 						},
		minCurvature: 	 				{ name: 'minCurvature',		value: 300 						},
		
		//TODO: setting max curvature to 0 by default is crazy, should be null, then we can validate max > min.  Fix after fixing wayFilter.
		maxCurvature: 	 				{ name: 'maxCurvature',		value: 0 						},
		straightSegmentSplitThreshold:  { name: 'straightSegmentSplitThreshold', value: 2414 },	// 2414 meters ~= 1.5 miles, 1609 ~= 1 mile

		level1MaxRadius: 				{ name: 'level1MaxRadius',	value: 175 						},
		level2MaxRadius: 				{ name: 'level2MaxRadius',	value: 100 						},
		level3MaxRadius: 				{ name: 'level3MaxRadius',	value: 60 						},
		level4MaxRadius: 				{ name: 'level4MaxRadius',	value: 30 						},
		level1Weight: 	 				{ name: 'level1Weight',		value: 1 						},
		level2Weight: 	 				{ name: 'level2Weight',		value: 1.3 						},
		level3Weight: 	 				{ name: 'level3Weight',		value: 1.6 						},
		level4Weight: 	 				{ name: 'level4Weight',		value: 2 						},
		
		minLatBound: 	 				{ name: 'minLatBound',		value: null, 	optional: true 	},
		maxLatBound: 	 				{ name: 'maxLatBound',		value: null, 	optional: true  },
		minLonBound: 	 				{ name: 'minLonBound',		value: null, 	optional: true  },
		maxLonBound: 	 				{ name: 'maxLonBound',		value: null, 	optional: true  },
		
		addKML: 		 				{ name: 'addKML',			value: null, 	optional: true  },
		
		ignoredSurfaces: 				{ name: 'ignoredSurfaces',	value: 'dirt,unpaved,gravel,fine_gravel,sand,grass,ground' },
		wayTypes: 	 				    { name: 'highwayTypes',		value: 'secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' }
	};

	/* Tests that obj[prop] !== undefined && !== null.
	 *
	 * @param {object} obj - The object with said property.
	 * @param {key} prop -  The property to test for.
	 */
	function hasValue(obj, prop) {
		return obj[prop] !== undefined && obj[prop] !== null;
	}

	/* Checks the current state of the passed in settings object.  Throws an exception if any 
	 * required value is missing, or a clearly invalid value is detected.
	 */
	function validate(settings) {
        for (var settingsKey in settings) {
        	var setting = settings[settingsKey];

            if (setting.optional)
                continue;

			if (!hasValue(setting, 'value'))
			    throw new Error(settingsKey + ' was not specified');
		}

		if (settings.level1MaxRadius.value < settings.level2MaxRadius.value ||
			  settings.level2MaxRadius.value < settings.level3MaxRadius.value ||
			  settings.level3MaxRadius.value < settings.level4MaxRadius.value)
			throw new Error('Max Radius settings are out of order.  Level 1 must be > Level 2, etc.');

		if (settings.level1MaxRadius.value < 0 ||
			settings.level2MaxRadius.value < 0 || 
			settings.level3MaxRadius.value < 0 || 
			settings.level4MaxRadius.value < 0)
			throw new Error('Max radius settings must be positive.');

		if (settings.minLength.value < 0 || settings.maxLength.value < 0) 
			throw new Error('Road min and max length settings must be 0 or greater.');

		if (settings.straightSegmentSplitThreshold.value <= 0)
			throw new Error('straightSegmentSplitThreshold must be greater than 0');

		var fileName = settings.file.value;
		if (fileName.indexOf('osm.pbf', fileName.length - 'osm.pbf'.length) === -1)
			throw new Error('Curvature.js requires the input file be of type osm.pbf ' + 
				'due to our dependency on openstreetmap-stream.');

	    if (settings.outputPath) {
            try {
                fs.mkdirSync(settings.outputPath.value);
            } catch (e) {
                if (e.code !== 'EEXIST')
                    throw e;
            }
	    }

	    if (settings.limitPoints.value !== 0 && settings.limitPoints.value < 2)
	    	throw new Error('--limit_points must be 0 or >= 2.\n');
	}

	/* Updates the public settings of this object, but throws an exception if any value was updated to an invalid value.
	 * No error will be thrown if the passed in object contains incorrect keys, but nothing will be updated either.
	 *
	 * @param {object} updates - An object literal with key values that match the names parameter in the settings object.
	 * 		For example, to update minLatbound and tabularOutput, pass in { t: true, minLatBound: null };
	 */
	this.updateSettingsByName = function (updates) {
		var settingsClone = JSON.parse(JSON.stringify(this.settings));

		for (var updateKey in updates) {
			if (!updates.hasOwnProperty(updateKey))
				continue;

			for (var settingkey in settingsClone) {
				if (settingsClone[settingkey].name === updateKey) {
					settingsClone[settingkey].value = updates[updateKey];
					break;
				}
			}
		}

		validate(settingsClone);

		this.settings = settingsClone;
	};
};