define([
  '../../../tools',
  '../../../color',
  '../../../runner/path/curved_path',
  './handle_message',
  'pixi',
], function(tools, color, curvedPath, handleMessage, pixi) {
  'use strict';

  var pathGraphicsMap = {
    'moveTo': 'moveTo',
    'curveTo': 'bezierCurveTo'
  };

  function _mapPathToPixiGraphicsCalls(paths, graphics) {
    var curvedPaths = curvedPath.toCurves(paths);
    var i, path;
    for (i = 0; (path = curvedPaths[i++]);) {
      if (path[0] !== 'closePath') {
        graphics[pathGraphicsMap[path[0]]].apply(graphics, path.splice(1));
      }
    }
  }

  return tools.mixin({}, handleMessage, {
    createPixiObject: function() {
      return new pixi.Graphics();
    },
    update: function(message, renderObjects) {
      var colorObject;
      var graphics = renderObjects[message.id].pixiObject;
      var fillColor = message.attributes.fillColor;
      var strokeColor = message.attributes.strokeColor;

      if (!('data' in message)) {
        return;
      }

      //graphics.clear();

      if (fillColor) {
        colorObject = color(fillColor);
        graphics.beginFill(colorObject.toString().slice(0, 8), colorObject.a());
      }

      if (strokeColor) {
        colorObject = color(strokeColor);
        graphics.lineStyle(message.attributes.strokeWidth, colorObject.toString().slice(0, 8), colorObject.a());
      }

      if (message.attributes.opacity) {
        graphics.alpha = message.attributes.opacity;
      }

      _mapPathToPixiGraphicsCalls(message.data, graphics);

      graphics.endFill();
    }
  });

});
