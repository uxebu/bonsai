define(function() {
  'use strict';

  var sqrt = Math.sqrt;

  /**
   * The Point constructor
   *
   * @constructor
   * @name Point
   * @param {Number} x The x value
   * @param {Number} y The y value
   */
  function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  /** @lends Point.prototype */
  var proto = Point.prototype;

  /**
   * Adds a vector to the point.
   *
   * @param {object|Point} v The vector to add. Must contain an x and
   *  a y property.
   * @returns {Point} The Point instance
   */
  proto.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  /**
   * Checks equality of current instance to another Point instance.
   *
   * @param {object|Point} toCompare The object or point instance to compare
   * @returns {Boolean}
   */
  proto.equals = function(toCompare) {
    return this.x == toCompare.x && this.y == toCompare.y;
  };

  /**
   * Creates and returns a clone of the given instance.
   *
   * @returns {Point} The cloned Point
   */
  proto.clone = function() {
    return new Point(this.x, this.y);
  };

  /**
   * Scales the line segment between (0,0) and the current point to a set length.
   *
   * @param {Number} length The scaling value
   * @returns {Point} The current Point instance
   */
  proto.normalize = function(length) {
    var fact = length / this.length;
    this.x = this.x * fact;
    this.y = this.y * fact;
    return this;
  };

  /**
   * Offsets the Point object by the specified amount.
   * The value of dx is added to the original value of x
   * to create the new x value. The value of dy is added
   * to the original value of y to create the new y value.
   *
   * @param {Number} dx The amount by which to offset the horizontal coordinate, x.
   * @param {Number} dy The amount by which to offset the vertical coordinate, y.
   * @returns {Point} The current Point instance
   */
  proto.offset = function(dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  };

  /**
   * Subtracts the coordinates of another point from the
   * coordinates of this point to create a new point.
   *
   * @param {Point} newPoint The new point.
   * @returns {Point} The current Point instance
   */
  proto.subtract = function(newPoint) {
    this.x -= newPoint.x;
    this.y -= newPoint.y;
    return this;
  };

  /**
   * Divides the point's coords by f
   *
   * @param {Number} f Divisor
   * @returns {Point} The current Point instance
   */
  proto.divide = function(f) {
    this.x /= f;
    this.y /= f;
    return this;
  };

  /**
   * Multiplies the point's coords by f
   *
   * @param {Number} f Multiplier
   * @returns {Point} The current Point instance
   */
  proto.multiply = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  };

  /**
   * Returns a csv (comma seperated values).
   *
   * @returns {String} a csv
   */
  proto.toString = function() {
    return this.x + ',' + this.y + ' ';
  };

  /**
   * Returns a plain object with x and y.
   *
   * @returns {Object} an object
   */
  proto.toObject = function() {
    return Object.create(null, {
      x: { value: this.x },
      y: { value: this.y }
    });
  };

  /**
   * Returns a plain array with x and y.
   *
   * @returns {Array} an array
   */
  proto.toArray = function() {
    return [this.x, this.y];
  };

  /**
   * Returns the distance between pt1 and pt2.
   *
   * @param {Point} toPoint
   * @returns {Number} distance
   */
  proto.distance = function(toPoint) {
    var hside = this.x - toPoint.x;
    var vside = this.y - toPoint.y;
    return sqrt(hside * hside + vside * vside);
  };


  /**
   * Returns the angle in radians of the slope between pt1 and pt2
   *
   * @param {Point} toPoint
   * @returns {Number} angle
   */
  proto.angle = function(toPoint) {
    return Math.atan2(this.y - toPoint.y, this.x - toPoint.x);
  };

  // static methods

  /**
   * Determines a point between two specified points. The parameter f
   * determines where the new interpolated point is located relative to
   * the two end points specified by parameters pt1 and pt2. The closer
   * parameter f is to 1.0, the closer the interpolated point will be
   * to the first point (parameter pt1). The closer parameter f is to 0,
   * the closer the interpolated point will be to the second point (parameter pt2).
   * f indicates where the new point will be, along the line between pt1 and pt2.
   * If f=1, pt1 is returned; if f=0, pt2 is returned.
   *
   * @param {Point} pt1 The first point.
   * @param {Point} pt2 The second point.
   * @param {Number} f The level of interpolation between the two points.
   * @returns {Point} The new, interpolated point.
   */
  Point.interpolate = function(pt1, pt2, f) {
    return new Point(pt1.x + f * (pt1.x - pt2.x), pt1.y + f * (pt1.y - pt2.y));
  };

  /**
   * Converts a pair of polar coordinates to a Cartesian point coordinate.
   *
   * @param {Number} len The length coordinate of the polar pair.
   * @param {Number} angle The angle, in radians, of the polar pair.
   * @returns {Point} The Cartesian point.
   */
  Point.polar = function(len, angle) {
    return new Point(len * Math.cos(angle), len * Math.sin(angle));
  };

  /**
   * Linear Interpolation between two points a and b
   *
   * @param {Point} pt1 The first point.
   * @param {Point} pt2 The second point.
   * @param {Number} f The level of interpolation between the two points.
   * @returns {Point} The new, interpolated point.
   */
   Point.lerp = function(pt1, pt2, f) {
    return pt1.clone().multiply(1-f).add(pt2.clone().multiply(f));
   };

  return Point;
});
