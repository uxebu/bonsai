define(['bonsai/renderer/svg/svg'], function(SvgRenderer) {

  'use strict';

  describe('SvgRenderer', function() {
    function createFakeDomNode() {
      return {
        ownerSVGElement: {},
        appendChild: function() {},
        setAttribute: function() {}
      };
    }
    function createSvgRenderer() {
      return new SvgRenderer(createFakeDomNode(), 1, 1);
    }

    describe('allowEventDefaults', function() {
      it('should assign the constructor value as property', function() {
        expect(new SvgRenderer(createFakeDomNode(), 1, 1, {
          allowEventDefaults: true
        }).allowEventDefaults).toBe(true);
      });

      it('should not call .preventDefault() on events when allowEventDefaults is set to true', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = true;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is set to false', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = false;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is not set', function() {
        var renderer = createSvgRenderer();

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('#render', function() {
      it('should emit a "canRender" event after rendering', function() {
        var onCanRender = jasmine.createSpy('onCanRender');
        var renderer = createSvgRenderer();
        renderer.on('canRender', onCanRender);

        renderer.render([]);

        expect(onCanRender).toHaveBeenCalled();
      });
    });

    describe('applyFilter', function() {
      it('is a function', function() {
        expect(typeof createSvgRenderer().applyFilters).toBe('function');
      });
      it('adds a `_filterSignature` attribute to the node', function() {
        var node = createFakeDomNode();
        createSvgRenderer().applyFilters(node, []);
        expect(node._filterSignature).toBe('filter:');
      });
      it('adds a filter:colorMatrix() signature when a `colorMatrix` filter is applied', function() {
        var node = createFakeDomNode(), filter = { type: 'colorMatrix', value: [] };
        createSvgRenderer().applyFilters(node, [filter]);
        expect(node._filterSignature).toBe('filter:colorMatrix()');
      });
    });

    describe('drawAudio', function() {
      it('is a function', function() {
        expect(typeof createSvgRenderer().drawAudio).toBe('function');
      });
      describe('handles a Video Object depending on `message.attributes`', function() {
        it('attributes.playing=true', function() {
          var audioElement = { play: jasmine.createSpy('play') };
          var message = { attributes: { playing: true } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.play).toHaveBeenCalled();
        });
        it('attributes.playing=false', function() {
          var audioElement = { pause: jasmine.createSpy('pause') };
          var message = { attributes: { playing: false } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.pause).toHaveBeenCalled();
        });
        it('volume is not changed w/o attributes.volume', function() {
          var audioElement = { volume: 0.123 };
          var message = { attributes: {} };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.123);
        });
        it('attributes.volume=0', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 0 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0);
        });
        it('attributes.volume=0.5', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 0.5 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.5);
        });
        it('attributes.volume=1', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: 1.0 } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(1.0);
        });
        it('attributes.volume=NaN (casted to `0`)', function() {
          var audioElement = { volume: -1 };
          var message = { attributes: { volume: NaN } };
          createSvgRenderer().drawAudio(audioElement, message);
          expect(audioElement.volume).toBe(0.0);
        });
      });
    });

    describe('drawText', function() {
      var textElement;
      beforeEach(function() {
        textElement = { style: {} };
      });
      it('is a function', function() {
        expect(typeof createSvgRenderer().drawText).toBe('function');
      });
      it('sets baseline-alignment=hanging when attr.textOrigin=top', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'top' } });
        expect(textElement.style.alignmentBaseline).toBe('hanging');
      });
      it('sets dominant-alignment=hanging when attr.textOrigin=top', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'top' } });
        expect(textElement.style.dominantBaseline).toBe('hanging');
      });
      it('sets baseline-alignment=middle when attr.textOrigin=center', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'center' } });
        expect(textElement.style.alignmentBaseline).toBe('middle');
      });
      it('sets dominant-alignment=middle when attr.textOrigin=center', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'center' } });
        expect(textElement.style.dominantBaseline).toBe('middle');
      });
      it('sets baseline-alignment=auto when attr.textOrigin=center', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'bottom' } });
        expect(textElement.style.alignmentBaseline).toBe('auto');
      });
      it('sets dominant-alignment=auto when attr.textOrigin=center', function() {
        createSvgRenderer().drawText(textElement, { attributes: { textOrigin: 'bottom' } });
        expect(textElement.style.dominantBaseline).toBe('auto');
      });
    });

    describe('Frame logging', function() {
      function createSvgRenderer(fpsLog, getTime) {
        var renderer = new SvgRenderer(createFakeDomNode(), 1, 1, {fpsLog: fpsLog});
        renderer.getTime = getTime;
        return renderer;
      }

      function createClock(fps) {
        var lastTime = 0, interval = 1000 / fps;
        return function() {
          return Math.round(lastTime += interval);
        }
      }

      it('should not collect frame times at all when fps logging is disabled', function() {
        /*
          Motivation for this test:

          The renderer truncated the frames array when logging out fps. But
          without an fps log, the array was filled and never truncated.

          This test makes sure we don't leak memory and get slow.
         */


        var frameRate = 60, seconds = 3;
        var renderer = createSvgRenderer(false, createClock(frameRate));

        for (var i = frameRate * seconds; i > 0; i -= 1) {
          renderer.render([]);
        }

        var frameTimes = renderer._frameTimes || [];
        expect(frameTimes).toEqual([]);
      });
    });

    function createTouchEvent(which) {
      var evt = document.createEvent('UIEvent');
      evt.initEvent(which, true, true);
      evt.view = window;
      evt.altKey = false;
      evt.ctrlKey = false;
      evt.shiftKey = false;
      evt.metaKey = false;
      evt.touches = [{identifier:1}];
      evt.changedTouches = evt.touches;
      return evt;
    }

    describe('handleEvent', function() {
      it('should only fire one `click` for touchstart+touchend', function() {
        var numCalls = 0;
        var listener = function(e) { if (e.type=='click') numCalls++; };
        var renderer = createSvgRenderer();
        renderer.on('userevent', listener);
        renderer.svg.root.dispatchEvent(createTouchEvent('touchstart'));
        renderer.svg.root.dispatchEvent(createTouchEvent('touchend'));
        expect(numCalls)
          .toBe(1);
        renderer.removeListener('userevent', listener);
      });

      describe('keypress events', function() {
        function createDomKeyPressEvent(keyCode, charCode, shiftKey) {
          // found working solution at http://stackoverflow.com/questions/8942678/keyboardevent-in-chrome-keycode-is-0/12522752#12522752
          var evt = document.createEvent("Events");
          evt.initEvent("keypress", true, true);
          evt.altKey = false;
          evt.ctrlKey = false;
          evt.shiftKey = !!shiftKey;
          evt.metaKey = false;
          evt.keyCode = keyCode;
          evt.charCode = charCode;
          return evt;
        }
        var evtData, renderer, listener;
        function fireKeyPress(keyCode, charCode, shiftKey) {
          evtData = null;
          listener = function(e) { if (e.type=='key') evtData = e; };
          renderer = createSvgRenderer();
          renderer.on('userevent', listener);
          document.dispatchEvent(createDomKeyPressEvent(keyCode, charCode, shiftKey));
        }
        afterEach(function() {
          renderer.removeListener('userevent', listener);
        });
        it('should pass the keyCode for a key press', function() {
          var keyCode = 65;
          fireKeyPress(keyCode);
          expect(evtData.keyCode)
            .toBe(keyCode);
        });
        describe('charCode delivered by the event', function() {
          it('should pass the charCode for a key press', function() {
            var charCode = 'a'.charCodeAt(0);
            fireKeyPress(65, charCode);
            expect(evtData.charCode)
              .toBe(charCode);
          });
          it('should pass the charCode "A" properly', function() {
            var charCode = 'A'.charCodeAt(0);
            fireKeyPress(65, charCode);
            expect(evtData.charCode)
              .toBe(charCode);
          });
        });
        describe('charCode not given by the event', function() {
          it('should create the correct charCode for "a" (lower case)', function() {
            var charCode = 'a';
            var keyCode = charCode.charCodeAt(0);
            fireKeyPress(keyCode);
            expect(evtData.charCode)
              .toBe(keyCode);
          });
          it('should create the correct charCode for "A" (upper case)', function() {
            var charCode = 'A';
            var keyCode = charCode.toLowerCase().charCodeAt(0);
            fireKeyPress(keyCode, null, true);
            expect(evtData.charCode)
              .toBe(charCode.charCodeAt(0));
          });
        });
      });
    });
  });
});
