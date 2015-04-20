/* Holds all of the configuration settings for this application.
 * This object mainly exists so we aren't tied to commandLineParser.js, 
 * as well as giving us a centralized place to do validation on the user input.
 * 
 * If not args are passed in, settings will take default values.
 * To initialize to something else, an object can be passed into the constructor.
 * An exception will be thrown if anything is updated to a grossly invalid value.
 * 
 * @param {object} args - An optional object with key values that match settings object.
 * 		For example, to update settings.minLatbound and settings.tabularOutput, pass in { tabularOutput: true, minLatBound: null };
 * 		No error will be thrown if the passed in object contains incorrect keys, but nothing will be updated either.
 */
module.exports = function (args) {
	this.settings = {
		verbose,						{ name: 'v', 				value: false					}, 
		tabluarOutput: 					{ name: 't', 				value: false					},
		noKML: 			 				{ name: 'noKML',			value: false 					},
		km: 			 				{ name: 'km',				value: true 					},
		colorize: 		 				{ name: 'colorize',			value: false 					},
		file: 			 				{ name: 'file',				value: null 					},
		outputPath: 	 				{ name: 'outputPath',		value: '.' 						},
		outputBaseName:  				{ name: 'outputBaseName',	value: null, 	optional: true 	},
		
		minLength: 		 				{ name: 'minLength',		value: 1 						},
		maxLength: 		 				{ name: 'maxLength',		value: 0 						},
		minCurvature: 	 				{ name: 'minCurvature',		value: 300 						},
		maxCurvature: 	 				{ name: 'maxCurvature',		value: 0 						},
		straightSegmentSplitThreshold:  { name: 'straightSegmentSplitThreshold', value: 2414 },

		level1MaxRadius: 				{ name: 'level1MaxRadius',	value: 175 						},
		level2MaxRadius: 				{ name: 'level2MaxRadius',	value: 100 						},
		level3MaxRadius: 				{ name: 'level3MaxRadius',	value: 60 						},
		level4MaxRadius: 				{ name: 'level4MaxRadius',	value: 2 						},
		level1Weight: 	 				{ name: 'level1Weight',		value: 1 						},
		level2Weight: 	 				{ name: 'level2Weight',		value: 1.3 						},
		level3Weight: 	 				{ name: 'level3Weight',		value: 1.6 						},
		level4Weight: 	 				{ name: 'level4Weight',		value: 2 						},
		
		minLatBound: 	 				{ name: 'minLatBound',		value: null, 	optional: true 	},
		maxlatBound: 	 				{ name: 'maxlatBound',		value: null, 	optional: true  },
		minLonBound: 	 				{ name: 'minLonBound',		value: null, 	optional: true  },
		maxlonBound: 	 				{ name: 'maxlonBound',		value: null, 	optional: true  },
		
		addKML: 		 				{ name: 'addKML',			value: null, 	optional: true  },
		
		ignoredSurfaces: 				{ name: 'ignoredSurfaces',	value: 'dirt,unpaved,gravel,sand,grass,ground' },
		highwayTypes: 	 				{ name: 'highwayTypes',		value: 'secondary,residential,tertiary,primary,primary_link,motorway,motorway_link,road,trunk,trunk_link,unclassified' }
	};

	function hasValue(obj, prop) {
		return obj[prop] !== undefined && obj[prop] !== null;
	}

	function ensureValue = function (obj, prop) {
		if (!hasValue(obj, prop))
			throw new Error(prop + ' was not specified.');
	}

	// Throws an exception if any non-optional parameter is missing a value.
	function validate() {
		var settings = this.settings;

		for (var setting in settings) {
			if (!setting.optional)
				ensureValue(setting, 'value');
		}

		if (settings.level1MaxRadius > settings.level2MaxRadius ||
			  settings.level2MaxRadius > settings.level3MaxRadius ||
			  settings.level3MaxRadius > settings.level4MaxRadius)
			throw new Error('Max Radius settings are out of order.  Level 1 must be > Level 2, etc.');

		if (settings.level1MaxRadius < 0 ||
			settings.level2MaxRadius < 0 || 
			settings.level3MaxRadius < 0 || 
			settings.level4MaxRadius < 0)
			throw new Error('Max radius settings must be positive.');

		if (settings.minLength < 0 || settings.maxLength < 0) 
			throw new Error('Road min and max length settings must be 0 or greater.');

		if (settings.straightSegmentSplitThreshold <= 0)
			throw new Error('straightSegmentSplitThreshold must be greater than 0');
	}

	/* Updates the public settings of this object, but throws an exception if any value was updated to an invalid value.
	 * No error will be thrown if the passed in object contains incorrect keys, but nothing will be updated either.
	 * @param {object} args - An object with key values that match settings object.
	 * 		For example, to update minLatbound and tabularOutput, pass in { tabularOutput: true, minLatBound: null };
	 */
	function updateSettings (args) {
		for (var setting in this.settings) {
			if (hasValue(args, setting))
				this.settings[setting].value = arg[setting];
		}

		validate();
	}

	if (args)
		this.updateSettings(args);
};