define([
  './event_emitter',
  './tools'
], function (EventEmitter, tools) {
  'use strict';

  function MessageChannel(notifyRenderer, disconnect) {
    this.disconnect = disconnect;
    this.notifyRenderer = notifyRenderer;
  }

  MessageChannel.prototype = tools.mixin({
    destroy: function() {
      this.removeAllListeners();
      this.disconnect();
      this.disconnect = this.notifyRenderer = null;
    },

    notify: function(message) {
      this.emit('message', message);
    }
  }, EventEmitter);

  return MessageChannel;
});
