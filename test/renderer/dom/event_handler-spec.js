define(['bonsai/renderer/dom/event_handler'], function(EventHandler) {
  'use strict';

  describe('renderer/dom/EventHandler', function() {
    it('should use the first argument as "renderer" property', function() {
      var renderer = {};
      expect(new EventHandler(renderer)).toHaveOwnProperties({
        renderer: renderer
      });
    });

    it('should have a "touchStates" property that is an object', function() {
      expect(new EventHandler().touchStates).toBeOfType('object');
    });

    it('should initialize all other used properties', function() {
      expect(new EventHandler()).toHaveOwnProperties({
        hadTouchCancel: false,
        hadTouchMove: false,
        isMultiTouch: false,
        lastClickFromTouchTime: 0,
        mouseDragId: undefined,
        mouseDragStartX: undefined,
        mouseDragStartY: undefined,
        mouseMoveLastX: undefined,
        mouseMoveLastY: undefined
      });
    });

    it('should have a "handleEvent" event', function() {
      expect(new EventHandler().handleEvent).toBeOfType('function');
    });
  });
});
