define([
  '../../util/unit',
  '../../vendor/glmatrix/mat2d'
], function(unit, mat2d) {
  'use strict';

  var PI_2 = 6.283185307179586;
  var atan2 = Math.atan2;

  var copyMatrix = mat2d.copy;

  function DisplayObjectAttributes() {
    this.opacity =
      this.scaleX =
      this.scaleY = 1;
    this.rotation =
      this.skew =
      this.transformOriginX =
      this.transformOriginY =
      this.x =
      this.y = 0;
    this.transform = null;

    this._isTransformDirty = false;
  }

  DisplayObjectAttributes.prototype = {
    set_opacity: function(value) {
      return value < 0 ? 0 : value > 1 ? 1 : value;
    },

    set_skew: setTransformComponent,

    get_scale: function() {
      var scale = this.scaleX;
      return scale === this.scaleY ? scale : undefined;
    },

    set_scale: function(value) {
      this._isTransformDirty = value !== this.scaleX || value !== this.scaleY;
      this.scaleX = this.scaleY = value;
    },

    set_scaleX: setTransformComponent,

    set_scaleY: setTransformComponent,

    set_rotation: function(value, previousValue) {
      if (typeof value === 'string') value = unit.parseAngle(value);
      this._isTransformDirty = previousValue !== value;
      return limitRotation(value);
    },

    set_x: setTransformComponent,

    set_y: setTransformComponent,

    get_transform: function() {
      if (!this._isTransformDirty) {
        return this.transform;
      }

      var originX = this.transformOriginX, originY = this.transformOriginY;
      var scaleX = this.scaleX, scaleY = this.scaleY;

      var transform = getTransform(this);
      transform[0] = scaleX;
      transform[1] = 0;
      transform[2] = this.skew * scaleX;
      transform[3] = scaleY;
      transform[4] = -originX * scaleX;
      transform[5] = -originY * scaleY;
      if (this.rotation) {
        rotate(transform, this.rotation);
      }
      transform[4] += this.x + originX;
      transform[5] += this.y + originY;

      this._isTransformDirty = false;
      return transform;
    },

    set_transform: function(value) {
      // don't operate on the passed in transform to avoid side-effects
      var transform = copyMatrix(tmpTransform, value);

      this.x = transform[4];
      this.y = transform[5];

      var a = atan2(transform[1], transform[0]);
      var b = -atan2(transform[2], transform[3]);
      var angle = this.rotation = limitRotation(a > b ? a : b);
      rotate(transform, -angle);

      var scaleX = this.scaleX = transform[0];
      var scaleY = this.scaleY = transform[3];
      this.skew = transform[2] / scaleX;

      var originX = this.transformOriginX, originY = this.transformOriginY;
      if (originX !== 0 || originY !== 0) {
        transform[0] = transform[3] = 1;
        transform[4] = -originX * scaleX;
        transform[5] = -originY * scaleY;
        rotate(transform, angle);
        this.x -= originX + transform[4];
        this.y -= originY + transform[5];
      }

      this._isTransformDirty = false;
      return copyMatrix(getTransform(this), value);
    },

    set_transformOriginX: setTransformComponent,

    set_transformOriginY: setTransformComponent,

    set_transformOrigin: function(value) {
      var x = value[0], y = value[1];
      this._isTransformDirty = x !== this.transformOriginX || y !== this.transformOriginY;
      this.transformOriginX = x;
      this.transformOriginY = y;
    }
  };

  // avoid array allocations when setting transforms
  var tmpTransform = [];

  function limitRotation(angle) {
    return angle < 0 ? angle % PI_2 + PI_2 : angle % PI_2;
  }

  function getTransform(attributes) {
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
    return attributes.transform || (attributes.transform = [1, 0, 0, 1, 0, 0]);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  function setTransformComponent(value, previousValue) {
    this._isTransformDirty = value !== previousValue;
    return value;
  }

  return DisplayObjectAttributes;
});
