define([
  './asset_resource',
  '../tools'
], function(AssetResource, tools) {
  'use strict';

  var isArray = tools.isArray;

  /**
   * The AssetRequest constructor
   *
   * @constructor
   * @name AssetRequest
   * @private
   * @param {String|Array|Object} request TODO
   * @returns {AssetRequest} The new AssetRequest Instance
   */
  function AssetRequest(request) {

    var resources, loadLevel;

    if (!request) {
      throw Error('AssetRequest needs at least a valid url.');
    }

    // untrusted user input
    resources = request.resources;
    loadLevel = request.loadLevel;

    if (typeof request === 'string') {
      // assuming request is an url
      resources = [new AssetResource(request)];
    } else if (isArray(request)) {

      // assuming request is an array of objects like [{src:x,type:x}]
      resources = tools.map(request, function(req) {
        return new AssetResource(req);
      });
    } else if (resources && resources.src || typeof resources === 'string') {
      resources = [new AssetResource(resources)];
    } else if (isArray(resources) && resources.length) {

      // assuming request is an object like {resources:[{src:x,type:x}], loadLevel:3}
      resources = tools.map(resources, function(resource) {
        return new AssetResource(resource);
      });
    } else {
      throw Error('resources are not valid.');
    }

    this.resources = resources;
    this.id = request.id;

    // TODO: validate against supported load levels
    this.loadLevel = loadLevel || null;
  }

  return AssetRequest;
});
