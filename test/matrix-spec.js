define([
  'bonsai/runner/matrix'
], function(Matrix) {
  
  describe('Matrix', function(){
    
    it('should set a, b, c, d, tx, ty defaults for new Matrix()', function(){
      var matrix = new Matrix();
      expect(matrix.a).toBe(1);
      expect(matrix.b).toBe(0);
      expect(matrix.c).toBe(0);
      expect(matrix.d).toBe(1);
      expect(matrix.tx).toBe(0);
      expect(matrix.ty).toBe(0);
    });

    // Contract tests for transwf
    it('should set a, b, c, d, tx, ty defaults for undefineds', function(){
      var matrix = new Matrix(undefined, undefined, undefined, undefined, undefined, undefined);
      expect(matrix.a).toBe(1);
      expect(matrix.b).toBe(0);
      expect(matrix.c).toBe(0);
      expect(matrix.d).toBe(1);
      expect(matrix.tx).toBe(0);
      expect(matrix.ty).toBe(0);
    });

    it('should set a, b, c, d, tx, ty defaults for nulls', function(){
      var matrix = new Matrix(null, null, null, null, null, null);
      expect(matrix.a).toBe(1);
      expect(matrix.b).toBe(0);
      expect(matrix.c).toBe(0);
      expect(matrix.d).toBe(1);
      expect(matrix.tx).toBe(0);
      expect(matrix.ty).toBe(0);
    });

    it('should set a, b, c, d, tx, ty for an array', function(){
      var matrix = new Matrix([4,2,1,6,5,4]);
      expect(matrix.a).toBe(4);
      expect(matrix.b).toBe(2);
      expect(matrix.c).toBe(1);
      expect(matrix.d).toBe(6);
      expect(matrix.tx).toBe(5);
      expect(matrix.ty).toBe(4);
    });

  });

  describe('Matrix.fromString', function () {

    it('should return a new Matrix with a, b, c, d, tx, ty from `matrix(a,b,c,d,e,f)`', function(){
      var matrix = Matrix.fromString('4,2,1,6,5,4');
      expect(matrix.a).toBe(4);
      expect(matrix.b).toBe(2);
      expect(matrix.c).toBe(1);
      expect(matrix.d).toBe(6);
      expect(matrix.tx).toBe(5);
      expect(matrix.ty).toBe(4);
    });

    it('should return a new Matrix with a, b, c, d, tx, ty for a string of `"a, b, c, d, tx, ty"`', function(){
      var matrix = Matrix.fromString('matrix(4,2,1,6,5,4)');
      expect(matrix.a).toBe(4);
      expect(matrix.b).toBe(2);
      expect(matrix.c).toBe(1);
      expect(matrix.d).toBe(6);
      expect(matrix.tx).toBe(5);
      expect(matrix.ty).toBe(4);
    });

    it('should return an instance of a Matrix', function(){
      var matrix = Matrix.fromString('matrix(4,2,1,6,5,4)');
      expect(matrix).toBeInstanceOf(Matrix);
    })

  })
  
});
