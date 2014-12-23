define(function() {
  'use strict';

  return {
    createPixiObject: function() {},
    update: function() {},
    createRenderObject: function(message) {
      return {
        id: message.id,
        type: message.type,
        parent: message.parent,
        pixiObject: this.createPixiObject()
      };
    },
    remove: function(renderObject, stage) {
      stage.removeChild(renderObject.pixiObject);
    },
    addChild: function(renderObject, parent) {
      parent.pixiObject.addChild(renderObject.pixiObject);
    }
  };

});
