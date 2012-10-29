define([
  './path',
  './special_attr_path',
  '../../tools'
], function(Path, SpecialAttrPath, tools) {
  'use strict';

  Path.arc = function(x, y, radius, startAngle, endAngle, antiClockwise) {
    return new Path(
      new Arc(
        x, y, radius, startAngle, endAngle, antiClockwise
      ).segments()
    ).attr({
      x: x,
      y: y
    });
  };

  var PI = Math.PI;
  var PI2 = PI*2;
  var sin = Math.sin;
  var cos = Math.cos;
  var abs = Math.abs;

  /**
   * Creates an Arc
   *
   * @constructor
   * @name Arc
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The x coordinate of the center of the circle
   * @param {Number} y The y coordinate of the center of the circle
   * @param {Number} radius The arc's circle's radius
   * @param {Number} startAngle Start angle (radians) of the arc
   * @param {Number} endAngle End angle (radians) of the arc
   * @param {Boolean} [antiClockwise=false] Whether or not to progress in an
   *  anti-clockwise fashion
   */
  function Arc(x, y, radius, startAngle, endAngle, antiClockwise) {

    SpecialAttrPath.call(this, {
      radius: 0,
      startAngle: 0,
      endAngle: 0,
      antiClockwise: false
    });

    this.attr({
      x: x,
      y: y,
      radius: radius,
      startAngle: startAngle,
      endAngle: endAngle,
      antiClockwise: antiClockwise
    });

  }

  /** @lends module:path.Arc.prototype **/
  var proto = Arc.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Arc's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var attr = this._attributes,
        radius = attr.radius,
        _startAngle = attr.startAngle,
        _endAngle = attr.endAngle,
        antiClockwise = attr.antiClockwise;

    antiClockwise = !!antiClockwise;

    var startX, startY, endX, endY;
    var startAngle = (antiClockwise) ? _endAngle : _startAngle;
    var endAngle = (antiClockwise) ? PI2 - _startAngle : _endAngle;
    var diffAngle = abs(endAngle - startAngle);

    startX = radius * cos(startAngle);
    startY = radius * sin(startAngle);
    if (diffAngle < PI2) {
      endX = radius * cos(endAngle);
      endY = radius * sin(endAngle);
    } else { // angles differ by more than 2*PI: draw a full circle
      endX = startX;
      endY = startY - .0001;
    }

    return this.moveTo(startX, startY)
      .arcTo(radius, radius, 0, (diffAngle < PI) ? 0 : 1, 1, endX, endY);

  };

  return Arc;

});
