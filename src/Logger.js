/* Gives us a centralized point for all our logging.
 * @param {bool} verbose - If true, messages will log to the console.  If false, will swallow messages.
 */
module.exports = function (verbose) {
	this.log = verbose ? console.log : function (message) { }
	this.forceLog = console.log;
}