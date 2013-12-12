define([
  'bonsai/point'
], function(Point) {
  qc.setTestGroupName('point');

  var numGen = qc.generator.number;

  function pointGenerator() {
    return {
      func:function(size) {
        return new Point(qc.getInteger(size), qc.getInteger(size));
      }
    };
  }

  qc.declare('new Point()', [numGen.integers(), numGen.integers()],
    function(testCase, x, y) {
      var point = new Point(x, y);
      testCase.assert(point.x == x);
      testCase.assert(point.y == y);
    }
  );

  qc.declare('add', [pointGenerator(), pointGenerator()],
    function(testCase, p1, p2) {
      var aClone = p1.clone();
      aClone.x += p2.x;
      aClone.y += p2.y;
      p1.add(p2);
      testCase.assert(p1.x==aClone.x);
      testCase.assert(p1.y==aClone.y);
    }
  );

  qc.declare('subtract', [pointGenerator(), pointGenerator()],
    function(testCase, p1, p2) {
      var aClone = p1.clone();
      aClone.x -= p2.x;
      aClone.y -= p2.y;
      p1.subtract(p2);
      testCase.assert(p1.x==aClone.x);
      testCase.assert(p1.y==aClone.y);
    }
  );

  qc.declare('add+subtract', [pointGenerator(), pointGenerator()],
    function(testCase, p1, p2) {
      var x = p1.x;
      var y = p1.y;
      p1.add(p2).subtract(p2);
      testCase.assert(p1.x == x);
      testCase.assert(p1.y == y);
    }
  );

  qc.declare('equals()==true', [numGen.integers(), numGen.integers()],
    function(testCase, x, y) {
      var p1 = new Point(x, y);
      var p2 = new Point(x, y);
      testCase.assert(p1.equals(p2));
      testCase.assert(p2.equals(p1));
    }
  );

  qc.declare('equals()==false', [pointGenerator(), pointGenerator()],
    function(testCase, p1, p2) {
      testCase.guard(!(p1.x==p2.x && p1.y==p2.y)); // Points with same x and y are dismissed.
      testCase.assert(!p1.equals(p2));
      testCase.assert(!p2.equals(p1));
    }
  );

  qc.declare('offset', [pointGenerator(), numGen.integers(), numGen.integers()],
    function(testCase, point, offsetX, offsetY) {
      var x = point.x;
      var y = point.y;
      point.offset(offsetX, offsetY);
      testCase.assert(point.x == x+offsetX);
      testCase.assert(point.y == y+offsetY);
    }
  );

  qc.declare('offset.offset should be original', [pointGenerator(), numGen.integers(), numGen.integers()],
    function(testCase, point, offsetX, offsetY) {
      var x = point.x;
      var y = point.y;
      point.offset(offsetX, offsetY).offset(-offsetX, -offsetY);
      testCase.assert(point.x == x);
      testCase.assert(point.y == y);
    }
  );

  qc.declare('distance', [pointGenerator(), pointGenerator()],
    function(testCase, p1, p2) { // Is this test good enough? Dont want to implement the complete algo here again, seems pointless imho.

      testCase.assert(p1.distance(p2) == p2.distance(p1));
    }
  );
});
