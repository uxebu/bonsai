define([
  './path',
  './special_attr_path',
  '../../tools'
], function(Path, SpecialAttrPath, tools) {
  'use strict';

  Path.rect = function(x, y, width, height, cornerRadius) {
    return new Path(new Rect(x, y, width, height, cornerRadius).segments()).attr({
      x: x,
      y: y
    });
  };

  /**
   * Creates a Rectangle shape
   *
   * @constructor
   * @name Rect
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The x position of the rect
   * @param {Number} y The y position of the rect
   * @param {Number} width The width of the rect
   * @param {Number} height The height of the rect
   * @param {Number|Array} cornerRadius rounded corner radius or an array of radiuses
   *  for each corner, in the order top-left, top-right, bottom-right, bottom-left
   */
  function Rect(x, y, width, height, cornerRadius) {

    SpecialAttrPath.call(this, {
      height: 0,
      width: 0,
      cornerRadius: 0
    });

    this.attr({
      x: x,
      y: y,
      width: width,
      height: height,
      cornerRadius: cornerRadius,
      origin: {
        x: width / 2,
        y: height / 2
      }
    });

  }

  /** @lends module:path.Rect.prototype **/
  var proto = Rect.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Rect's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var attr = this._attributes,
        x = attr.x,
        y = attr.y,
        width = attr.width,
        height = attr.height,
        radius = attr.cornerRadius;

    var bottomLeftRadius,
        bottomRightRadius,
        topLeftRadius,
        topRightRadius;

    if (radius) {

      topLeftRadius = radius[0] || radius;
      topRightRadius = radius[1] || radius;
      bottomRightRadius = radius[2] || radius;
      bottomLeftRadius = radius[3] || radius;

      this
        .moveTo(0, topLeftRadius)
        .arcBy(topLeftRadius, topLeftRadius, 0, 0, 1, topLeftRadius, -topLeftRadius)
        .lineBy(width - topLeftRadius - topRightRadius, 0)
        .arcBy(topRightRadius, topRightRadius, 0, 0, 1, topRightRadius, topRightRadius)
        .lineBy(0, height - topRightRadius - bottomRightRadius)
        .arcBy(bottomRightRadius, bottomRightRadius, 0, 0, 1, -bottomRightRadius, bottomRightRadius)
        .lineBy(-(width - bottomLeftRadius - bottomRightRadius), 0)
        .arcBy(bottomLeftRadius, bottomLeftRadius, 0, 0, 1, -bottomLeftRadius, -bottomLeftRadius);
    } else {
      this
        .moveTo(0, 0)
        .lineBy(width, 0)
        .lineBy(0, height)
        .lineBy(-width, 0);
    }

    this.closePath();

  };

  return Rect;

});
