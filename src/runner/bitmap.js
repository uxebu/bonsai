define([
  './asset_display_object',
  '../tools',
  '../point'
], function(AssetDisplayObject, tools, Point) {
  'use strict';

  var data = tools.descriptorData, accessor = tools.descriptorAccessor;

  var getSource = tools.getter('_source');
  function setSource(source) {
    this._source = source;
    this._owner.request(source);
  }

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
      _naturalHeight: data(0, true, true),
      source: accessor(getSource, setSource, true),
      _source: data('', true, true),
      _absoluteUrl: data('', true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';
    rendererAttributes.naturalHeight = '_naturalHeight';
    rendererAttributes.naturalWidth = '_naturalWidth';
    rendererAttributes.absoluteUrl = '_absoluteUrl';

    this.attr('source', source);
  }

  var parentPrototype = AssetDisplayObject.prototype;
  var parentPrototypeRequest = parentPrototype.request;

  /** @lends Bitmap.prototype */
  var proto = Bitmap.prototype = Object.create(parentPrototype);

  /**
   * Clones the method
   *
   * @returns {Bitmap} Cloned instance
   */
  proto.clone = function() {
    return new Bitmap(this._loader, this.attr('source'));
  };

  /**
   * @see AssetDisplayObject.request
   * @method
   * @this {Bitmap}
   * @param {String|Array} aRequest The request needs to accomplish the requirements of AssetRequest
   * @returns {Bitmap|AssetRequest} The current Bitmap Istance or an AssetRequest instance
   * @name request
   */
  proto.request = function(aRequest) {
    if (typeof aRequest === 'undefined') {
      return this._request;
    }

    parentPrototypeRequest.call(this, aRequest);

    // Save full absolute URL to _absoluteSource so that it is
    // send to the renderer as `attributes.source`:
    this._attributes._absoluteUrl = this._request.resources[0].src;

    return this;
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
        if (this._attributes.width == null || this._attributes.height == null) {
          // Only send naturalWidth/Height to renderer if width/height haven't
          // been manually set.
          this._mutatedAttributes.naturalWidth = true;
          this._mutatedAttributes.naturalHeight = true;
        }
        this._mutatedAttributes.absoluteUrl = true;
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
   * @param {Matrix} [transform=null] A transform to apply to all points
   *    before computation.
   * @returns {Object} an object with all box properties
   */
  proto.getBoundingBox = function(transform) {

    var value,
        box = {top: 0, right: 0, bottom: 0, left: 0},
        naturalWidth = this._attributes._naturalWidth,
        naturalHeight = this._attributes._naturalHeight,
        attrWidth = this.attr('width'),
        attrHeight = this.attr('height'),
        naturalRatio = naturalWidth / naturalHeight,

        // If one dimensions is not specified, then we use the other dimension
        // and the ratio to calculate its box:
        width = attrWidth || (
          attrHeight != null ? naturalRatio * attrHeight : naturalWidth
        ) || 0,
        height = attrHeight || (
          attrWidth != null ? attrWidth / naturalRatio : naturalHeight
        ) || 0,

        topLeft,
        bottomRight,
        dimensions;

    box.right = box.width = width;
    box.bottom = box.height = height;

    if (transform) {
      topLeft = transform.transformPoint(new Point(0, 0));
      bottomRight = transform.transformPoint(new Point(width, height));
      box.top = topLeft.y;
      box.left = topLeft.x;
      box.right = bottomRight.x;
      box.bottom = bottomRight.y;
    }

    return box;
  };

  return Bitmap;
});
