define(['../matrix'], function(Matrix) {
  'use strict';

  /**
   * Animation translations for matrices
   * @ignore
   */

  return {
    matrix: {
      setupTo: function(values) {
        var matrix = values.matrix;
        values.matrix_a = matrix.a;
        values.matrix_b = matrix.b;
        values.matrix_c = matrix.c;
        values.matrix_d = matrix.d;
        values.matrix_tx = matrix.tx;
        values.matrix_ty = matrix.ty;
        this.animatedMatrix = new Matrix;
      },
      setupFrom: function(values) {
        var matrix = values.matrix;
        values.matrix_a = matrix.a;
        values.matrix_b = matrix.b;
        values.matrix_c = matrix.c;
        values.matrix_d = matrix.d;
        values.matrix_tx = matrix.tx;
        values.matrix_ty = matrix.ty;
        delete values.matrix;
      },
      step: function(values) {
        values.matrix = this.animatedMatrix;
        values.matrix.a = values.matrix_a;
        values.matrix.b = values.matrix_b;
        values.matrix.c = values.matrix_c;
        values.matrix.d = values.matrix_d;
        values.matrix.tx = values.matrix_tx;
        values.matrix.ty = values.matrix_ty;
        delete values.matrix_a;
        delete values.matrix_b;
        delete values.matrix_c;
        delete values.matrix_d;
        delete values.matrix_tx;
        delete values.matrix_ty;
      }
    }
  };
});
