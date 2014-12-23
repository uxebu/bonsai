define(function() {
  'use strict';

  return {
    createPixiObject: function() {},
    update: function() {},
    remove: function(renderObject, stage) {
      stage.removeChild(renderObject.pixiObject);
    },
    addChild: function(renderObject, parent) {
      parent.pixiObject.addChild(renderObject.pixiObject);
    }
  };

});
