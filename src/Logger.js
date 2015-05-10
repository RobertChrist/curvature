/* Gives us a centralized point for all our logging.
 * @param {bool} verbose - If true, messages will log to the console.  If false, will swallow messages.
 */
module.exports = function Logger (verbose) {
	if (!(this instanceof Logger))
		throw new Error('Constructor functions must be called with new');

	this.log = verbose ? console.log : function (message) { }

	/* Will log the message, regardless of this logger's verbosity setting */
	this.forceLog = console.log;
}