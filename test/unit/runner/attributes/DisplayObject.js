define([
  'bdd',
  'expect',
  'bonsai/runner/attributes/DisplayObject',
  'bonsai/vendor/glmatrix/mat2d'
], function(bdd, expect, DisplayObjectAttributes, mat2d) {
  'use strict';
  var describe = bdd.describe, it = bdd.it, beforeEach = bdd.beforeEach;
  var xit = bdd.xit;

  describe('attributes/DisplayObject:', function() {
    var attributes;
    beforeEach(function() {
      attributes = new DisplayObjectAttributes();
    });

    function identityMatrix() {
      return [1, 0, 0, 1, 0, 0];
    }

    describe('opacity:', function() {
      it('defaults to 1', function() {
        expect(attributes.opacity).to.equal(1);
      });
      it('setter passes through 0', function() {
        expect(attributes.set_opacity(0))
          .to.equal(0);
      });

      it('setter passes through 1', function() {
        expect(attributes.set_opacity(1))
          .to.equal(1);
      });

      it('setter passes through .7', function() {
        expect(attributes.set_opacity(.7))
          .to.equal(.7);
      });

      it('setter returns 0 for values < 0', function() {
        expect(attributes.set_opacity(-1.2))
          .to.equal(0);
      });

      it('setter returns 1 for values > 1', function() {
        expect(attributes.set_opacity(123))
          .to.equal(1);
      });
    });

    describe('transform', function() {
      it('defaults to `null`', function() {
        expect(attributes.transform).to.equal(null);
      });

      it('setter copies the value if uninitialized', function() {
        var transform = [1, 2, 3, 4, 5, 6];
        var out = attributes.set_transform(transform);

        expect(out)
          .to.deep.equal(transform);

        expect(out)
          .not.to.equal(transform);
      });

      it('setter updates an existing transform', function() {
        var transform = [1, 2, 3, 4, 5, 6];
        attributes.transform = identityMatrix();

        expect(attributes.set_transform(transform))
          .to.equal(attributes.transform);
      });

      it('extracts the rotation correctly', function() {
        var angle = Math.PI / 3;
        var transform = identityMatrix();
        mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise

        attributes.set_transform(transform);

        expect(attributes.rotation)
          .to.equal(angle);
      });

      it('extracts the scale correctly', function() {
        var scaleX = 2.5, scaleY = 0.4;
        var transform = identityMatrix();
        mat2d.scale(transform, transform, [scaleX, scaleY]);

        attributes.set_transform(transform);

        expect(attributes.scale)
          .to.deep.equal([scaleX, scaleY]);
      });

      it('extracts the translation correctly', function() {
        var x = 123, y = -456;
        var transform = identityMatrix();
        mat2d.translate(transform, transform, [x, y]);

        attributes.set_transform(transform);

        expect(attributes.translation)
          .to.deep.equal([x, y]);
      });
    });

    describe('scale', function() {
      it('defaults to null', function() {
        expect(attributes.scale).to.equal(null);
      });

      it('setter sets scale on the transform', function() {
        var scaleX = 1.23, scaleY = 4.56;
        attributes.set_scale([scaleX, scaleY]);

        expect(attributes.transform)
          .to.deep.equal([scaleX, 0, 0, scaleY, 0, 0]);
      });

      it('setter copies the value if unitialized', function() {
        var scale = [1.23, 4.56];
        var out = attributes.set_scale(scale);

        expect(out)
          .to.deep.equal(scale);

        expect(out)
          .not.to.equal(scale);
      });

      it('setter updates an existing value', function() {
        attributes.scale = [1, 1];

        expect(attributes.set_scale([2, 3]))
          .to.equal(attributes.scale);
      });
    });

    describe('rotation', function() {
      it('defaults to 0', function() {

        expect(attributes.rotation)
          .to.equal(0);
      });

      it('setter passes through 0', function() {
        expect(attributes.set_rotation(0))
          .to.equal(0);
      });

      it('setter passes through nextAfter(2*PI, 0)', function() {
        var oneSmallerThan2Pi = 6.283185307179585;

        expect(attributes.set_rotation(oneSmallerThan2Pi))
          .to.equal(oneSmallerThan2Pi);
      });

      it('setter passes values between 0 and 2 * PI', function() {
        var angle = 4 / 3;

        expect(attributes.set_rotation(angle * Math.PI))
          .to.equal(angle * Math.PI);
      });

      it('setter normalizes negative values to the range [0, 2*PI)', function() {
        expect(attributes.set_rotation(-2.5 * Math.PI))
          .to.equal(1.5 * Math.PI);
      });

      it('setter normalizes 2*PI to 0', function() {
        expect(attributes.set_rotation(2 * Math.PI))
          .to.equal(0);
      });

      it('setter normalizes values > 2*PI to the range [0, 2*PI)', function() {
        expect(attributes.set_rotation(2 * Math.PI + 0.5))
          .to.equal(0.5);
      });

      it('setter sets rotation on transform', function() {
        var rotation = 1.5 * Math.PI;
        attributes.set_rotation(rotation);

        var expected = identityMatrix();
        mat2d.rotate(expected, expected, -rotation); // glmatrix rotates counter-clockwise

        expect(attributes.transform)
          .to.deep.equal(expected);
      });
    });

    describe('translation', function() {
      it('defaults to `null`', function() {

        expect(attributes.translation)
          .to.equal(null);
      });

      it('setter copies the value if uninitialized', function() {
        var translation = [123, 456];
        var out = attributes.set_translation(translation);

        expect(out)
          .to.deep.equal(translation);
        expect(out)
          .not.to.equal(translation);
      });

      it('setter updates an existing attribute', function() {
        var translation = attributes.translation = [1, 2];

        expect(attributes.set_translation([123, 456]))
          .to.equal(translation);
      });

      it('setter sets translation on transform', function() {
        var x = 123, y = 456;
        attributes.set_translation([x, y]);

        expect(attributes.transform)
          .to.deep.equal([1, 0, 0, 1, x, y]);
      });

      it('x setter sets the x-axis translation on the transform', function() {
        var x = 123;
        attributes.set_x(x);
        expect(attributes.transform).to.deep.equal([1, 0, 0, 1, x, 0]);
      });

      it('x setter sets the x-axis of the translation', function() {
        var x = 123;
        attributes.set_x(x);
        expect(attributes.translation).to.deep.equal([x, 0]);
      });

      it('y setter sets the x-axis translation on the transform', function() {
        var y = 123;
        attributes.set_y(y);
        expect(attributes.transform).to.deep.equal([1, 0, 0, 1, 0, y]);
      });

      it('x setter sets the y-axis of the translation', function() {
        var y = 123;
        attributes.set_y(y);
        expect(attributes.translation).to.deep.equal([0, y]);
      });
    });
  });
});
