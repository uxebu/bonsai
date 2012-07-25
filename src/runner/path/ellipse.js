define([
  './path',
  './special_attr_path',
  '../../tools'
], function(Path, SpecialAttrPath, tools) {
  'use strict';

  Path.ellipse = function(x, y, radiusX, radiusY) {
    return new Path(new Ellipse(x, y, radiusX, radiusY).segments()).attr({
      x: x,
      y: y
    });
  };

  /**
   * Creates an ellipse
   *
   * @constructor
   * @name Ellipse
   * @memberOf module:path
   * @extends module:path.SpecialAttrPath
   * @param {Number} x The x coordinate of the center of the ellipse
   * @param {Number} y The y coordinate of the center of the ellipse
   * @param {Number} radiusX The x (horizonal) radius
   * @param {Number} radiusY The y (vertical) radius
   */
  function Ellipse(x, y, radiusX, radiusY) {

    SpecialAttrPath.call(this, {
      radiusX: 0,
      radiusY: 0
    });

    this.attr({
      x: x,
      y: y,
      radiusX: radiusX,
      radiusY: radiusY
    });

  }

  /** @lends module:path.Ellipse.prototype **/
  var proto = Ellipse.prototype = Object.create(SpecialAttrPath.prototype);

  /**
   * Generates shape as per Ellipse's properties in _attributes
   *
   * @private
   */
  proto._make = function() {

    var attr = this._attributes,
        radiusX = attr.radiusX,
        radiusY = attr.radiusY;

    this
      .moveTo(radiusX, 0)
      .arcTo(radiusX, radiusY, 0, 0, 0, -radiusX, 0)
      .arcTo(radiusX, radiusY, 0, 0, 0, radiusX, 0);

  };

  return Ellipse;

});
