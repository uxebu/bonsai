define([
  './asset_display_object',
  '../asset/asset_request',
  '../tools'
], function(AssetDisplayObject, AssetRequest, tools) {
  'use strict';

  var data = tools.descriptorData;
  var accessor = tools.descriptorAccessor;
  var getter = tools.getter;

  /**
   * The Video constructor
   *
   * @constructor
   * @name Video
   * @extends AssetDisplayObject
   *
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @param {Function} [callback] A callback to be called when your movie has
   *  loaded (only called if you passed a `aRequest`). The callback will be called
   *  with it's first argument signifying an error. So, if the first argument
   *  is `null` you can assume the movie was loaded successfully.
   * @param {Object} [options]
   * @param {Number} [options.width] Width of the video
   * @param {Number} [options.height] Height of the video
   * @param {Boolean} [options.autoplay] Whether the video should auto-play
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.source The source of the video.
   * @property {number} __supportedAttributes__.height The height of the video.
   * @property {number} __supportedAttributes__.width The width of the video.
   *
   */
  function Video(loader, aRequest, callback, options) {
    options || (options = {});
    
    AssetDisplayObject.call(this, loader, aRequest, callback);

    this.type = 'Video';

    Object.defineProperties(this._attributes, {
      height: data(options.height, true, true),
      width: data(options.width, true, true),
      autoplay: data(options.autoplay || false, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';
    rendererAttributes.autoplay = 'autoplay';

    this.request(aRequest);
  }

  /** @lends Video.prototype */
  var proto = Video.prototype = Object.create(AssetDisplayObject.prototype);

  /**
   *
   * Provides support to perform the loading of a Video via HTTP. request and returns the current Video instance.
   * Or returns a copy of all the contained segments of the Shape when no parameter is given.
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
   * @method
   * @this {Video}
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @returns {AssetRequest} An AssetRequest instance
   * @memberOf module:video.Video
   * @name request
   */
  proto.request = function(aRequest) {
    if (typeof aRequest === 'undefined') {
      return this._request;
    }
    var request = this._request = new AssetRequest(aRequest);
    this._loader.request(this, request, this.type);
  };

  /**
   * Clones the method
   *
   * @returns {Video} Cloned instance
   */
  proto.clone = function() {
    // options are missing
    return new Video(this._loader, this._request);
  };

  /**
   * Notify the video that the corresponding data has been loaded. To be used
   * by the asset loader.
   *
   * @param {string} type Either 'load' or 'error'
   * @param data
   */
  proto.notify = function(type, data) {

    switch (type) {
      case 'load':
        // TODO: videoWidth vs attr.width
        // TODO: send onload some infos about the target
        this.attr({width: data.width, height: data.height});
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('load', this);
        break;
      case 'error':
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('error', Error(data.error));
    }

    return this;
  };

  proto.getComputed = function(key) {
    var value, size = key === 'size' && {top: 0, right: 0, bottom: 0, left: 0};
    if (key === 'width' || key === 'right') {
      value = this.attr('width') || 0;
    } else if (size) {
      size.right = size.width = this.attr('width') || 0;
    }
    if (key === 'height' || key === 'bottom') {
      value = this.attr('height') || 0;
    } else if (size) {
      size.bottom = size.height = this.attr('height') || 0;
    }
    if (key === 'top' || key === 'left') {
      value = 0;
    }

    return size || value;
  };

  return Video;
});
