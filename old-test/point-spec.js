define([
  'bonsai/point'
], function(Point) {

  var toString = {}.toString;

  describe('Point', function() {

    it('Constructs an object representing two points', function() {
      var x = 6,
          y = 17,
          point = new Point(x, y);
      expect(point.x).toBe(x);
      expect(point.y).toBe(y);
    });

    describe('add', function() {

      it('Adds points', function() {
        var a = new Point(125, 675),
            b = new Point(330, 910),
            aClone = a.clone();
        aClone.x += b.x;
        aClone.y += b.y;
        a.add(b);
        expect(a).toEqual(aClone);
      });
    });

    describe('subtract', function() {

      it('Subtracts points', function() {
        var a = new Point(125, 675),
            b = new Point(330, 910),
            aClone = a.clone();
        aClone.x -= b.x;
        aClone.y -= b.y;
        a.subtract(b);
        expect(a).toEqual(aClone);
      });
    });

    describe('divide', function() {

      it('Divides points by arg', function() {
        var a = new Point(125, 675);
            aClone = a.clone();
        aClone.x /= 4;
        aClone.y /= 4;
        a.divide(4);
        expect(a).toEqual(aClone);
      });
    });

    describe('multiply', function() {

      it('Multiplies points by arg', function() {
        var a = new Point(125, 675);
            aClone = a.clone();
        aClone.x *= 2.26;
        aClone.y *= 2.26;
        a.multiply(2.26);
        expect(a).toEqual(aClone);
      });
    });

    describe('equals', function() {

      it('Returns true if two points are equal', function() {
        var a = new Point(34, 97),
            b = new Point(34, 97);
        expect(a.equals(b)).toBe(true);
      });

      it('Returns false if two points are NOT equal', function() {
        var a = new Point(34, 97),
            c = new Point(65, 82),
            d = new Point(34, 99);
        expect(a.equals(c)).toBe(false);
        expect(a.equals(d)).toBe(false);
      });
    });

    describe('offset', function() {

      it('Offsets coords by the amounts specified', function() {
        var a = new Point(15, 99);
        a.offset(23, -5);
        expect(a.x).toBe(38);
        expect(a.y).toBe(94);
      });
    });

    describe('distance', function() {

      it('Returns the distance between two points', function() {
        var a = new Point(44, 66),
            b = new Point(55, 77),
            xDiff = a.x - b.x,
            yDiff = a.y - b.y,
            distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
        expect(a.distance(b)).toBe(distance);
      });
    });

    describe('angle', function() {

      it('Returns the radians between two points', function() {
        var a = new Point(0, 0),
            b = new Point(180, 180),
            radians = Math.atan2(0 - 180, 0 - 180);
        expect(a.angle(b)).toBe(radians);
      });

    });

    // Linear Interpolation between two points a and b
    describe('lerp', function() {
      it('it is a class method', function() {
        expect(toString.call(Point.lerp)).toEqual('[object Function]');
      });
      it('Returns a when f === 0', function() {
        var a = new Point(50,50);
        var b = new Point(100,100);
        var f = 0;
        expect(Point.lerp(a, b, f).x).toEqual(50);
        expect(Point.lerp(a, b, f).y).toEqual(50);
      });
      it('Returns b when f === 1', function() {
        var a = new Point(50,50);
        var b = new Point(100,100);
        var f = 1;
        expect(Point.lerp(a, b, f).x).toEqual(100);
        expect(Point.lerp(a, b, f).y).toEqual(100);
      });
      it('Returns x=75, y=75 when f === 0.5', function() {
        var a = new Point(50,50);
        var b = new Point(100,100);
        var f = 0.5;
        expect(Point.lerp(a, b, f).x).toEqual(75);
        expect(Point.lerp(a, b, f).y).toEqual(75);
      });
    });
  });

});
