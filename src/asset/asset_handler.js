define([
  './asset_request',
  '../event_emitter',
  '../tools'
], function(AssetRequest, EventEmitter, tools) {
  'use strict';

  var forEach = tools.forEach;
  var slice = [].slice;

  AssetHandler.DEFAULT_TIMEOUT = 10000;

  AssetHandler.MIME_TYPES = (function(navigatorMimeTypes) {

    var mimeTypes = {
      audio: {},
      video: {},
      image: {}
    };

    if (!navigatorMimeTypes) {
      return mimeTypes;
    }

    forEach(slice.call(navigatorMimeTypes), function(navMimeType) {

      // in most cases the name of the handler is part of the description
      var handler = (navMimeType.description.match(/audio|video|image/i) || [])[0];

      // return early when the mime-type is irrelevant
      if (!handler) {
        return;
      }

      // case insensitive, support "video" and "Video"
      handler = handler.toLowerCase();

      // store a mime-type per suffix (overwrites existing suffixes)
      forEach(navMimeType.suffixes.split(','), function(suffix) {
        if (suffix) {
          mimeTypes[handler][suffix] = navMimeType.type;
        }
      });
    });

    return mimeTypes;

  })(typeof navigator !== 'undefined' && navigator.mimeTypes);

  /**
   * A helper class for asset handling (different asset types: video, bitmap, etc.)
   *
   * @param {AssetRequest} request A request instance with resources
   * @param {Number} assetId The ID of the asset (ID for adding asset-element to
   *  AssetController.assets)
   * @param {Number} [timeoutDuration] Request timeout (in ms)
   */
  function AssetHandler(request, assetId, timeoutDuration) {
    this.timeoutDuration = timeoutDuration || AssetHandler.DEFAULT_TIMEOUT;
    this.request = request instanceof AssetRequest ? request : new AssetRequest(request);
    this.resources = this.request.resources;
    this.resourcesExpectedLength = this.resources.length;
    this.resourcesLoaded = 0;
    this.id = assetId;
    this.assetData = {};
    this.resourceLoadSuccess = tools.hitch(this, 'resourceLoadSuccess');
    this.resourceLoadError = tools.hitch(this, 'resourceLoadError');
  }

  var proto = AssetHandler.prototype = {

    load: function() {

      this.initTimeout();

      forEach(this.resources, function(resource) {
        this.loadResource(
          resource,
          this.resourceLoadSuccess,
          this.resourceLoadError
        );
      }, this);

      return this;
    },

    initTimeout: function() {
      this._timeoutID = setTimeout(
        tools.hitch(this, function() {
          if (this.resourcesLoaded < this.resourcesExpectedLength) {
            this.resourceLoadError('Timeout error when trying to load resources');
          }
        }),
        this.timeoutDuration
      );
    },

    registerElement: function(element) {
      this.emit('registerElement', element);
    },

    resourceLoadSuccess: function(loadData) {
      var resourcesLoaded = this.resourcesLoaded += 1;
      if (resourcesLoaded === this.resourcesExpectedLength) {
        clearTimeout(this._timeoutID);
        this.emit('resourcesLoaded'); // internal resourcesLoaded event
        this.emit('load', loadData);
      }
    },

    resourceLoadError: function(loadError) {
      clearTimeout(this._timeoutID);
      this.emit('error', loadError);
    }

  };

  tools.mixin(proto, EventEmitter);

  return AssetHandler;
});
