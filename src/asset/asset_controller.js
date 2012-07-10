/**
 * Contains the Asset controller
 *
 * @exports AssetController
 */
define([
  '../tools',
  '../event_emitter',
  './extensions',
  './asset_request',
  './font_handler',
  './video_handler',
  './bitmap_handler',
  './raw_handler'
],
function(
  tools, EventEmitter, extensions, AssetRequest,
  FontHandler, VideoHandler, BitmapHandler, RawHandler
) {
  'use strict';

  // save references to all assets (TODO: rethink)
  AssetController.assets = {};

  AssetController.hasVideoSupport = function() {
    return !!domVideo.canPlayType;
  };

  /**
  * Receiver of asset-load messages from worker.
  * Loads assets and returns an `assetLoaded` event.
  *
  * @class
  * @mixes module:event_emitter.EventEmitter
  */
  function AssetController() {

  }

  /**
   * Type handlers for different asset types. E.g. Bitmap, Text, Font, Video
   */
  var handlers = AssetController.handlers = {

    /**
     * Type handler for images
     */
    Bitmap: BitmapHandler,

    /**
     * Type handler for font
     */
    Font: FontHandler,

    /**
     * Type handler for video
     */
    Video: VideoHandler,

    /**
     * Type handler for raw data [txt, json, html]
     */
    Raw: RawHandler

  };

  AssetController.prototype = {

    /**
     * Loads asset
     *
     * @param {object} data Asset data
     * @param {string} data.source URI source for image
     * @param {string} [data.type] source type (generic)
     * @param {string} [eventToFire=assetLoaded] The event to fire
     * @returns {this}
     */
    load: function(data, successEvent, errorEvent) {

      successEvent = successEvent || 'assetLoadSuccess';
      errorEvent = errorEvent || 'assetLoadError';

      var type = data.type;

      if (type in handlers) {

        new handlers[type](data.request, data.id)
          .on('registerElement', function(element) {
            AssetController.assets[data.id] = element;
          })
          .on('load', this, function(assetData) {
            this.emit(successEvent, tools.mixin(data, assetData));
          })
          .on('error', this, function(err) {
            data.err = err;
            this.emit(errorEvent, data);
          })
          .load();
      } else {
        throw new Error('Type not found in AssetController.handlers: ' + type);
      }
    },

    /**
     * Preloads array of assets and fires callback when ALL are loaded
     *
     * @param {object} data Asset data
     * @param {string} data.source URI source for image
     * @param {string} [data.type] source type (generic)
     * @returns {this}
     */
    preload: function(sources, callback) {

      sources = tools.isArray(sources) ? sources : [sources];

      if (!sources.length) {
        callback();
      }

      var i, len, request, source, type,
          attemptedLoads = 0,
          loaded = 0,
          preloadID = this.preloadID ? ++this.preloadID : (this.preloadID = 1);

      this.on('_preloadedAssetLoadSuccess', function(data) {
        if (data.id.indexOf(preloadID + '__') == 0) {
          loaded++;
        }
        if (loaded == attemptedLoads) {
          callback();
        }
      });

      this.on('_preloadedAssetLoadError', function(data) {
        // TODO decide if loading multiple sources fails here
        // (just because 1+ caused errors when loading)
      });

      for (i = 0, len = sources.length; i < len; i++) {

        source = sources[i];
        request = new AssetRequest(source);
        type = request.type || source.type;

        if (!type) {
          continue;
        }

        attemptedLoads++;

        this.load({
          request: request,
          type: type,
          id: preloadID + '__' + i
        }, '_preloadedAssetLoadSuccess', '_preloadedAssetLoadError');
      }
    }
  };

  tools.mixin(AssetController.prototype, EventEmitter);

  return AssetController;
});
