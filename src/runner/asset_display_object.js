define([
  '../tools',
  './display_object',
  '../asset/asset_request'
], function(tools, DisplayObject, AssetRequest) {
  'use strict';

  var data = tools.descriptorData;

  /**
   * Constructs an AssetDisplayObject instance
   * (Should not be instantiated directly, should be inherited)
   *
   * @name AssetDisplayObject
   * @constructor
   */
  function AssetDisplayObject(loader, source, callback) {

    if (loader) {
      this._loader = loader;
    }

    this._request = null;

    DisplayObject.call(this);

    if (callback) {
      this.bindAssetCallback(callback);
    }
  }

  /** @lends AssetDisplayObject.prototype */
  var proto = AssetDisplayObject.prototype = Object.create(DisplayObject.prototype);

  /**
   *
   * Provides support to perform the loading of a Video or Bitmap via HTTP
   * Request and returns the current Video or Bitmap instance.
   *
   * @example
   * myVideo.request();
   * myVideo.request('../myMovie.mp4');
   * myVideo.request('http://www.movieCenter.com/myMovie.mp4');
   * myShape.request([
   *   {src:'../myMovie.mp4', type:'video/mp4'},
   *   {src:'../myMovie.ogv', type:'video/ogg'}
   * ]);
   * myShape.request({
   *   resources: [
   *     {src:'../myMovie.mp4', type:'video/mp4'},
   *     {src:'../myMovie.ogv', type:'video/ogg'}
   *   ],
   *   loadLevel: 'can-play'
   * });
   *
   * or in case of an image
   *
   * myBitmap.request();
   * myBitmap.request('../myImage.jpg');
   *
   *
   * @method
   * @this {AssetDisplayObject}
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @returns {AssetDisplayObject|AssetRequest} The current AssetDisplayObject Istance or an AssetRequest instance
   * @name request
   */
  proto.request = function(aRequest) {
    if (typeof aRequest === 'undefined') {
      return this._request;
    }
    var request = this._request = new AssetRequest(aRequest);
    this._loader.request(this, request, this.type);

    return this;
  };

  /**
   * Registers events for a callback function which'll be triggered for both
   * `error` and `load` events (i.e. node-style callback, `function(err, data) {}`)
   *
   * @param {Function} callback The function to be triggered upon `load` or `error`
   *
   * @returns {this}
   */
  proto.bindAssetCallback = function(callback) {

    // We need to unbind both events after either one is fired:
    var unbind = tools.hitch(this, function() {
      this.removeListener('load', loadHandler);
      this.removeListener('error', errorHandler);
    });

    function loadHandler() {
      unbind();
      callback.call(this, null, this);
    }
    function errorHandler(error) {
      unbind();
      callback.call(this, error, this);
    }

    this.on('load', loadHandler);
    this.on('error', errorHandler);
    return this;
  };

  return AssetDisplayObject;
});
