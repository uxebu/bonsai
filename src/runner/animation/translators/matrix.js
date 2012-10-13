define(['../../matrix'], function(Matrix) {
  'use strict';

  /**
   * Animation translations for matrices
   * @ignore
   */

  return {
    matrix: {
      toNumeric: function(matrix) {
        this.animatedMatrix = new Matrix;
        return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty];
      },
      toAttr: function(numbers) {
        var m = this.animatedMatrix;
        m.a = numbers[0];
        m.b = numbers[1];
        m.c = numbers[2];
        m.d = numbers[3];
        m.tx = numbers[4];
        m.ty = numbers[5];
        return this.animatedMatrix;
      }
    }
  };
});
