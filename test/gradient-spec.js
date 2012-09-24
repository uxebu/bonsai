define([
  'bonsai/runner/gradient',
  'bonsai/runner/matrix',
  'bonsai/color'
], function(gradient, Matrix, color) {

  describe('gradient', function() {
    
    it('has a factory', function() {
      expect(gradient.linear(0, [])).toBeInstanceOf(gradient.LinearGradient);
    });

    describe('gradient.linear (gradient.LinearGradient)', function() {
      it('Returns object with processed passed arguments', function() {

        var m = new Matrix(1, 0, 0, 1, 0, 0),
            g = gradient.linear(0, ['red', ['yellow', 70]], 1);

        expect(g).toEqual({
          type: 'linear-gradient',
          direction: 0,
          stops: [[+color('red'), 0], [+color('yellow'), 70]],
          matrix: null,
          clone: gradient.LinearGradient.prototype.clone,
          units: 'boundingBox' // default
        });
        
      });
      it('converts word-directions to degrees', function() {
        expect(gradient.linear('top', []).direction).toBe(0);
        expect(gradient.linear('right', []).direction).toBe(90);
        expect(gradient.linear('bottom', []).direction).toBe(180);
        expect(gradient.linear('left', []).direction).toBe(270);
        expect(gradient.linear('top right', []).direction).toBe(45);
        expect(gradient.linear('top left', []).direction).toBe(315);
        expect(gradient.linear('bottom right', []).direction).toBe(135);
        expect(gradient.linear('bottom left', []).direction).toBe(225);
      });
      it('stores stops as array', function() {
        expect(gradient.linear(0, ['red', 'blue', 'pink']).stops.length).toBe(3);
      });
      it('converts colors in color-stop to 32-bit reprs', function() {
        expect(gradient.linear(0, ['red']).stops[0][0]).toBe(color.parse('red'));
        expect(gradient.linear(0, ['#000']).stops[0][0]).toBe(color.parse('#000'));
        expect(gradient.linear(0, ['rgb(1,9,6)']).stops[0][0]).toBe(color.parse('rgb(1,9,6)'));
        expect(gradient.linear(0, ['#F00F02']).stops[0][0]).toBe(color.parse('#F00F02'));
      });
      it('allows stops argument to be object', function() {
        var g = gradient.linear('right', {
          0: 'red',
          45: 'green',
          60: 'rgba(0,0,0,0)',
          100: 'white'
        });
        expect(g.stops).toEqual([
          [color.parse('red'), 0],
          [color.parse('green'), 45],
          [color.parse('rgba(0,0,0,0)'), 60],
          [color.parse('white'), 100]
        ]);
        g = gradient.linear('right', {
          // Order changed (& % unit added):
          '0%': 'red',
          '100%': 'white',
          '60%': 'rgba(0,0,0,0)',
          '45%': 'green'
        });
        // Should still be in the right order:
        expect(g.stops).toEqual([
          [color.parse('red'), 0],
          [color.parse('green'), 45],
          [color.parse('rgba(0,0,0,0)'), 60],
          [color.parse('white'), 100]
        ]);
      });
      it('interpolates undefined stop offsets', function() {
        expect(
          gradient.linear(0, ['red','blue']).stops
        ).toEqual(
          [[+color('red'),0],[+color('blue'),100]]
        );
        expect(
          gradient.linear(0, ['red','blue','green']).stops
        ).toEqual(
          [[+color('red'),0],[+color('blue'),50],[+color('green'),100]]
        );
        expect(
          // 1,2,3 are colors.
          gradient.linear(0, [1,2,3,4,5]).stops
        ).toEqual(
          [[1,0],[2,25],[3,50],[4,75],[5,100]]
        );
      });
    });

    describe('gradient.radial (gradient.RadialGradient)', function() {
      it('Returns object with processed passed arguments', function() {

        var m = new Matrix(1, 0, 0, 1, 0.5, 0.5), 
            g = gradient.radial(['red', ['yellow', 70]], 266, 50, 50, 1);

        expect(g).toEqual({
          type: 'radial-gradient',
          stops: [[+color('red'), 0], [+color('yellow'), 70]],
          matrix: m,
          clone: gradient.RadialGradient.prototype.clone,
          radius: '266%',
          fx: 0,
          fy: 0,
          units: 'boundingBox' // default
        });
        
      });
      it('Has default radius of 50%', function() {
        expect(gradient.radial(['red']).radius).toBe('50%');
      });
      it('converts colors in color-stop to 32-bit reprs', function() {
        expect(gradient.radial(['red']).stops[0][0]).toBe(color.parse('red'));
        expect(gradient.radial(['#000']).stops[0][0]).toBe(color.parse('#000'));
        expect(gradient.radial(['rgb(1,9,6)']).stops[0][0]).toBe(color.parse('rgb(1,9,6)'));
        expect(gradient.radial(['#F00F02']).stops[0][0]).toBe(color.parse('#F00F02'));
      });
      it('interpolates undefined stop offsets', function() {
        expect(
          gradient.radial(['red','blue']).stops
        ).toEqual(
          [[+color('red'),0],[+color('blue'),100]]
        );
        expect(
          gradient.radial(['red','blue','green']).stops
        ).toEqual(
          [[+color('red'),0],[+color('blue'),50],[+color('green'),100]]
        );
        expect(
          // 1,2,3 are colors.
          gradient.radial([1,2,3,4,5]).stops
        ).toEqual(
          [[1,0],[2,25],[3,50],[4,75],[5,100]]
        );
      });
    });

    describe('gradient.advancedLinear', function() {

      it('Produces LinearGradient object', function() {
        var m = new Matrix(1, .3, .5, 1, 0, 0),
            g = gradient.advancedLinear(0, ['red', ['yellow', 70]], m, 1, 'userSpace');

        expect(g).toEqual({
          type: 'linear-gradient',
          direction: 0,
          stops: [[+color('red'), 0], [+color('yellow'), 70]],
          matrix: m,
          clone: gradient.LinearGradient.prototype.clone,
          units: 'userSpace' 
        });

      });

    });

    describe('gradient.advancedRadial', function() {

      it('Produces RadialGradient object', function() {
        var m = new Matrix(1, 0, 0, 1, 0, 0),
            g = gradient.advancedRadial(['red', ['yellow', 70]], '27%', m, 1, 'userSpace', 9, 20);

        expect(g).toEqual({
          type: 'radial-gradient',
          radius:'27%',
          stops: [[+color('red'), 0], [+color('yellow'), 70]],
          matrix: m,
          clone: gradient.RadialGradient.prototype.clone,
          units: 'userSpace',
          fx: 9,
          fy: 20
        });

      });
      
    });

  });

});
