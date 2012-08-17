define([
  './asset_display_object',
  '../tools'
], function(AssetDisplayObject, tools) {
  'use strict';

  var data = tools.descriptorData;

  /**
   * The Bitmap constructor
   *
   * @constructor
   * @name Bitmap
   * @extends AssetDisplayObject
   *
   * @param {AssetLoader} loader The asset loader to use;
   * @param {String} [source] The URL location of the movie to load.
   * @param {Function} [callback] A callback to be called when your movie has
   *  loaded (only called if you passed a `url`). The callback will be called
   *  with it's first argument signifying an error. So, if the first argument
   *  is `null` you can assume the movie was loaded successfully.
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.source The source of the bitmap.
   * @property {number} __supportedAttributes__.height The height of the bitmap.
   * @property {number} __supportedAttributes__.width The width of the bitmap.
   *
   */
  function Bitmap(loader, source, callback) {

    AssetDisplayObject.call(this, loader, source, callback);

    this.type = 'Bitmap';

    Object.defineProperties(this._attributes, {
      height: data(null, true, true),
      width: data(null, true, true),
      _naturalWidth: data(0, true, true),
      _naturalHeight: data(0, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';
    rendererAttributes.naturalHeight = '_naturalHeight';
    rendererAttributes.naturalWidth = '_naturalWidth';

    this.attr('source', source);
  }

  /** @lends Bitmap.prototype */
  var proto = Bitmap.prototype = Object.create(AssetDisplayObject.prototype);

  /**
   * Clones the method
   *
   * @returns {Bitmap} Cloned instance
   */
  proto.clone = function() {
    return new Bitmap(this._loader, this.attr('source'));
  };

  /**
   * Notify the bitmap that the corresponding data has been loaded. To be used
   * by the asset loader.
   *
   * @private
   * @param {string} type Either 'load' or 'error'
   * @param data
   * @returns {this} The current instance
   *
   */
  proto.notify = function(type, data) {

    switch (type) {
      case 'load':
        this._attributes._naturalWidth = data.width;
        this._attributes._naturalHeight = data.height;
        this._mutatedAttributes.naturalWidth = true;
        this._mutatedAttributes.naturalHeight = true;
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('load', this);
        this.markUpdate();
        break;
      case 'error':
        // We trigger the event asynchronously so as to ensure that any events
        // bound after instantiation are still triggered:
        this.emitAsync('error', Error(data.error), this);
        break;
    }

    return this;
  };

  /**
   * Get computed dimensions of the bitmap
   *
   * @param {String} key any of 'size', 'width', 'height', 'top', 'right', 'left', 'bottom'
   * @returns {Object|Number} For the key 'size' it'll return an object with all
   *  properties, otherwise it'll return a single number for the key specified.
   */
  proto.getComputed = function(key) {

    var value,
        size = key === 'size' && {top: 0, right: 0, bottom: 0, left: 0},
        naturalWidth = this._attributes._naturalWidth,
        naturalHeight = this._attributes._naturalHeight,
        attrWidth = this.attr('width'),
        attrHeight = this.attr('height'),
        naturalRatio = naturalWidth / naturalHeight,

        // If one dimensions is not specified, then we use the other dimension
        // and the ratio to calculate its size:
        width = attrWidth || (
          attrHeight != null ? naturalRatio * attrHeight : naturalWidth
        ) || 0,
        height = attrHeight || (
          attrWidth != null ? attrWidth / naturalRatio : naturalHeight
        ) || 0;

    if (key === 'width' || key === 'right') {
      value = width;
    } else if (size) {
      size.right = size.width = width;
    }
    if (key === 'height' || key === 'bottom') {
      value = height;
    } else if (size) {
      size.bottom = size.height = height;
    }
    if (key === 'top' || key === 'left') {
      value = 0;
    }

    return size || value;
  };

  return Bitmap;
});
