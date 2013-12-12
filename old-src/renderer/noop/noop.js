define([
  '../../event_emitter',
  '../../tools'
], function(EventEmitter, tools) {
  'use strict';

  function NoopRenderer() {

  }

  NoopRenderer.prototype = tools.mixin({
    destroy: function() {},

    getOffset: function() {
      return {left: 0, top: 0};
    },

    render: function() {
      this.emit('canRender');
    }
  }, EventEmitter);

  return NoopRenderer;
});
