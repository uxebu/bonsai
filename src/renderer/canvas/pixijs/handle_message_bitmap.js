define([
  '../../../tools',
  '../../../color',
  './handle_message',
  'pixi',
], function(tools, color, handleMessage, pixi) {
  'use strict';

  return tools.mixin({}, handleMessage, {

    createPixiObject: function(message) {
      var texture = pixi.Texture.fromImage(message.attributes.absoluteUrl);
      return new pixi.Sprite(texture);
    },

    updateAttributes: function(message, renderObjects) {
      var bitmapObject = renderObjects[message.id].pixiObject;
      var naturalWidth = message.attributes.naturalWidth;
      var naturalHeight = message.attributes.naturalHeight;

      if (naturalWidth) {
        bitmapObject.width = naturalWidth;
      }

      if (naturalHeight) {
        bitmapObject.height = naturalHeight;
      }

    }

  });

});
