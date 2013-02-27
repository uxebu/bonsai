define([
  'bonsai/renderer/event'
], function(event) {
  'use strict';

  describe('renderer events', function() {
    describe('PointerEvent', function() {
      var PointerEvent = event.PointerEvent;

      describe('Constructor', function() {
        var type = 'arbitrary';
        var stageX = 15;
        var stageY = 107;
        var clientX = 32;
        var clientY = 1028;
        it('should initialize properties from parameters', function() {
          expect(new PointerEvent(type, stageX, stageY, clientX, clientY))
            .toHaveOwnProperties({
              type: type,
              stageX: stageX,
              x: stageX,
              stageY: stageY,
              y: stageY,
              clientX: clientX,
              clientY: clientY
            });
        });

        it('should initialize the "deltaX", "deltaY", "diffX" and "diffY" properties to undefined (movement)', function() {
          expect(new PointerEvent(type, stageX, stageY, clientX, clientY))
            .toHaveOwnProperties({
              deltaX: undefined,
              deltaY: undefined,
              diffX: undefined,
              diffY: undefined
            });
        });

        it('should initialize the "touchId" and "touchIndex" properties to undefined (touch)', function() {
          expect(new PointerEvent(type, stageX, stageY, clientX, clientY))
            .toHaveOwnProperties({
              touchId: undefined,
              touchIndex: undefined
            });
        });
      });

      describe('.fromDomEvent', function() {
        var clientX = 123, clientY = 456;
        var stageOffsetX = 78, stageOffsetY = 90;

        it('should initialize a PointerEvent from an object that has client offsets (like a mouse event or a touch)', function() {
          var mouseEventOrTouch = {clientX: clientX, clientY: clientY};
          expect(PointerEvent.fromDomEvent('arbitrary', mouseEventOrTouch, stageOffsetX, stageOffsetY))
            .toHaveOwnProperties({
              type: undefined,
              stageX: clientX - stageOffsetX,
              x: clientX - stageOffsetX,
              stageY: clientY - stageOffsetY,
              y: clientY - stageOffsetY,
              clientX: clientX,
              clientY: clientY
            });
        });
      });
    });

    describe('KeyboardEvent', function() {
      var KeyboardEvent = event.KeyboardEvent;
      var modifiers = 0;
      describe('Constructor', function() {
        it('should initialize properties from parameters', function() {
          var type = 'arbitrary', keyCode = 0x123;
          var modifiers = KeyboardEvent.NO_MODIFIER, targetValue = 'arbitrary value';
          expect(new KeyboardEvent(type, keyCode, modifiers, targetValue)).toHaveOwnProperties({
            type: type,
            keyCode: keyCode,
            inputValue: targetValue
          });
        });

        describe('modifier keys', function() {
          function testModifiers(modifiers, property0, property1) {
            var expectedProperties = {
              altKey: false,
              ctrlKey: false,
              metaKey: false,
              shiftKey: false
            };
            for (var i = 1, property; (property = arguments[i]); i += 1) {
              expectedProperties[property] = true;
            }

            expect(new KeyboardEvent('arbitrary', 0x123, modifiers))
              .toHaveOwnProperties(expectedProperties);
          }

          it('should initialize the "altKey" property from the "modifiers" parameter', function() {
            testModifiers(KeyboardEvent.ALT_KEY, 'altKey');
          });
          it('should initialize the "ctrlKey" property from the "modifiers" parameter', function() {
            testModifiers(KeyboardEvent.CTRL_KEY, 'ctrlKey');
          });
          it('should initialize the "metaKey" property from the "modifiers" parameter', function() {
            testModifiers(KeyboardEvent.META_KEY, 'metaKey');
          });
          it('should initialize the "shiftKey" property from the "modifiers" parameter', function() {
            testModifiers(KeyboardEvent.SHIFT_KEY, 'shiftKey');
          });
          it('should initialize a combination of two modifiers as expected', function() {
            testModifiers(KeyboardEvent.SHIFT_KEY | KeyboardEvent.META_KEY, 'metaKey', 'shiftKey')
          });
          it('should initialize the combination of all modifiers correctly', function() {
            var modifiers =
              KeyboardEvent.ALT_KEY| KeyboardEvent.CTRL_KEY |
              KeyboardEvent.META_KEY | KeyboardEvent.SHIFT_KEY;
            testModifiers(modifiers, 'altKey', 'ctrlKey', 'metaKey', 'shiftKey');
          });
        });
      });

      describe('.fromDomEvent', function() {
        it('should populate the event with the corresponding properties from the dom event', function() {
          var targetValue = 'arbitrary value';
          var keyCode = 0x123;
          var altKey = true;
          var ctrlKey = false;
          var metaKey = true;
          var shiftKey = false;
          var keys = {keyCode: keyCode, altKey: altKey, ctrlKey: ctrlKey, metaKey: metaKey, shiftKey: shiftKey};

          expect(KeyboardEvent.fromDomEvent('arbitrary', keys, targetValue))
            .toHaveOwnProperties({
              type: undefined,
              keyCode: keyCode,
              altKey: altKey,
              ctrlKey: ctrlKey,
              metaKey: metaKey,
              shiftKey: shiftKey,
              inputValue: targetValue
            });
        });
      });
    });
  });
});
