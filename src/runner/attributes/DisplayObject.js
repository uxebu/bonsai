define([
  '../../vendor/glmatrix/mat2d',
  '../../vendor/glmatrix/vec2'
], function(mat2d, vec2) {
  'use strict';
    var PI_2 = 2 * Math.PI;

  function DisplayObjectAttributes() {
    this.opacity = 1;
    this.rotation = 0;
    this.scale = null;
    this.transform = null;
    this.translation = null;
  }

  DisplayObjectAttributes.prototype = {
    set_opacity: function(value) {
      return value < 0 ? 0 : value > 1 ? 1 : value;
    },

    set_rotation: function(angle) {
      angle %= PI_2;
      if (angle < 0) angle += PI_2;

      var transform = getTransform(this);
      rotate(transform, angle);

      return angle;
    },

    set_scale: function(scale) {
      var transform = getTransform(this);
      transform[0] = scale[0];
      transform[3] = scale[1];

      return vec2.copy(getScale(this), scale);
    },

    set_transform: function(transform) {
      var a = Math.atan2(transform[1], transform[0]);
      var b = -Math.atan2(transform[3], transform[4]);
      var rotation = this.rotation = a > b ? a : b;

      var scale = getScale(this);
      scale[0] = transform[0];
      scale[1] = transform[3];

      var translation = getTranslation(this);
      translation[0] = transform[4];
      translation[1] = transform[5];

      return mat2d.copy(getTransform(this), transform);
    },

    set_translation: function(translation) {
      var transform = getTransform(this);
      transform[4] = translation[0];
      transform[5] = translation[1];

      return vec2.copy(getTranslation(this), translation);
    },

    set_x: function(x) {
      getTransform(this)[4] = x;
      getTranslation(this)[0] = x;
    },

    set_y: function(y) {
      getTransform(this)[5] = y;
      getTranslation(this)[1] = y;
    }
  };

  function getTransform(attributes) {
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
  }

  function getScale(attributes) {
    return attributes.scale || (attributes.scale = [1, 1]);
  }

  function getTranslation(attributes) {
    return attributes.translation || (attributes.translation = [0, 0]);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  return DisplayObjectAttributes;
});
