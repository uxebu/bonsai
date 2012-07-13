define(function() {
  'use strict';

  /**
   * Creates an Error instance representing an error that occurs when trying
   * to parse segments.
   *
   * @constructor
   * @private
   * @param {Array} args The error args. Must at least provide a message.
   * @returns {Error} The error instance.
   * @memberOf module:error
   */
  function ParserError(args) {
    if (!(this instanceof ParserError)) {
      return new ParserError(args);
    }
    this.name = 'ParserError';
    this.message = args[0];
  }

  ParserError.prototype = new Error();
  ParserError.prototype.constructor = ParserError;

  var error = {
    ParserError: ParserError
  };

  return error;
});
