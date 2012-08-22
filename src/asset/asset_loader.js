define([
  '../event_emitter',
  '../tools'
], function(EventEmitter, tools) {
  'use strict';

  var hitch = tools.hitch;

  function AssetLoader(pendingAssets) {
    this.pendingAssets = pendingAssets;
  }

  var proto = AssetLoader.prototype = {
    /**
     * Handles events emitted on this AssetLoader instance,
     * notifying the relevant requester of the event:
     */
    handleEvent: function(type, id, data) {
      var pending = this.pendingAssets, requester;
      if (id in pending) {
        requester = pending[id];
        requester.notify(type, data);
        delete pending[id];
      }
    },

    /**
     * Emits a request event
     */
    request: function(requester, url, type) {
      this.pendingAssets[requester.id] = requester;
      this.emit('request', requester.id, url, type);
    },

    /**
     * Emits a destroy method.
     * Intended to destroy data held about an asset within the renderer
     */
    destroyAsset: function(requester) {
      this.emit('destroy', requester.id);
    }
  };

  tools.mixin(proto, EventEmitter);

  return AssetLoader;
});
