define([
  './mock'
], function(mock) {
  'use strict';

  return function(createDisplayObject) {
    describe('lifecycle', function() {
      var displayObject, registry, stage;
      beforeEach(function() {
        displayObject = createDisplayObject();
        displayObject.parent = mock.createDisplayObject();
        stage = mock.createStage();
        registry = stage.registry;
      });

      describe('#_activate()', function() {
        it('should add the display object to the registry for display objects ' +
          'of the passed in stage', function() {
          var displayObjectsRegistry = registry.displayObjects;
          displayObject._activate(stage);

          expect(displayObjectsRegistry[displayObject.id]).toBe(displayObject);
        });

        it('should add the object to the registry of objects that need drawing', function() {
          var needsDrawRegistry = registry.needsDraw;
          displayObject._activate(stage);
          expect(needsDrawRegistry[displayObject.id]).toBe(displayObject);
        });

        it('should add the object to the registry of objects that need insertion', function() {
          var needsInsertionRegistry = registry.needsInsertion;
          displayObject._activate(stage);
          expect(needsInsertionRegistry[displayObject.id]).toBe(displayObject);
        });
      });
      describe('#_deactivate', function() {
        beforeEach(function() {
          displayObject.stage = stage;
        });
        it('should delete the display object from the registry of display objects', function() {
          var displayObjectsRegistry = registry.displayObjects;
          displayObjectsRegistry[displayObject.id] = displayObject;
          displayObject._deactivate();
          expect(displayObjectsRegistry).not.toHaveProperties(displayObject.id);
        });
        it('should add the display object to the registry of objects that need drawing', function() {
          var needsDrawRegistry = registry.needsDraw;
          displayObject._deactivate();
          expect(needsDrawRegistry[displayObject.id]).toBe(displayObject);
        });
        it('should delete the display object from the registry of objects that need insertion', function() {
          var needsInsertionRegistry = registry.needsInsertion;
          needsInsertionRegistry[displayObject.id] = displayObject;
          displayObject._deactivate();
          expect(needsInsertionRegistry).not.toHaveProperties(displayObject.id);
        });
      });
    });
  }
});
