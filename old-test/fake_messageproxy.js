define([
  'bonsai/event_emitter',
  'bonsai/tools'
], function(EventEmitter, tools) {
  return tools.mixin({
    notifyRenderer: function() {}
  }, EventEmitter);
});
