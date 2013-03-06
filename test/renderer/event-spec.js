define([
  'bonsai/renderer/event'
], function(event) {
  'use strict';

  function eachProperty(object, callback) {
    for (var key in object) {
      callback(object[key], key);
    }
  }

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

        it('should initialize the "touchId" property to undefined (touch)', function() {
          expect(new PointerEvent(type, stageX, stageY, clientX, clientY))
            .toHaveOwnProperties({
              touchId: undefined
            });
        });

        it('should initialize the "isLeft", "isRight", and "isMiddle" properties to undefined (mouse)', function() {
          expect(new PointerEvent(type, stageX, stageY, clientX, clientY))
            .toHaveOwnProperties({
              isLeft: undefined,
              isRight: undefined,
              isMiddle: undefined
            });
        });
      });


      describe('factories', function() {
        var clientX = 123, clientY = 456;
        var stageX = 78, stageY = 90;

        describe('.fromDomMouseEvent', function() {
          function createDomMouseEvent(type, button) {
            return {
              type: type,
              clientX: clientX,
              clientY: clientY,
              button: button || 0
            };
          }
          it('should return a PointerEvent', function() {
            var domEvent = createDomMouseEvent('arbitrary');
            var pointerEvent = PointerEvent.fromDomMouseEvent(domEvent, stageX, stageY);
            expect(pointerEvent).toBeInstanceOf(PointerEvent);
          });

          it('should initialize all offset properties from the mouse event', function() {
            var domEvent = createDomMouseEvent('arbitrary');
            var pointerEvent = PointerEvent.fromDomMouseEvent(domEvent, stageX, stageY);
            expect(pointerEvent)
              .toHaveOwnProperties({
                stageX: clientX - stageX,
                x: clientX - stageX,
                stageY: clientY - stageY,
                y: clientY - stageY,
                clientX: clientX,
                clientY: clientY
              });
          });

          it('should initialize the "isLeft" property from the mouse event', function() {
            var domEvent = createDomMouseEvent('arbitrary', 0);
            var pointerEvent = PointerEvent.fromDomMouseEvent(domEvent, stageX, stageY);
            expect(pointerEvent).toHaveOwnProperties({
              isLeft: true,
              isMiddle: false,
              isRight: false
            });
          });

          it('should initialize the "isMiddle" property from the mouse event', function() {
            var domEvent = createDomMouseEvent('arbitrary', 1);
            var pointerEvent = PointerEvent.fromDomMouseEvent(domEvent, stageX, stageY);
            expect(pointerEvent).toHaveOwnProperties({
              isLeft: false,
              isMiddle: true,
              isRight: false
            });
          });

          it('should initialize the "isRight" property from the mouse event', function() {
            var domEvent = createDomMouseEvent('arbitrary', 2);
            var pointerEvent = PointerEvent.fromDomMouseEvent(domEvent, stageX, stageY);
            expect(pointerEvent).toHaveOwnProperties({
              isLeft: false,
              isMiddle: false,
              isRight: true
            });
          });

          eachProperty(
            {
              click: 'click',
              dblclick: 'dblclick',
              mouseup: 'pointerup',
              mousedown: 'pointerdown',
              mousemove: 'pointermove',
              mouseover: 'mouseover',
              mouseout: 'mouseout'
            },
            function(expectedType, domEventType) {
              it('should create ' + expectedType + ' events for ' + domEventType + ' events', function() {
                var pointerEvent = PointerEvent.fromDomMouseEvent(
                  createDomMouseEvent(domEventType), stageX, stageY
                );
                expect(pointerEvent).toHaveOwnProperties({type: expectedType});
              });
            }
          );
        });

        describe('.fromDomTouch', function() {
          var touchId = 0;
          function createDomTouch(clientX, clientY) {
            return {
              clientX: clientX,
              clientY: clientY,
              identifier: touchId += 1
            };
          }
          function createDomTouchEvent(type, containedTouch) {
            return {
              type: type,
              touches: [createDomTouch(-20, -30), containedTouch],
              changedTouches: [containedTouch]
            };
          }

          it('should return a PointerEvent', function() {
            var domTouch = createDomTouch(clientX, clientY);
            var domEvent = createDomTouchEvent('arbitrary', domTouch);
            var pointerEvent = PointerEvent.fromDomTouch(domTouch, domEvent, stageX, stageY);
            expect(pointerEvent).toBeInstanceOf(PointerEvent);
          });

          it('should initialize all offset properties from the first changed touch event', function() {
            var domTouch = createDomTouch(clientX, clientY);
            var domEvent = createDomTouchEvent('arbitrary', domTouch);
            var pointerEvent = PointerEvent.fromDomTouch(domTouch, domEvent, stageX, stageY);
            expect(pointerEvent)
              .toHaveOwnProperties({
                stageX: clientX - stageX,
                x: clientX - stageX,
                stageY: clientY - stageY,
                y: clientY - stageY,
                clientX: clientX,
                clientY: clientY
              });
          });

          it('should set the "touchId" from the passed in DOM touch', function() {
            var domTouch = createDomTouch(clientX, clientY);
            var domEvent = createDomTouchEvent('arbitrary', domTouch);
            var pointerEvent = PointerEvent.fromDomTouch(domTouch, domEvent, stageX, stageY);
            expect(pointerEvent).toHaveOwnProperties({
              touchId: domTouch.identifier
            });
          });

          eachProperty(
            {
              touchstart: 'pointerdown',
              touchmove: 'pointermove',
              touchend: 'pointerup',
              touchcancel: 'pointerup'
            },
            function(expectedType, domEventType) {
              it('should create ' + expectedType + ' events for ' + domEventType + ' events', function() {
                var domTouch = createDomTouch(clientX, clientY);
                var domEvent = createDomTouchEvent(domEventType, domTouch);
                var pointerEvent = PointerEvent.fromDomTouch(domTouch, domEvent, stageX, stageY);
                expect(pointerEvent).toHaveOwnProperties({type: expectedType});
              });
            }
          )
        });
      });

      describe('#clone()', function() {
        var pointerEvent = new PointerEvent('arbitrary', 123, 345, 567, 789);
        pointerEvent.deltaX = 10;
        pointerEvent.deltaY = 0;
        pointerEvent.isLeft = true;
        pointerEvent.touchId = 123;
        it('should return a PointerEvent instance', function() {
          expect(pointerEvent.clone()).toBeInstanceOf(PointerEvent);
        });
        it('should copy all property values to the clone', function() {
          expect(pointerEvent.clone()).toEqual(pointerEvent);
        });
        it('should not return the instance itself', function() {
          expect(pointerEvent.clone()).not.toBe(pointerEvent);
        });
        it('should change the "type" property if called with an argument', function() {
          var expected = pointerEvent.clone();
          var newType = 'othertype';
          expected.type = newType;
          expect(pointerEvent.clone(newType)).toEqual(expected);
        });
      });
    });

    describe('KeyboardEvent', function() {
      var KeyboardEvent = event.KeyboardEvent;
      var modifiers = 0;
      describe('Constructor', function() {
        it('should initialize properties from parameters', function() {
          var type = 'arbitrary', keyCode = 0x123, charCode = 0x345;
          var modifiers = KeyboardEvent.NO_MODIFIER, targetValue = 'arbitrary value';
          expect(new KeyboardEvent(type, keyCode, charCode, modifiers, targetValue)).toHaveOwnProperties({
            type: type,
            charCode: charCode,
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

            expect(new KeyboardEvent('arbitrary', 0x123, 0x234, modifiers))
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

      describe('.fromDomKeyboardEvent', function() {
        var targetValue = 'arbitrary value';
        var keyCode = 0x123;
        var charCode = 0x345;
        var altKey = true;
        var ctrlKey = false;
        var metaKey = true;
        var shiftKey = false;

        function createDomKeyboardEvent(type) {
          return {
            type: type,
            keyCode: keyCode,
            charCode: charCode,
            altKey: altKey,
            ctrlKey: ctrlKey,
            metaKey: metaKey,
            shiftKey: shiftKey,
            target: {value: targetValue}
          };
        }
        it('should return a KeyboardEvent instance', function() {
          expect(KeyboardEvent.fromDomKeyboardEvent(createDomKeyboardEvent('arbitrary')))
            .toBeInstanceOf(KeyboardEvent);
        });

        it('should populate the event with the corresponding properties from the dom event', function() {
          expect(KeyboardEvent.fromDomKeyboardEvent(createDomKeyboardEvent('arbitrary')))
            .toHaveOwnProperties({
              type: undefined,
              keyCode: keyCode,
              charCode: charCode,
              altKey: altKey,
              ctrlKey: ctrlKey,
              metaKey: metaKey,
              shiftKey: shiftKey,
              inputValue: targetValue
            });
        });

        eachProperty(
          {
            keypress: 'key',
            keyup: 'keyup',
            keydown: 'keydown'
          },
          function(expectedType, domEventType) {
            it('should create ' + expectedType + ' events for ' + domEventType + ' events', function() {
              var keyboardEvent = KeyboardEvent
                .fromDomKeyboardEvent(createDomKeyboardEvent(domEventType));
              expect(keyboardEvent).toHaveOwnProperties({type: expectedType});
            });
          }
        )

      });

      describe('#clone()', function() {
        var modifiers = KeyboardEvent.SHIFT_KEY | KeyboardEvent.META_KEY;
        var keyboardEvent = new KeyboardEvent('arbitrary', 0x123, 0x234, modifiers, 'arbitrary value');

        it('should return a Keyboard event instance', function() {
          expect(keyboardEvent.clone()).toBeInstanceOf(KeyboardEvent);
        });
        it('should copy all property values to the clone', function() {
          expect(keyboardEvent.clone()).toEqual(keyboardEvent);
        });
        it('should not return the instance itself', function() {
          expect(keyboardEvent.clone()).not.toBe(keyboardEvent);
        });
        it('should change the "type" property if called with an argument', function() {
          var expected = keyboardEvent.clone();
          var newType = 'some different type';
          expected.type = newType;

          expect(keyboardEvent.clone(newType)).toEqual(expected);
        });
      });
    });
  });
});
