define([
  '../../../tools',
  './handle_message',
  'pixi',
], function(tools, handleMessage, pixi) {
  'use strict';
  return tools.mixin({}, handleMessage, {
    createPixiObject: function() {
      return new pixi.DisplayObjectContainer();
    }
  });

});
