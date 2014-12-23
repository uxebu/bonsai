define([
  '../../../tools',
  './handle_message_group',
  'pixi',
], function(tools, handleMessageGroup, pixi) {
  'use strict';
  return tools.mixin({}, handleMessageGroup, {
    createPixiObject: function() {
      return new pixi.Stage(0xdddddd);
    }
  });

});
