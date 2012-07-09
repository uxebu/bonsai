/**
 * This module contains the Filter class.
 *
 * @exports filter
 */
define([
  './base_filter',
  '../../tools',
  '../../color'
], function(filter, tools, color) {
  'use strict';

  /**
   * All builtin bonsai filters are implemented here.
   *
   * They represent the filter shorthand functions as defined in
   * the CSS Filters draft:
   *
   * @see https://dvcs.w3.org/hg/FXTF/raw-file/tip/filters/index.html#FilterFunction
   *
   */

  /**
   * Blur filter.
   *
   * @constructor
   *
   * @param {mixed} blurRadius, number, 0 - Infinity. If omitted,
   *    defaultValue is 1.
   *
   * @example
   *    var f = new filter.Blur();
   *    var f = new filter.Blur(1);
   *
   */
  filter.Blur = function(blurRadius) {
    return new filter.BaseFilter('blur', blurRadius, 1);
  };
  filter.createFactory('blur', filter.Blur);

  /**
   * Brightness filter.
   *
   * @constructor
   *
   * @param {mixed} brightnessFactor, number, 0 - Infinity. If omitted,
   *    defaultValue is 2.
   *
   * @example
   *    var f = new filter.Brightness();
   *    var f = new filter.Brightness(2);
   *
   */
  filter.Brightness = function(brightnessFactor) {
    return new filter.BaseFilter('brightness', brightnessFactor, 2);
  };
  filter.createFactory('brightness', filter.Brightness);

  /**
   * ColorMatrix filter.
   *
   * @constructor
   *
   * @param {array} colorMatrix, 5×5 matrix. If omitted,
   *    defaultValue is a 5×5 identity matrix.
   *
   * @example
   *    var f = new filter.ColorMatrix();
   *    var matrix = [
   *       1, 1, 1, 1, 0,
   *       0, 1, 1, 1, 0,
   *       0, 1, 1, 0, 0,
   *       0, 0, 0, 1, 0
   *     ];
   *    var f = new filter.ColorMatrix(matrix);
   *
   */
  filter.ColorMatrix = function(matrix) {

    var identityMatrix = [
      1, 0, 0, 0, 0,
      0, 1, 0, 0, 0,
      0, 0, 1, 0, 0,
      0, 0, 0, 1, 0
    ];

    return new filter.BaseFilter('colorMatrix', matrix, identityMatrix);
  };
  filter.createFactory('colorMatrix', filter.ColorMatrix);

  /**
   * Contrast filter.
   *
   * @constructor
   *
   * @param {mixed} contrastValue, number, 0 - Infinity. If omitted,
   *    defaultValue is 2.
   *
   * @example
   *    var f = new filter.Contrast();
   *    var f = new filter.Contrast(2);
   *
   */
  filter.Contrast = function(contrastValue) {
    return new filter.BaseFilter('contrast', contrastValue, 2);
  };
  filter.createFactory('contrast', filter.Contrast);

  /**
   * DropShadow filter.
   *
   * @constructor
   *
   * @param {mixed} shadowArgs, array, consists of:
   *    offsetX, offsetY, blurRadius, color. If omitted,
   *    defaultValue is [0, 0, 0, 0x000000FF].
   *
   * @example
   *    var f = new filter.DropShadow();
   *    var f = new filter.DropShadow([0, 0, 0, 0x000000FF]);
   *
   */
  filter.DropShadow = function(offsetX, offsetY, blur, blurColor) {

    // Parse color
    blurColor = color.parse(blurColor, 0);

    if (/deg$/.test(offsetX)) {

      var rad = Math.PI / 180 * parseFloat(offsetX),
          dist = offsetY;

      return new filter.BaseFilter(
        'dropShadowByAngle',
        [
          rad,
          dist,
          blur,
          blurColor
        ],
        [0, 0, 0, 0x000000FF]
      );
    }

    return new filter.BaseFilter(
      'dropShadowByOffset',
      [offsetX, offsetY, blur, blurColor],
      [0, 0, 0, 0x000000FF]
    );
  };
  filter.createFactory('dropShadow', filter.DropShadow);

  /**
   * Grayscale filter.
   *
   * @constructor
   *
   * @param {mixed} scaleFactor, number, 0 - 1. If omitted,
   *    defaultValue is 1.
   *
   * @example
   *    var f = new filter.Grayscale();
   *    var f = new filter.Grayscale(1);
   *
   */
  filter.Grayscale = function(scaleFactor) {
    return new filter.BaseFilter('grayscale', scaleFactor, 1);
  };
  filter.createFactory('grayscale', filter.Grayscale);

  /**
   * HueRotate filter.
   *
   * @constructor
   *
   * @param {mixed} rotationDegree, number, 0 - 360. If omitted,
   *    defaultValue is 90.
   *
   * @example
   *    var f = new filter.HueRotate();
   *    var f = new filter.HueRotate(90);
   *
   */
  filter.HueRotate = function(rotationDegree) {
    return new filter.BaseFilter('hueRotate', rotationDegree, 90);
  };
  filter.createFactory('hueRotate', filter.HueRotate);

/**
   * Invert filter.
   *
   * @constructor
   *
   * @param {mixed} inversionValue, number, 0 - 1. If omitted,
   *    defaultValue is 1.
   *
   * @example
   *    var f = new filter.Invert();
   *    var f = new filter.Inver(1);
   *
   */
  filter.Invert = function(inversionValue) {
    return new filter.BaseFilter('invert', inversionValue, 1);
  };
  filter.createFactory('invert', filter.Invert);

  /**
   * Opacity filter.
   *
   * @constructor
   *
   * @param {mixed} opacityValue, number, 0 - 1. If omitted,
   *    defaultValue is .5.
   *
   * @example
   *    var f = new filter.Opacity();
   *    var f = new filter.Opacity(.5);
   *
   */
  filter.Opacity = function(opacityValue) {
    return new filter.BaseFilter('opacity', opacityValue, .5);
  };
  filter.createFactory('opacity', filter.Opacity);

  /**
   * Saturate filter.
   *
   * @constructor
   *
   * @param {mixed} saturationValue, number, 0 - Infinity. If omitted,
   *    defaultValue is 5.
   *
   * @example
   *    var f = new filter.Saturate();
   *    var f = new filter.Saturate(5);
   *
   */
  filter.Saturate = function(saturationValue) {
    return new filter.BaseFilter('saturate', saturationValue, 5);
  };
  filter.createFactory('saturate', filter.Saturate);

  /**
   * Sepia filter.
   *
   * @constructor
   *
   * @param {mixed} sepiaFactor, number, 0 - 1. If omitted,
   *    defaultValue is 1.
   *
   * @example
   *    var f = new filter.Sepia();
   *    var f = new filter.Sepia(1);
   *
   */
  filter.Sepia = function(sepiaFactor) {
    return new filter.BaseFilter('sepia', sepiaFactor, 1);
  };
  filter.createFactory('sepia', filter.Sepia);

  return filter;
});
