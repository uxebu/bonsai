define(['./special_path', '../../tools'], function(SpecialPath, tools) {
  'use strict';

  /**
   * Creates an ellipse
   *
   * @constructor
   * @name Ellipse
   * @memberOf module:path
   * @extends module:path.SpecialPath
   * @param {Number} x The x coordinate of the center of the ellipse
   * @param {Number} y The y coordinate of the center of the ellipse
   * @param {Number} radiusX The x (horizonal) radius
   * @param {Number} radiusY The y (vertical) radius
   */
  function Ellipse(x, y, radiusX, radiusY) {

    SpecialPath.call(this, {
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
  var proto = Ellipse.prototype = Object.create(SpecialPath.prototype);

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
