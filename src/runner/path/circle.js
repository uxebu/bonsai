define([
  './path',
  './special_attr_path',
  '../../tools'
], function(Path, SpecialAttrPath, tools) {
  'use strict';

  Path.circle = function(x, y, radius) {
    return new Path(new Circle(x, y, radius).segments()).attr({
      x: x,
      y: y
    });
  };

  /**
   * Creates an Circle
   *
   * @constructor
   * @name Circle
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The x coordinate of the center of the circle
   * @param {Number} y The y coordinate of the center of the circle
   * @param {Number} radius The circle's radius
   */
  function Circle(x, y, radius) {

    SpecialAttrPath.call(this, {
      radius: 0
    });

    this.attr({
      x: x,
      y: y,
      radius: radius
    });

  }

  /** @lends module:path.Circle.prototype **/
  var proto = Circle.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Circle's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var radius = this._attributes.radius;

    this
      .moveTo(radius, 0)
      .arcTo(radius, radius, 0, 0, 0, -radius, 0)
      .arcTo(radius, radius, 0, 0, 0, radius, 0);

  };

  return Circle;

});
