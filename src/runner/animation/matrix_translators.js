define(['../matrix'], function(Matrix) {
  'use strict';

  /**
   * Animation translations for matrices
   * @ignore
   */

  return {
    matrix: {
      toNumeric: function(matrix) {
        console.log(arguments);
        this.animatedMatrix = new Matrix;
        return [matrix.a, matrix.b, matrix.c, matrix.d, matrix.tc, matrix.ty];
      },
      toUnique: function(values) {
        var m = this.animatedMatrix;
        m.a = values[0];
        m.b = values[1];
        m.c = values[2];
        m.d = values[3];
        m.tx = values[4];
        m.ty = values[5];
      }
    }
  };
});
