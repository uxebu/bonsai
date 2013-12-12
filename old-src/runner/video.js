define([
  './media_display_object',
  '../tools'
], function(MediaDisplayObject, tools) {
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
  function Video(loader, aRequest, callback) {

    MediaDisplayObject.call(this, loader, aRequest, callback);

    this.type = 'Video';

    Object.defineProperties(this._attributes, {
      height: data(0, true, true),
      width: data(0, true, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.height = 'height';
    rendererAttributes.width = 'width';

    this.request(aRequest);
  }

  /** @lends Video.prototype */
  var proto = Video.prototype = Object.create(MediaDisplayObject.prototype);

  /**
   * Clones the method
   *
   * @returns {Video} Cloned instance
   */
  proto.clone = function() {
    // options are missing
    return new Video(this._loader, this._request);
  };

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

  proto.getBoundingBox = function(transform) {
    var box = {top: 0, right: 0, bottom: 0, left: 0};
    box.right = box.width = this.attr('width') || 0;
    box.bottom = box.height = this.attr('height') || 0;
    if (transform) {
      var topLeft = transform.transformPoint({x:0,y:0});
      var bottomRight = transform.transformPoint({x:box.right, y:box.bottom});
      box.top = topLeft.y;
      box.left = topLeft.x;
      box.right = bottomRight.x;
      box.bottom = bottomRight.y;
      box.width = box.right - box.left;
      box.height = box.bottom - box.top;
    }
    return box;
  };

  return Video;
});
