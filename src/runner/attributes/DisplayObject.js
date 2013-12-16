define([
  '../../util/unit',
  '../../vendor/glmatrix/mat2d'
], function(unit, mat2d) {
  'use strict';

  var PI_2 = 6.283185307179586;
  var atan2 = Math.atan2;

  function DisplayObjectAttributes() {
    this.opacity =
      this.scaleX =
      this.scaleY = 1;
    this.rotation =
      this.skew =
      this.x =
      this.y = 0;
    this.transform = null;

    this._isTransformDirty = false;
  }

  DisplayObjectAttributes.prototype = {
    set_opacity: function(value) {
      return value < 0 ? 0 : value > 1 ? 1 : value;
    },

    set_skew: function(value) {
      this._isTransformDirty = value !== this.skew;
      return value;
    },

    set_scaleX: function(value) {
      this._isTransformDirty = value !== this.scaleX;
      return value;
    },

    set_scaleY: function(value) {
      this._isTransformDirty = value !== this.scaleY;
      return value;
    },

    set_rotation: function(value) {
      if (typeof value === 'string') value = unit.parseAngle(value);
      this._isTransformDirty = this.rotation !== value;
      return limitRotation(value);
    },

    set_x: function(value) {
      this._isTransformDirty = value !== this.x;
      return value;
    },

    set_y: function(value) {
      this._isTransformDirty = value !== this.y;
      return value;
    },

    get_transform: function() {
      if (!this._isTransformDirty) {
        return this.transform;
      }

      var transform = getTransform(this);
      transform[0] = this.scaleX;
      transform[2] = this.skew * this.scaleX;
      transform[3] = this.scaleY;
      transform[1] = transform[4] = transform[5] = 0;
      if (this.rotation) {
        rotate(transform, this.rotation);
      }
      transform[4] = this.x;
      transform[5] = this.y;

      this._isTransformDirty = false;
      return transform;
    },

    set_transform: function(value) {
      // don't operate on the passed in transform to avoid side-effects
      var transform = mat2d.copy(tmpTransform, value);

      this.x = transform[4];
      this.y = transform[5];
      transform[4] = transform[5] = 0;

      var a = atan2(transform[1], transform[0]);
      var b = -atan2(transform[2], transform[3]);
      var angle = this.rotation = limitRotation(a > b ? a : b);
      rotate(transform, -angle);

      var scaleX = this.scaleX = transform[0];
      this.scaleY = transform[3];
      this.skew = transform[2] / scaleX;

      this._isTransformDirty = false;
      return mat2d.copy(getTransform(this), value);
    }
  };

  // avoid array allocations when setting transforms
  var tmpTransform = [];

  function limitRotation(angle) {
    return angle < 0 ? angle % PI_2 + PI_2 : angle % PI_2;
  }

  function getTransform(attributes) {
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  return DisplayObjectAttributes;
});
