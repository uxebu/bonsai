define([
  'bonsai/runner/matrix',

  './goog.math.Matrix.js' // An independent implementation -- creates global.Matrix
], function(Matrix) {
  qc.setTestGroupName('matrix');

  function matrixGenerator(spread) {
    return {
      func: function() {
        var m = {};
        ['a', 'b', 'c', 'd', 'ty', 'tx'].forEach(function(key) {
          m[key] = qc.getFloat(spread);
        }, m);
        return m;
      }
    };
  }

  var gen = qc.generator;
  var numGen = qc.generator.number;
  var scaleGenerator = gen.chooseGenerator(numGen.floatRanges(-1, 1), numGen.floatRanges(-1000, 1000));

  function radGenerator(multiplier, onlyPositive) {
    return {
      func: function() {
        return Math.PI * multiplier *
          (onlyPositive ? Math.random() : Math.random() * 2 - 1);
      }
    };
  }

  function is(a, b) {
    return a === b;
  }
  function equals(a, b) {
    if (typeof a === 'object' && typeof b === 'object') {
      return Object.keys(a).every(function(key) {
        return equals(a[key], b[key]);
      });
    }
    return a == b;
  }

  function matrixEquals(m, n, tolerance) {
    var abs = Math.abs;
    return ['a', 'b', 'c', 'd', 'tx', 'ty'].
      every(function(key) {
        return abs(m[key] - n[key]) <= (tolerance || 0);
      });
  }

  function toMatrix(m) {
    return new Matrix(m.a, m.b, m.c, m.d, m.tx, m.ty);
  }

  function toGoogleMatrix(m) {
    return new goog.math.Matrix([
      [m.a,  m.b,  0],
      [m.c,  m.d,  0],
      [m.tx, m.ty, 1]
    ]);
  }

  function fromGoogleMatrix(m) {
    var a = m.toArray();
    return {
      a: a[0][0],
      b: a[0][1],
      c: a[1][0],
      d: a[1][1],
      tx: a[2][0],
      ty: a[2][1]
    };
  }

  var IDENTITY_MATRIX = {a:1, b: 0, c: 0, d: 1, tx: 0, ty: 0};

  var counts = {};
  var ratio = 5/100; // At most every 5th is allowed to fail.
  function assertMost(propName, testCase, result) {
    if (typeof counts[propName]=='undefined') {
      counts[propName] = {passes:0, failed:0};
    }
    var c = counts[propName];
    if (result) {
      c.passes++;
    } else {
      c.failed++;
    }
    testCase.assert(c.failed/c.passes < ratio);
  }

  qc.declare(
    'it should instantiate correctly',
    [matrixGenerator(10)],
    function(testCase, m) {
      var matrix = toMatrix(m);
      testCase.assert(equals(matrix, m));
    }
  );

  qc.declare(
    'it should `concat()` two matrices correctly',
    [matrixGenerator(10), matrixGenerator(10)],
    function(testCase, m, n) {

      var matrix = toMatrix(m);
      var refMatrix = toGoogleMatrix(matrix);

      testCase.assert(equals(
        matrix.concat(toMatrix(n)),
        fromGoogleMatrix(refMatrix.multiply(toGoogleMatrix(n)))
      ));
    }
  );

  qc.declare(
    '`identify()` should reset each matrix to identity',
    [matrixGenerator(10)],
    function(testCase, m) {
      var matrix = toMatrix(m).identify();
      testCase.assert(equals(matrix, IDENTITY_MATRIX));
    }
  );

  qc.declare(
    '`invert()` should invert a matrix',
    [matrixGenerator(10)],
    function(testCase, m) {
      var matrix = toMatrix(m);
      var m1 = matrix.invert();
      var m2 = fromGoogleMatrix(toGoogleMatrix(m).getInverse());
      assertMost(this.name, testCase, matrixEquals(m1, m2, 1e-10));
    }
  );

  qc.declare(
    '`invert().invert()` should be the original',
    [matrixGenerator(10)],
    function(testCase, m) {
      var matrix = toMatrix(m);
      var m1 = matrix.invert().invert();
      testCase.assert(matrixEquals(matrix, m1, 1e-10));
    }
  );

  qc.declare(
    'A matrix concated with itself `invert()`ed should be identity',
    [matrixGenerator(10)],
    function(testCase, m) {
      var matrix = toMatrix(m);
      var inversion = matrix.clone().invert();
      assertMost(this.name, testCase, matrixEquals(
        matrix.concat(inversion),
        IDENTITY_MATRIX,
        1e-11
      ));
    }
  );

  qc.declare(
    '`rotate()` should apply the rotation correctly',
    [matrixGenerator(10), radGenerator(8)],
    function(testCase, m, r) {
      var matrix = toMatrix(m).rotate(r);
      var cos = Math.cos(r), sin = Math.sin(r);

      var refMatrix = toGoogleMatrix(m);
      var rotationMatrix = toGoogleMatrix({a: cos, b: sin, c: -sin, d: cos, tx: 0, ty: 0});

      testCase.assert(matrixEquals(
        matrix,
        fromGoogleMatrix(refMatrix.multiply(rotationMatrix)),
        1e-11
      ));
    }
  );

  qc.declare(
    '`scale()` should apply the scale correctly',
    [matrixGenerator(10), scaleGenerator, scaleGenerator],
    function(testCase, m, x, y) {
      var matrix = toMatrix(m).scale(x, y);

      var refMatrix = toGoogleMatrix(m);
      var scaleMatrix = toGoogleMatrix({a: x, b: 0, c: 0, d: y, tx: 0, ty: 0});

      testCase.assert(matrixEquals(
        matrix,
        fromGoogleMatrix(refMatrix.multiply(scaleMatrix))
      ));
    }
  );

  qc.declare(
    '`createBox()` should work like calling identify(), rotation(), scale() ' +
    'and translate() in succession',
    [
      scaleGenerator,
      scaleGenerator,
      radGenerator(10),
      qc.generator.number.integerRanges(-1000, 1000),
      qc.generator.number.integerRanges(-1000, 1000)
    ],
    function(testCase, scaleX, scaleY, rotation, tx, ty) {
      var matrix = new Matrix().createBox(scaleX, scaleY, rotation, tx, ty);
      var refMatrix = new Matrix().
        identify().
        rotate(rotation).
        scale(scaleX, scaleY).
        translate(tx, ty);

      assertMost(this.name, testCase, equals(matrix, refMatrix));
    }
  );
});
