define([
  'bonsai/runner/display_object',
  'bonsai/runner/group',
  'bonsai/event_emitter',
  'bonsai/runner/matrix',
  'bonsai/tools',
  'bonsai/point',
  'common/mock',
  'common/displayobject-lifecycle'
], function(DisplayObject, Group, EventEmitter, Matrix, tools, Point, mock, testLifeCycle) {
  describe('DisplayObject', function() {
    testLifeCycle(function() {
      return new DisplayObject();
    });

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

        it('should set the scale properties when a matrix is updated', function () {
          var d, m;
          d = new DisplayObject();
          m = new Matrix(2, 0, 0, 2, 0, 0);
          d.attr('matrix', m);
          expect(d.attr('scaleX')).toBe(2);
          expect(d.attr('scaleY')).toBe(2);
          expect(d.attr('scale')).toBe(2);

          // reset
          d.attr('scaleX', 1);
          d.attr('scaleY', 1);
          expect(d.attr('scaleX')).toBe(1);
          expect(d.attr('scaleY')).toBe(1);
          expect(d.attr('scale')).toBe(1);
        });

        it('should allow the matrix to be updated after setting a scale', function () {
          var d, m;
          d = new DisplayObject();
          m = new Matrix(2, 0, 0, 3, 0, 0);

          // scale up, then set the matrix
          d.attr('scaleX', 1.5);
          d.attr('scaleY', 2);
          d.attr('matrix', m);

          expect(d.attr('scaleX')).toBe(2);
          expect(d.attr('scaleY')).toBe(3);

          expect(d.attr('scale')).toBe((2 + 3) / 2);
        });

        it('should return the an equivalent matrix when setting the matrix attribute', function() {
          var scaleX = 2;
          var scaleY = 3;
          var tx = 123, ty = 654;
          var d = new DisplayObject(), m = new Matrix(scaleX, 0, 0, scaleY, tx, ty);

          // scale up, then set the matrix
          d.attr('scaleX', 1.5);
          d.attr('scaleY', 2);
          d.attr('matrix', m);

          expect(d.attr('matrix')).toEqual(new Matrix(scaleX, 0, 0, scaleY, tx, ty));
        });
      });

      it('should mark the object for update when the matrix is updated', function() {
        var d = new DisplayObject();
        d.stage = {registry: {needsDraw: {}}};

        d.attr('matrix', new Matrix());
        expect(d.stage.registry.needsDraw).toHaveOwnProperties(d.id);
      });

      it('should use the origin attribute for rotation', function() {
        var d, m, m2, p;

        var origin = {x: 100, y: 50};
        var rotation = Math.PI / 4;

        d = new DisplayObject();
        d.attr('origin', origin);
        d.attr('rotation', rotation);
        m = d.attr('matrix');

        m2 = m.clone().identity().rotate(rotation);
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
        m2 = m.clone().identity().rotate(rotation).scale(scale, scale);
        ['a', 'b', 'c', 'd', 'tx', 'ty'].forEach(function(p) {
          expect(m[p]).toBeCloseTo(m2[p], 10);
        });
      });
    });

    describe('interactive', function() {
      it('should be set to true by default', function() {
        var d = new DisplayObject();
        expect(d.attr('interactive')).toBe(true);
      });
      it('should be settable/gettable', function() {
        var d = new DisplayObject();
        d.attr('interactive', true);
        expect(d.attr('interactive')).toBe(true);
        d.attr('interactive', false);
        expect(d.attr('interactive')).toBe(false);
      });
    });

    describe('#getBoundingBox()', function() {
      describe('without transform parameter', function() {
        it('should return 0 if invoked with "width"', function() {
          expect(new DisplayObject().getBoundingBox().width).toBe(0);
        });

        it('should return 0 if invoked with "height"', function() {
          expect(new DisplayObject().getBoundingBox().height).toBe(0);
        });

        it('should return 0 if invoked with "top"', function() {
          expect(new DisplayObject().getBoundingBox().top).toBe(0);
        });

        it('should return 0 if invoked with "right"', function() {
          expect(new DisplayObject().getBoundingBox().right).toBe(0);
        });

        it('should return 0 if invoked with "bottom"', function() {
          expect(new DisplayObject().getBoundingBox().bottom).toBe(0);
        });

        it('should return 0 if invoked with "left"', function() {
          expect(new DisplayObject().getBoundingBox().left).toBe(0);
        });

        it('should return an object with "top", "right", "bottom", "left", ' +
          '"width" and "height" properties of 0 when invoked with "size"', function() {
          expect(
            new DisplayObject().getBoundingBox()
          ).toEqual({top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0});
        });
      });

      describe('getAbsoluteBoundingBox', function() {
        it('Gets absolute bbox relative to top-most ancestor', function() {
          var a = new Group().attr('scaleX', 2);
          var b = new Group().attr('scaleY', 1.5).attr('scaleX', 2).attr('x', 20);
          var obj = new DisplayObject();
          b.addTo(a);
          obj.addTo(b);
          obj.attr({
            x: 100,
            y: 100
          });
          expect(obj.getAbsoluteBoundingBox()).toEqual({
            top: 150,
            left: 440,
            bottom: 150,
            right: 440,
            width: 0,
            height: 0
          });
        });
      });

      describe('getAbsoluteMatrix', function() {
        it('Gets the matrix of the DisplayObject concat\'d with all ancestors\' matrices', function() {
          var a = new Group().attr('scaleX', 2);
          var b = new Group().attr('scaleY', 1.5).attr('scaleX', 2).attr('x', 20);
          var obj = new DisplayObject();
          b.addTo(a);
          obj.addTo(b);
          obj.attr({
            x: 100,
            y: 100
          });
          var m = obj.getAbsoluteMatrix();
          expect(m).toEqual(new Matrix(4, 0, 0, 1.5, 440, 150));
        });
      });

      describe('with transform parameter', function() {
        var outerTransform = new Matrix(0.313, 1.527, -0.429, 0.240, 145.25, 234.75);
        var zeroTransformed = outerTransform.transformPoint({x: 0, y: 0});

        it('should return 0 if invoked with "width"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).width).toBe(0);
        });

        it('should return 0 if invoked with "height"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).height).toBe(0);
        });

        it('should return the right value if invoked with "top"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).top).toBe(zeroTransformed.y);
        });

        it('should return the right value if if invoked with "right"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).right).toBe(zeroTransformed.x);
        });

        it('should return 0 if invoked with "bottom"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).bottom).toBe(zeroTransformed.y);
        });

        it('should return 0 if invoked with "left"', function() {
          expect(new DisplayObject().getBoundingBox(outerTransform).left).toBe(zeroTransformed.x);
        });

        it('should return an object with "top", "right", "bottom", "left", ' +
          '"width" and "height" properties of 0 when invoked with "size"', function() {
          expect(
            new DisplayObject().getBoundingBox(outerTransform)
          ).toEqual({
              top: zeroTransformed.y,
              right: zeroTransformed.x,
              bottom: zeroTransformed.y,
              left: zeroTransformed.x,
              width: 0,
              height: 0
            });
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

    describe('destroy', function(){
      var displayObject, parent;
      beforeEach(function() {
        parent = new Group();
        displayObject = new DisplayObject().addTo(parent);
      });

      it('removes the displayobject from its parent', function(){
        displayObject.destroy();
        expect(displayObject.parent).toEqual(void 0); // allows for null as well
      });

      it('removes the displayobject from its parent', function(){
        displayObject.destroy();
        expect(parent.children()).not.toContain(displayObject);
      });

      it('emits a "destroy" event when being destroyed', function(){
        var spy = jasmine.createSpy();
        displayObject.on('destroy', this, spy);
        displayObject.destroy();
        expect(spy).toHaveBeenCalled();
        //TOFIX: freezes the test runner
        //expect(spy.mostRecentCall.object).toBe(displayObject);
      });
    });

    describe('Coordinate space conversion', function() {
      beforeEach(function() {
        this.addMatchers({
          toMatchPoint: function(x, y) {
            var round = Math.round;
            var precision = 1 << 24;
            var point = this.actual;
            return round(x * precision) === round(point.x * precision) &&
              round(y * precision) === round(point.y * precision);
          }
        })
      });

      describe('globalToLocal', function() {
        it('should apply a rotation transformation as expected', function() {
          var displayObject = new DisplayObject();
          var transform = new Matrix().rotate(Math.PI / 4);
          displayObject.attr('matrix', transform);

          expect(displayObject.globalToLocal(new Point(Math.sqrt(8), 0))).toMatchPoint(2, -2);
        });

        it('should apply a translation as expected', function() {
          var displayObject = new DisplayObject();
          var tx = 100;
          var ty = 200;
          var transform = new Matrix().translate(tx, ty);
          displayObject.attr('matrix', transform);

          var x = 10;
          var y = 20;
          expect(displayObject.globalToLocal(new Point(x, y))).toMatchPoint(x - tx, y - ty);
        });

        it('should apply the transform of an display object to a point', function() {
          var point = new Point(-102, 23.75);
          var matrix = new Matrix(1.0625, 0.3125, -1.25, -1.09375, 26.5, -34);
          var displayObject = new DisplayObject().attr('matrix', matrix);

          expect(displayObject.globalToLocal(point))
            .toEqual(matrix.invert().transformPoint(point));
        });

        it('should apply the inverted computed transform of the display object and each of its parents', function() {
          var point = new Point(-102, 23.75);
          var matrix = new Matrix(1.375, -0.75, 1.328125, -0.15625, 41.75, -34.25);
          var displayObject = new DisplayObject().attr('matrix', matrix);

          var parent = new Group();
          parent.addChild(displayObject);
          var parentMatrix = new Matrix(1.9375, -1.609375, -1.609375, -0.078125, -15.5, -7);
          parent.attr('matrix', parentMatrix);

          var root = new Group();
          root.addChild(parent);
          var rootMatrix = new Matrix(-0.0625, 1.6875, -1.5, -1.421875, -14.5, 36.75);
          root.attr('matrix', rootMatrix);

          var absoluteMatrix = matrix.concat(parentMatrix).concat(rootMatrix);

          expect(displayObject.globalToLocal(point))
            .toEqual(absoluteMatrix.invert().transformPoint(point));
        });
      });

      describe('localToGlobal', function() {
        it('should apply a rotation transformation as expected', function() {
          var displayObject = new DisplayObject();
          var transform = new Matrix().rotate(Math.PI / 4);
          displayObject.attr('matrix', transform);

          expect(displayObject.localToGlobal(new Point(2, 2))).toMatchPoint(0, Math.sqrt(8));
        });

        it('should apply a translation as expected', function() {
          var displayObject = new DisplayObject();
          var tx = 100;
          var ty = 200;
          var transform = new Matrix().translate(tx, ty);
          displayObject.attr('matrix', transform);

          var x = 10;
          var y = 20;
          expect(displayObject.localToGlobal(new Point(x, y))).toMatchPoint(x + tx, y + ty);
        });

        it('should apply the inversed transform of an display object to a point', function() {
          var point = new Point(-102, 23.75);
          var matrix = new Matrix(1.0625, 0.3125, -1.25, -1.09375, 26.5, -34);
          var displayObject = new DisplayObject().attr('matrix', matrix);

          expect(displayObject.localToGlobal(point))
            .toEqual(matrix.transformPoint(point));
        });

        it('should apply the computed transform of the display object and each of its parents', function() {
          var point = new Point(-102, 23.75);
          var matrix = new Matrix(1.375, -0.75, 1.328125, -0.15625, 41.75, -34.25);
          var displayObject = new DisplayObject().attr('matrix', matrix);

          var parent = new Group();
          parent.addChild(displayObject);
          var parentMatrix = new Matrix(1.9375, -1.609375, -1.609375, -0.078125, -15.5, -7);
          parent.attr('matrix', parentMatrix);

          var root = new Group();
          root.addChild(parent);
          var rootMatrix = new Matrix(-0.0625, 1.6875, -1.5, -1.421875, -14.5, 36.75);
          root.attr('matrix', rootMatrix);

          var absoluteMatrix = matrix.concat(parentMatrix).concat(rootMatrix);

          expect(displayObject.localToGlobal(point))
            .toEqual(absoluteMatrix.transformPoint(point));
        });
      });
    });
  });
});
