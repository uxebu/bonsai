define([
  '../../color',
  '../../runner/path/curved_path',
  'pixi',
], function(color, curvedPath, pixi) {
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

  return {
    createPixiObject: function() {
      return new pixi.Graphics();
    },
    update: function(message, renderObjects) {
      var graphics = renderObjects[message.id].pixiObject;
      graphics.beginFill(0x00FF00);
      _mapPathToPixiGraphicsCalls(message.data, graphics);
      // end the fill
      graphics.endFill();
    },
    remove: function(renderObject, stage) {
      stage.removeChild(renderObject.pixiObject);
    }
  };

});
