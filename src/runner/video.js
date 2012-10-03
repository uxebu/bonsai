define([
  './audio',
  '../tools'
], function(Audio, tools) {
  'use strict';

  var data = tools.descriptorData;

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

    Audio.call(this, loader, aRequest, callback);

    this.type = 'Video';

    Object.defineProperties(this._attributes, {
      height: data(options.height, true, true),
      width: data(options.width, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';

    this.request(aRequest);
  }

  var parentPrototype = Audio.prototype;
  var parentPrototypeDestroy = parentPrototype.destroy;

  /** @lends Video.prototype */
  var proto = Video.prototype = Object.create(parentPrototype);

  proto.request = function(aRequest) {
    debugger;
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
   * Destroys the DisplayObject and removes any references to the
   * asset, including data held by the renderer's assetController about the
   * source of the video
   *
   * @returns {this}
   */
  proto.destroy = function() {
    parentPrototypeDestroy.call(this);
    this._loader.destroyAsset(this);
    return this;
  };

  /**
   * Notify the video that the corresponding data has been loaded. To be used
   * by the asset loader.
   *
   * @private
   * @param {string} type Either 'load' or 'error'
   * @param data
   */
  proto.notify = function(type, data) {

    switch (type) {
      case 'load':
        // TODO: videoWidth vs attr.width
        // TODO: send onload some infos about the target
        if (typeof data !== 'undefined') {
          this.attr({width: data.width, height: data.height});
        }
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
