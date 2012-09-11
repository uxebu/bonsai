require([
  'bonsai/runner/display_object',
  'bonsai/runner/stage',
  'bonsai/event_emitter',
  'bonsai/tools',
  './runner.js'
], function(DisplayObject, Stage, EventEmitter, tools) {
  function createFakeStage() {
    var messageChannel = tools.mixin({notifyRenderer: function() {}}, EventEmitter);
    return new Stage(messageChannel, function() {});
  }
  // Create fake stage
  var stage = createFakeStage();

  stage.handleEvent({
    command: 'run',
    data: {
      code: ';'
    }
  });

  stage.freeze();

  describe('DisplayObject', function() {

    window.DisplayObject = DisplayObject;

    /*
     Define precision as object so it'll be toString'd as an obj and
     precision will show up clearly in the reports.
     E.g.
      Expected 49.5 to be close to 50, { PRECISION : 12 }.
    */
    var precision = new Number(12);
    precision.PRECISION = +precision;

    it('Should have a unique ID', function() {
      expect(new DisplayObject().id).toNotBe(new DisplayObject().id);
    });

    describe('attr', function() {

      it('Returns set attr', function() {
        var d = new DisplayObject();
        d.attr('x', 150);
        expect(d.attr('x')).toBeCloseTo(150, precision);
      });

      it('fillRule can be set through attr and that this setting is passed to the renderer', function() {
        var d = new DisplayObject();
        expect(d._renderAttributes.fillRule).toBe('fillRule');
        d.attr('fillRule', 'evenodd');
        expect(d.attr('fillRule')).toBe('evenodd');
      });

      it('Returns all attributes when no arguments are passed', function() {
        var d = new DisplayObject();
        d.attr('y', 123);
        d.attr('x', 456);
        expect(d.attr().y).toBeCloseTo(123, precision);
        expect(d.attr().x).toBeCloseTo(456, precision);
      });

      it('Transforms rotation', function() {
        var d = new DisplayObject(),
            m = d._attributes._matrix,
            x = 20,
            y = 20,
            rad = function(d){return Math.PI/180*d;};
        d.attr('x', x);
        d.attr('y', y);
        // All the way round:
        d.attr('rotation', rad(90));
        expect(x * m.a + y * m.c).toBeCloseTo(-20, precision);
        expect(x * m.b + y * m.d).toBeCloseTo(20, precision);
        // Rotation is absolute, (not additive)
        // this should be the same again:
        d.attr('rotation', rad(90));
        expect(x * m.a + y * m.c).toBeCloseTo(-20, precision);
        expect(x * m.b + y * m.d).toBeCloseTo(20, precision);
        d.attr('rotation', rad(180));
        expect(x * m.a + y * m.c).toBeCloseTo(-20, precision);
        expect(x * m.b + y * m.d).toBeCloseTo(-20, precision);
        d.attr('rotation', rad(270));
        expect(x * m.a + y * m.c).toBeCloseTo(20, precision);
        expect(x * m.b + y * m.d).toBeCloseTo(-20, precision);
        // Should be the same as 90
        d.attr('rotation', rad(450));
        expect(x * m.a + y * m.c).toBeCloseTo(-20, precision);
        expect(x * m.b + y * m.d).toBeCloseTo(20, precision);
      });

      describe('scaling', function() {

        it('Provides `scale` as a setter and getter', function() {
          var d = new DisplayObject();
          d.attr('scale', 3);
          expect(d.attr('scale')).toBe(3);
          d.attr('scaleX', 3);
          d.attr('scaleY', 1);
          expect(d.attr('scale')).toBe(2); // avg of scaleX and scaleY
        });

        it('Transform scale (scaleX, scaleY)', function() {
          var d = new DisplayObject(),
              m = function() { return d.attr('matrix'); },
              x = 50,
              y = 50;
          d.attr('x', x);
          d.attr('y', y);
          // Double size:
          d.attr('scaleX', 2);
          expect(x * m().a + y * m().c).toBeCloseTo(2*x, precision);
          expect(x * m().b + y * m().d).toBeCloseTo(y, precision); // unchanged
          d.attr('scaleY', 2);
          expect(x * m().a + y * m().c).toBeCloseTo(2*x, precision);
          expect(x * m().b + y * m().d).toBeCloseTo(2*y, precision);
          // Back to original size:
          d.attr('scaleX', 1);
          d.attr('scaleY', 1);
          expect(x * m().a + y * m().c).toBeCloseTo(x, precision);
          expect(x * m().b + y * m().d).toBeCloseTo(y, precision);
        });


        it('should use the origin attribute for scale', function() {
          var d, m;

          d = new DisplayObject();
          d.attr('origin', {x: 100, y: 100});
          d.attr('scaleX', 1.5);
          d.attr('scaleY', 2);
          m = d.attr('matrix');
          expect(m.a).toBe(1.5);
          expect(m.d).toBe(2);
          expect(m.tx).toBe(-50);
          expect(m.ty).toBe(-100);
        });

      });

      it('should use the origin attribute for rotation', function() {
        var d, m, m2, p;

        var origin = {x: 100, y: 50};
        var rotation = Math.PI / 4;

        d = new DisplayObject();
        d.attr('origin', origin);
        d.attr('rotation', rotation);
        m = d.attr('matrix');

        m2 = m.clone().identify().rotate(rotation);
        p = m2.transformPoint(origin);

        expect(m.a).toBe(m2.a);
        expect(m.b).toBe(m2.b);
        expect(m.c).toBe(m2.c);
        expect(m.d).toBe(m2.d);
        expect(m.tx).toBe(origin.x - p.x);
        expect(m.ty).toBe(origin.y - p.y);

      });

      it('should apply a series of rotations and scales as expected', function() {
        /*
          Background: animations that work on scale and rotation at the same
          time may cause elements to "collapse" -- add rotation to
          animation-stars.js to see the error.

          Write the test w/o animation to break it down.
         */
        var d, m, m2;

        var rotation = 1.5 * Math.PI;
        var scale = 2;

        d = new DisplayObject();
        for (var i = 0; i < 4; i++) {
          d.attr('scale', i * scale / 3);
          d.attr('rotation', i * rotation / 3);
        }

        m = d.attr('matrix');
        m2 = m.clone().identify().rotate(rotation).scale(scale, scale);
        ['a', 'b', 'c', 'd', 'tx', 'ty'].forEach(function(p) {
          expect(m[p]).toBeCloseTo(m2[p], 10);
        });
      });
    });

    describe('#getComputed()', function() {
      it('should return 0 if invoked with "width"', function() {
        expect(new DisplayObject().getComputed('width')).toBe(0);
      });

      it('should return 0 if invoked with "height"', function() {
        expect(new DisplayObject().getComputed('height')).toBe(0);
      });

      it('should return 0 if invoked with "top"', function() {
        expect(new DisplayObject().getComputed('top')).toBe(0);
      });

      it('should return 0 if invoked with "right"', function() {
        expect(new DisplayObject().getComputed('right')).toBe(0);
      });

      it('should return 0 if invoked with "bottom"', function() {
        expect(new DisplayObject().getComputed('bottom')).toBe(0);
      });

      it('should return 0 if invoked with "left"', function() {
        expect(new DisplayObject().getComputed('left')).toBe(0);
      });

      it('should return an object with "top", "right", "bottom", "left", ' +
        '"width" and "height" properties of 0 when invoked with "size"', function() {
        expect(
          new DisplayObject().getComputed('size')
        ).toEqual({top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0});
      });

      it('should return undefined for arbitrary parameters', function() {
        expect(new DisplayObject().getComputed('arbitrary')).toBe();
        expect(new DisplayObject().getComputed(12)).toBe();
        expect(new DisplayObject().getComputed({})).toBe();
      });
    });

    describe('lifecycle', function() {
      function createMockRegistry() {
        return {
          displayObjects: {},
          needsInsertion: {},
          needsDraw: {}
        };
      }

      var displayObject, registry, stage;
      beforeEach(function() {
        displayObject = new DisplayObject();
        displayObject.parent = new DisplayObject();
        stage = {};
        stage.registry = registry = {
          displayObjects: {},
          needsInsertion: {},
          needsDraw: {}
        };
      });

      describe('#_activate()', function() {
        it('should add the display object to the registry for display objects ' +
          'of the passed in stage', function() {
          var displayObjectsRegistry = registry.displayObjects;
          displayObject._activate(stage);

          expect(displayObjectsRegistry[displayObject.id]).toBe(displayObject);
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

    describe('addTo', function() {
      var displayObject, parent;
      beforeEach(function() {
        displayObject = new DisplayObject();
        parent = {
          addChild: jasmine.createSpy('addChild')
        };
      });

      it('calls addChild on the parent with itself as only argument if no ' +
        'index is given', function() {
        displayObject.addTo(parent);
        expect(parent.addChild).toHaveBeenCalledWith(displayObject);
      });

      it('calls addChild on the parent with itself and the index as ' +
        'arguments if index is given', function() {
        var index = 20;
        displayObject.addTo(parent, index);
        expect(parent.addChild).toHaveBeenCalledWith(displayObject, index);
      });
    });
  });
});
