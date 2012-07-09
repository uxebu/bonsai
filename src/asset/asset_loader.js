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
    handleEvent: function(type, id, data) {
      var pending = this.pendingAssets, requester;
      if (id in pending) {
        requester = pending[id];
        requester.notify(type, data);
        delete pending[id];
      }
    },

    request: function(requester, url, type) {
      this.pendingAssets[requester.id] = requester;
      this.emit('request', requester.id, url, type);
    }
  };

  tools.mixin(proto, EventEmitter);

  return AssetLoader;
});
