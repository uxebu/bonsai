/**
 * Contains the Bitmap class.
 *
 * @exports bitmap
 * @requires module:display_object
 * @requires module:tools
 */
define([
  './display_object',
  './asset_display_object',
  '../asset/asset_request',
  '../tools'
], function(DisplayObject, AssetDisplayObject, AssetRequest, tools) {
  'use strict';

  var data = tools.descriptorData, accessor = tools.descriptorAccessor;
  var getSource = tools.getter('_source');
  function setSource(source) {
    this._source = source;
    var bitmap = this._owner;
    bitmap.request.call(bitmap, source);
  }

  /**
   * The Bitmap constructor
   *
   * @constructor
   *
   * @extends module:display_object.DisplayObject
   *
   * @param {AssetLoader} loader The asset loader to use;
   * @param {string} source The source url of the bitmap
   * @param {Object} [options]
   * @param {Function} [options.onload] A handler for the 'load' event.
   * @param {Function} [options.onerror] A handler for the 'error' event.
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

    this._loader = loader;

    DisplayObject.call(this);

    if (callback) {
      this.bindAssetCallback(callback);
    }

    this.type = 'Bitmap';

    Object.defineProperties(this._attributes, {
      height: data(null, true, true),
      width: data(null, true, true),
      source: accessor(getSource, setSource, true),
      _naturalWidth: data(0, true, true),
      _naturalHeight: data(0, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';
    rendererAttributes.naturalHeight = '_naturalHeight';
    rendererAttributes.naturalWidth = '_naturalWidth';
    rendererAttributes.source = '_source';

    this.attr('source', source);
  }

  var proto = Bitmap.prototype = tools.mixin(Object.create(DisplayObject.prototype), AssetDisplayObject);

  /**
   *
   * Provides support to perform the loading of an Image via HTTP.
   *
   * @example
   * myBitmap.request();
   * myBitmap.request('../myImage.jpg');
   *
   * @method
   * @this {Image}
   * @param {String} aRequest The request needs to accomplish the requirements of AssetRequest
   * @returns {String} A String or Array that is actually the original user input.
   * @memberOf module:image.Image
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
   * @returns {Bitmap} Cloned instance
   */
  proto.clone = function() {
    return new Bitmap(this._loader, this.attr('source'));
  };

  /**
   * Notify the bitmap that the corresponding data has been loaded. To be used
   * by the asset loader.
   *
   * @param {string} type Either 'load' or 'error'
   * @param data
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

  return Bitmap;
});
