define([
  '../uri'
], function(URI) {
  'use strict';

  /**
   * The AssetResource constructor
   *
   * @constructor
   * @name AssetResource
   * @private
   * @param {String|Array} resource TODO
   * @returns {AssetResource} The new AssetResource Instance
   */
  function AssetResource(param) {

    var src, type;

    if (!param) {
      throw Error('AssetResource needs at least a valid url as parameter.');
    }

    if (typeof param === 'string') {
      src = param;
    } else {
      src = param.src;
      type = param.type;
    }

    if (!src || typeof src !== 'string') {
      throw Error('AssetResource: src parameter invalid: ' + src);
    }

    this.src = src;
    if (type && typeof type === 'string') {
      this.type = type;
    } else {
      var uri = URI.parse(src);
      var re = uri.scheme === 'data' ?
        /^(\w+\/[\w+]+)[;,]/ : // extract mime type from beginning
        /\.([^.]+)$/; // extract file extension
      this.type = (uri.path.match(re) || [])[1];
    }

    if (!this.type) {
      throw Error('Cannot determine type of resource with src: ' + src);
    }
  }

  return AssetResource;
});
