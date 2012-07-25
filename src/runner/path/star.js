define([
  './path',
  './special_attr_path',
  './polygon',
  '../../tools'
], function(Path, SpecialAttrPath, Polygon, tools) {
  'use strict';

  Path.star = function(x, y, radius, rays, factor) {
    return new Path(new Star(x, y, radius, rays, factor).segments()).attr({
      x: x,
      y: y
    });
  };

  /**
   * Creates a star
   *
   * @constructor
   * @name Star
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The horizontal offset/translation of the star center.
   * @param {Number} y The vertical offset/translation of the star center.
   * @param {Number} radius The radius of the star
   * @param {Number} rays The number of rays of the star. Must be > 3
   * @param {Number} [factor] determines the star "pointiness".
   *    0: all rays start at (0, 0)
   *    1: the star looks like a regular polygon: 3 vertices are on a line.
   *    If omitted, a regular star is created
   */
  function Star(x, y, radius, rays, factor) {

    SpecialAttrPath.call(this, {
      radius: 0,
      rays: 0,
      factor: 0
    });

    this.attr({
      x: x,
      y: y,
      radius: radius,
      rays: rays,
      factor: factor
    });

  }

  /** @lends module:path.Star.prototype **/
  var proto = Star.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Star's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var attr = this._attributes,
        x = attr.x,
        y = attr.y,
        rays = 0 | attr.rays,
        factor = attr.factor,
        radius = attr.radius;

    if (!(rays >= 3)) { // >= catches NaN, null, etc.
      throw RangeError('A star needs at least 3 rays.');
    }

    // use a polygon as starting point
    this.segments(new Polygon(x, y, radius, rays).segments());

    // make a star from it by inserting points
    var segments = this.segments();
    var from = segments[0], to;
    var starSegments = [from.slice()];

    /*
      If factor is not given, we default to a regular star.

      We create a regular star by connecting every `floor((rays - 1) / 2)` ray
      end point verteces.
    */
    if (!(factor >= 0 || factor < 0)) { // catches NaN, undefined etc.
      var b = segments[rays / 2 - .5 | 0];
      var ax = 0, ay = from[2], bx = b[1], by = b[2];
      to = segments[1];
      var qx = (ax + to[1]) / 2, qy = (ay + to[2]) / 2;

      //     y = x * (by - ay) / bx - radius
      //  && y = x * qy / qx
      //  => x * qy / qx = x * (by - ay) / bx + radius
      // <=> x = (qx * bx * -radius) / (qy * bx - qx * by + qx * ay)
      var ix = (qx * bx * -radius) / (qy * bx - qx * by + qx * ay);
      factor = ix / qx;
    }

    for (var i = 0; i < rays; i++) {
      to = segments[(i + 1) % rays];
      var fromX = from[1], fromY = from[2],
          toX = to[1], toY = to[2];
      starSegments.push(
        ['lineTo', (fromX + toX) / 2 * factor, (fromY + toY) / 2 * factor],
        to
      );

      from = to;
    }

    to[0] = 'closePath';
    to.length = 1;

    this.segments(starSegments);

  };

  return Star;

});
