define([
  './media_display_object'
], function(MediaDisplayObject) {
  'use strict';

  /**
   * The Audio constructor
   *
   * @constructor
   * @name Audio
   * @extends AssetDisplayObject
   *
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @param {Function} [callback] A callback to be called when your movie has
   *  loaded (only called if you passed a `aRequest`). The callback will be called
   *  with it's first argument signifying an error. So, if the first argument
   *  is `null` you can assume the movie was loaded successfully.
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.source The source of the audio.
   * @property {string} __supportedAttributes__.volume The volume of the audio
   *  (between 0 and 1 inclusive)
   *
   */
  function Audio(loader, aRequest, callback) {
    MediaDisplayObject.call(this, loader, aRequest, callback);
    this.type = 'Audio';
    this.request(aRequest);
  }

  /** @lends Audio.prototype */
  var proto = Audio.prototype = Object.create(MediaDisplayObject.prototype);

  /**
   * Clones the method
   *
   * @returns {Audio} Cloned instance
   */
  proto.clone = function() {
    // options are missing
    return new Audio(this._loader, this._request);
  };

  return Audio;
});
