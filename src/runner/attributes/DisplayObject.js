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

    set_scale: function(value, _, cache) {
      if (value !== this.scaleX || value !== this.scaleY) {
        invalidateTransform(cache);
      }
      this.scaleX = this.scaleY = value;
    },

    set_scaleX: setTransformComponent,

    set_scaleY: setTransformComponent,

    set_rotation: function(value, previousValue, cache) {
      if (typeof value === 'string') value = unit.parseAngle(value);
      if (previousValue !== value) invalidateTransform(cache);
      return limitRotation(value);
    },

    set_x: setTransformComponent,

    set_y: setTransformComponent,

    get_transform: function(transform, cache) {
      var cached = cache.transform;
      // not cached means transform needs to be re-computed
      if (cached !== undefined) {
        return cached;
      }

      var originX = this.transformOriginX, originY = this.transformOriginY;
      var scaleX = this.scaleX, scaleY = this.scaleY;
      var skew = this.skew, rotation = this.rotation;
      var x = this.x, y = this.y;
      var hasScale = scaleX !== 1 || scaleY !== 1;
      var hasTranslation = x || y;

      if (transform || hasTranslation || rotation || hasScale || skew) {
        transform = getTransform(transform);
        transform[0] = scaleX;
        transform[1] = 0;
        transform[2] = skew * scaleX;
        transform[3] = scaleY;
        transform[4] = -originX * scaleX;
        transform[5] = -originY * scaleY;
        if (rotation) {
          rotate(transform, rotation);
        }
        transform[4] += x + originX;
        transform[5] += y + originY;
      }

      cache.transform = transform;
      return transform;
    },

    set_transform: function(value, currentTransform, cache) {
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

      currentTransform = cache.transform = getTransform(currentTransform);
      return copyMatrix(currentTransform, value);
    },

    set_transformOriginX: setTransformComponent,

    set_transformOriginY: setTransformComponent,

    set_transformOrigin: function(value, _, cache) {
      var x = value[0], y = value[1];
      if (x !== this.transformOriginX || y !== this.transformOriginY) {
        invalidateTransform(cache);
      }
      this.transformOriginX = x;
      this.transformOriginY = y;
    }
  };

  // avoid array allocations when setting transforms
  var tmpTransform = [];

  function limitRotation(angle) {
    return angle < 0 ? angle % PI_2 + PI_2 : angle % PI_2;
  }

  function getTransform(transform) {
    return transform || Array(6);
  }

  function rotate(transform, angle) {
    mat2d.rotate(transform, transform, -angle); // glmatrix rotates counter-clockwise
  }

  function setTransformComponent(value, previousValue, cache) {
    if (value !== previousValue) invalidateTransform(cache);
    return value;
  }

  function invalidateTransform(cache) {
    cache.transform = undefined;
  }

  return DisplayObjectAttributes;
});
