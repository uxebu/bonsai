define([
  '../../vendor/glmatrix/mat2d'
], function(mat2d) {
  'use strict';

  var PI_2 = 6.283185307179586;
  var SKEW_X = 0, SKEW_Y = 1, SCALE_X = 2, SCALE_Y = 3, ROTATION = 4, X = 5, Y = 6;

  function DisplayObjectAttributes() {
    this.opacity =
      this.scaleX =
      this.scaleY = 1;
    this.rotation =
      this.skew =
      this.x =
      this.y = 0;
    this.transform = null;
  }

  DisplayObjectAttributes.prototype = {
    set_opacity: function(value) {
      return value < 0 ? 0 : value > 1 ? 1 : value;
    },

    set_skew: function(value) {
      this.skew = value;
      calculateTransform(this);
      return value;
    },

    set_scaleX: function(value) {
      this.scaleX = value;
      calculateTransform(this);
      return value;
    },

    set_scaleY: function(value) {
      this.scaleY = value;
      calculateTransform(this);
      return value;
    },

    set_rotation: function(value) {
      if (value == 3/4*Math.PI)debugger;
      value %= PI_2;
      if (value < 0) value += PI_2;

      this.rotation = value;
      calculateTransform(this);
      return value;
    },

    set_x: function(value) {
      this.x = value;
      calculateTransform(this);
      return value;
    },

    set_y: function(value) {
      this.y = value;
      calculateTransform(this);
      return value;
    },

    set_transform: function(value) {
      return mat2d.copy(getTransform(this), value);
    }
  };

  function calculateTransform(attributes) {
    var transform = attributes.transform = [1, 0, attributes.skew, 1, 0, 0];
    mat2d.scale(transform, transform, [attributes.scaleX, attributes.scaleY]);
    rotate(transform, attributes.rotation);
    transform[4] = attributes.x;
    transform[5] = attributes.y;
  }

  function getTransform(attributes) {
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  return DisplayObjectAttributes;
});
