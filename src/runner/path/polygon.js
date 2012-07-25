define([
  './path',
  './special_attr_path',
  '../../tools'
], function(Path, SpecialAttrPath, tools) {
  'use strict';

  Path.polygon = function(x, y, radius, sides) {
    return new Path(new Polygon(x, y, radius, sides).segments()).attr({
      x: x,
      y: y
    });
  };

  var PI2 = Math.PI*2;
  var sin = Math.sin;
  var cos = Math.cos;

  /**
   * Creates a polygon
   *
   * @constructor
   * @name Polygon
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The horizontal offset/translation of the polygon center.
   * @param {Number} y The vertical offset/translation of the polygon center.
   * @param {Number} radius The radius of the polygon
   * @param {Number} sides The number of sides of the polygon. Must be > 3
   */
  function Polygon(x, y, radius, sides) {

    SpecialAttrPath.call(this, {
      radius: 0,
      sides: 3
    });

    this.attr({
      x: x,
      y: y,
      sides: sides,
      radius: radius
    });

  }

  /** @lends module:path.Polygon.prototype **/
  var proto = Polygon.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Polygon's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var attr = this._attributes,
        x = attr.x,
        y = attr.y,
        sides = attr.sides,
        radius = attr.radius;

    if (!(sides >= 3)) { // >= catches NaN, null, etc.
      throw RangeError('A polygon needs at least 3 sides.');
    }

    sides >>>= 0; // floor number of sides, max number of sides is 4294967295
    this.attr({x: x, y: y});

    // start at 12 o'clock, continue clockwise
    this.moveTo(0, -radius);
    for (var i = 1, current; i < sides; i++) {
      current = PI2 * i / sides;
      this.lineTo(sin(current) * radius, -cos(current) * radius);
    }
    this.closePath();

  };

  return Polygon;

});
