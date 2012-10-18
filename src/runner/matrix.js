define([
  '../point',
  '../tools'
], function(Point, tools) {
  'use strict';

  var cos = Math.cos, sin = Math.sin;

  /**
   * The Matrix class.
   *
   * @constructor
   * @name Matrix
   *
   * @param {number|array} a Horizontal/x scale or array of a, b, c, d, tx, ty
   * @param {number} b Vertical/y skew
   * @param {number} c Horizontal/x skew
   * @param {number} d Vertical/y scale
   * @param {number} tx Horizontal/x translation
   * @param {number} ty Vertical/y translation
   */
  function Matrix(a, b, c, d, tx, ty) {
    if (tools.isArray(a)) {
      return Matrix.apply(this, a);
    }

    this.a = a != null ? a : 1;
    this.b = b || 0;
    this.c = c || 0;
    this.d = d != null ? d : 1;
    this.tx = tx || 0;
    this.ty = ty || 0;
  }

  Matrix.prototype = /** @lends Matrix.prototype */ {
    /**
     * Returns a clone of the matrix
     *
     * @returns {Matrix}
     */
    clone: function() {
      return new Matrix(this.a, this.b, this.c, this.d, this.tx, this.ty);
    },

    /**
     * Concatenates a matrix with the current matrix.
     *
     * Effectively combines the geometric effects of the two matrices.
     *
     * @param {Matrix} m
     * @returns {Matrix} The instance
     */
    concat: function(m) {
      var a = this.a;
      var b = this.b;
      var c = this.c;
      var d = this.d;
      var tx = this.tx;
      var ty = this.ty;

      this.a = a * m.a + b * m.c;
      this.b = a * m.b + b * m.d;
      this.c = c * m.a + d * m.c;
      this.d = c * m.b + d * m.d;
      this.tx = tx * m.a + ty * m.c + m.tx;
      this.ty = tx * m.b + ty * m.d + m.ty;

      return this;
    },

    /**
     * Applies parameters for scaling, rotation, and translation.
     *
     * Using the createBox() method lets you obtain the same matrix as you
     * would if you applied the identity(), rotate(), scale(), and translate()
     * methods in succession.
     *
     * @param {number} scaleX The horizontal scale
     * @param {number} scaleY The vertical scale
     * @param {number} rotation The rotation in radians
     * @param {number} tx The horizontal translation
     * @param {number} tx The vertical translation
     * @returns {Matrix} The instance
     */
    createBox: function(scaleX, scaleY, rotation, tx, ty) {
      return this.
        identify().
        rotate(rotation).
        scale(scaleX, scaleY).
        translate(tx, ty);
    },

// ACTIONSCRIPT SPECIFIC
    //
    ///**
    // * Creates the specific style of matrix expected by the beginGradientFill()
    // * and strokeGradientStyle() methods of the Graphics class.
    // *
    // * Width and height are scaled to a scaleX/scaleY pair and the tx/ty values
    // * are offset by half the width and height.
    // *
    // * @param {number} width The width of the gradient box.
    // * @param {number} height The height of the gradient box.
    // * @param {number} [rotation=0] The amount to rotate, in radians.
    // * @param {number} [tx=0] The distance, in pixels, to translate to the right along the x axis. This value is offset by half of the width parameter.
    // * @param {number} [ty=0] The distance, in pixels, to translate down along the y axis. This value is offset by half of the height parameter.
    // */
    //createGradientBox: function(width, height, rotation, tx, ty) {
    //  return this.
    //    identify().
    //    rotate(rotation || 0).
    //    scale(width / 1638.4, height / 1638.4).
    //    translate((tx || 0) + width / 2, (ty || 0) + height / 2);
    //},

    /**
     * Given a point in the pretransform coordinate space, returns the
     * coordinates of that point after the transformation occurs.
     *
     * Unlike the standard transformation applied using the transformPoint()
     * method, the deltaTransformPoint() method's transformation does not
     * consider the translation parameters tx and ty.
     *
     * @param {Point} point The point to transform
     * @returns {Point}
     */
    deltaTransformPoint: function(point) {
      return new Point(
        this.a * point.x + this.c * point.y,
        this.b * point.x + this.d * point.y
      );
    },

    /**
     * Sets each matrix property to a value that causes a null transformation.
     *
     * An object transformed by applying an identity matrix will be identical
     * to the original.
     *
     * @returns {Matrix} The instance
     */
    identify: function() {
      this.a = this.d = 1;
      this.b = this.c = this.tx = this.ty = 0;
      return this;
    },

    /**
     * Performs the opposite transformation of the original matrix.
     *
     * You can apply an inverted matrix to an object to undo the transformation
     * performed when applying the original matrix.
     *
     * @returns {Matrix} The instance
     */
    invert: function() {
      var determinant = this.a * this.d - this.b * this.c;
      var a = this.a,
          b = this.b,
          c = this.c,
          d = this.d,
          tx = this.tx,
          ty = this.ty;

      this.a = d / determinant;
      this.b = -b / determinant;
      this.c = -c / determinant;
      this.d = a / determinant;
      this.tx = (c * ty - d * tx) / determinant;
      this.ty = (b * tx - a * ty) / determinant;

      return this;
    },

    /**
     * Applies a rotation transformation to the Matrix object.
     *
     * @param {number} angle The rotation angle in radians.
     * @returns {Matrix} The instance
     */
    rotate: function(angle) {
      var c = cos(angle), s = sin(angle);
      return this.concat(new Matrix(c, s, -s, c, 0, 0));
    },

    /**
     * Applies a scaling transformation to the matrix.
     *
     * The x axis is multiplied by sx, and the y axis it is multiplied by sy.
     *
     * @param {number} sx Multiplier for the x axis
     * @param {number} sy Multiplier for the y axis
     * @returns {Matrix} The instance
     */
    scale: function(sx, sy) {
      this.a *= sx;
      this.b *= sy;
      this.c *= sx;
      this.d *= sy;
      this.tx *= sx;
      this.ty *= sy;

      return this;
    },

// ACTIONSCRIPT SPECIFIC
    //
    //toString: function() {
    //  return '(' + [
    //    'a=' + this.a, 'b=' + this.b,
    //    'c=' + this.c, 'd=' + this.d,
    //    'tx=' + this.tx, 'ty=' + this.ty
    //  ].join(', ') + ')';
    //},

    /**
     * Returns the result of applying the geometric transformation represented
     * by the Matrix object to the specified point.
     *
     * @param {Point} point The point to transform
     * @returns {Point}
     */
    transformPoint: function(point) {
      return new Point(
        this.a * point.x + this.c * point.y + this.tx,
        this.b * point.x + this.d * point.y + this.ty
      );
    },

    /**
     * Translates the matrix along the x and y axes.
     *
     * @param {number} x The translation along the x axis
     * @param {number} y The translation along the y axis
     * @returns {Matrix} The instance.
     */
    translate: function(x, y) {
      this.tx += x;
      this.ty += y;

      return this;
    }
  };

  /**
   * Creates a new Matrix from a matrix string: `'matrix(1,1,0,0,1,1)'`
   *
   * @param {string} matrixString The matrix string.
   * @returns {Matrix} The instance.
   */
  Matrix.fromString = function (matrixString) {
    return new Matrix(matrixString.match(/[^matrix(,)]+/g).map(Number));
  }

  return Matrix;
});
