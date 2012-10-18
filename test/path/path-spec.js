define([
  'bonsai/runner/path/path',
  'bonsai/runner/path/rect',
  'bonsai/runner/path/circle',
  'bonsai/runner/gradient',
  'bonsai/runner/bitmap',
  'bonsai/runner/matrix'
], function(Path, Rect, Circle, gradient, Bitmap, Matrix) {

  var precision = new Number(12);
  precision.PRECISION = +precision;

  var toString = {}.toString;
  var invalidParametersMap = [
    {
      descr: 'zero',
      input: 0
    },
    {
      descr: 'empty string',
      input: ''
    },
    {
      descr: 'null',
      input: null
    },
    {
      descr: 'undefined',
      input: undefined
    },
    {
      descr: 'empty array',
      input: []
    },
    {
      descr: 'empty object',
      input: {}
    }
  ];

  describe('Path', function() {

    describe('Segments', function() {

      it('Gets default values', function() {
        var s = new Path();
        expect(s.segments()).toBeArray();
        expect(s.segments()).toHaveLength(0);
      });

      describe('Gets and sets svg shorthand notation', function() {

        var path = 'M16,1.466C7.973,1.466,1.466,7.973,1.466,16c-0.064-0.104-0.296-0.297-0.296-0.297s-0.025-0.18-0.077-0.18S9.895,7.025,9.767,7v0';
        var expectedPath = 'M 16 1.466 C 7.973 1.466 1.466 7.973 1.466 16 c -0.064 -0.104 -0.296 -0.297 -0.296 -0.297 s -0.025 -0.18 -0.077 -0.18 S 9.895 7.025 9.767 7 v 0';
        var expectedSegments =  [
          ['moveTo',16,1.466],
          ['curveTo',7.973,1.466,1.466,7.973,1.466,16],
          ['curveBy',-0.064,-0.104,-0.296,-0.297,-0.296,-0.297],
          ['smoothCurveBy',-0.025,-0.18,-0.077,-0.18],
          ['smoothCurveTo',9.895,7.025,9.767,7],
          ['verticalLineBy',0]
        ];

        it('Sets via constructor and gets via path()', function() {
          var s = new Path(path);
          expect(s.path()).toBe(expectedPath);
        });

        it('Sets via path() and gets via path()', function() {
          var s = new Path();
          s.path(path);
          expect(s.path()).toBe(expectedPath);
        });

        it('Sets via path() and gets via segments()', function() {
          var s = new Path();
          s.path(path);
          expect(s.segments()).toEqual(expectedSegments);
        });
      });


      describe('Gets and sets commands', function() {
        var segmentsArray = [['moveTo', 20, 20], ['lineTo', 10, 10]];

        it('Sets multidim array of commands via constructor and gets via segments()', function() {
          var s = new Path(segmentsArray);
          expect(s.segments()).toEqual(segmentsArray);
        });

        it('Sets array of commands via constructor then uses lineTo and gets via segments()', function() {
          var s = new Path(['moveTo', 20, 20]).lineTo(10, 10);
          expect(s.segments()).toEqual(segmentsArray);
        });

        it('Sets list of commands via constructor and gets via segments()', function() {
          var s = new Path('moveTo', 20, 20, 'lineTo', 10, 10);
          expect(s.segments()).toEqual(segmentsArray);
        });

        it('Sets list of commands via constructor then uses lineTo and gets via segments()', function() {
          var s = new Path('moveTo', 20, 20).lineTo(10, 10);
          expect(s.segments()).toEqual(segmentsArray);
        });
      });


      describe('Gets and sets points.', function() {
        var input = [20,20, 40, 40];
        var expectedPoints = [[20,20], [40,40]];
        var expectedSegments = [
          ['moveTo', 20, 20],
          ['lineTo', 40, 40]
        ];

        it('Sets array of points via constructor and gets via points()', function() {
          var s = new Path(input);
          expect(s.points()).toEqual(expectedPoints);
        });

        it('Sets array of points via constructor and gets via segments()', function() {
          var s = new Path(input);
          expect(s.segments()).toEqual(expectedSegments);
        });

        it('Sets array of points via points() and gets via points()', function() {
          var s = new Path();
          s.points(input);
          expect(s.points()).toEqual(expectedPoints);
        });

        it('Sets list of points via constructor and gets via points()', function() {
          var s = new Path(20,20,40,40);
          expect(s.points()).toEqual(expectedPoints);
        });

        it('Sets list of points via constructor then overwrite via points() and gets via points()', function() {
          var s = new Path(input);
          s.points(input); // should clear then set
          expect(s.points()).toEqual(expectedPoints);
        });

        it('Sets list of points via constructor then append a lineTo and gets via segments()', function() {
          var s = new Path(20, 20);
          s.lineTo(40,40);
          expect(s.segments()).toEqual(expectedSegments);
        });

        it('Sets a path via constructor and gets via points()', function() {
          var s = new Path('M20,20C20,20,30,30,40,40');
          expect(s.points()).toEqual(expectedPoints);
        });
      });

      describe('lastPoint', function() {

        it('when the last segment is a moveTo', function() {
          var s = new Path().moveTo(20, 30);
          expect(s.lastPoint()).toEqual([20,30]);
        });

        it('when the last segment is a closePath', function() {
          var s = new Path().moveTo(20, 30).lineTo(40,40).closePath();
          expect(s.lastPoint()).toEqual( [ 20, 30 ]);
        });

        it('when we\'re using relative segments', function() {
          var s = new Path().moveTo(20, 30).lineTo(40,40).lineBy(40,40);
          expect(s.lastPoint()).toEqual([80, 80]);
        });

        it('when we\'re using relative segments and a closePath', function() {
          var s = new Path('M 20 30 l 40 40 L 140 40 Z l 140 40');
          expect(s.lastPoint()).toEqual([160, 70]);
        });

      });

      describe('moveTo', function() {

        it('Sets a path via constructor and gets via points()', function() {
          var s = new Path('M20,30');
          expect(s.points()).toEqual([[20,30]]);
        });

        it('Sets via moveTo and gets via points()', function() {
          var s = new Path().moveTo(20, 30);
          expect(s.points()).toEqual([[20,30]]);
        });

        it('Sets via moveTo and gets via segments()', function() {
          var s = new Path().moveTo(20, 30);
          expect(s.segments()).toEqual([['moveTo',20,30]]);
        });

        it('Sets via moveTo and gets via path()', function() {
          var s = new Path().moveTo(20, 30);
          expect(s.path()).toBe('M 20 30');
        });
      });

      describe('lineTo', function() {

        it('Sets via lineTo and gets via points()', function() {
          var s = new Path(0,0).lineTo(20, 30);
          expect(s.points()).toEqual([ [ 20, 30 ] ]);
        });

        it('Sets via lineTo and gets via segments()', function() {
          var s = new Path(0,0).lineTo(20, 30);
          expect(s.segments()).toEqual( [ [ 'lineTo', 20, 30 ] ]);
        });

        it('Sets via lineTo and gets via path()', function() {
          var s = new Path(0,0).lineTo(20, 30);
          expect(s.path()).toBe('L 20 30');
        });
      });

      describe('curveTo', function() {

        it('Sets via curveTo and gets via points()', function() {
          var s = new Path(0,0).curveTo(10,10,90,10,90,100);
          expect(s.points()).toEqual([ [ 90, 100 ] ]);
        });

        it('Sets via curveTo and gets via segments()', function() {
          var s = new Path(0,0).curveTo(10,10,90,10,90,100);
          expect(s.segments()).toEqual([ [ 'curveTo', 10, 10, 90, 10, 90, 100 ] ]);
        });

        it('Sets via path() and gets via segments()', function() {
          var s = new Path('M0,0C10,10,90,10,90,100');
          expect(s.segments()).toEqual([ ['moveTo', 0, 0], [ 'curveTo', 10, 10, 90, 10, 90, 100 ] ]);
        });
      });

      describe('Convert to absolute segments', function() {

        it('using lineTo', function() {
          var s = new Path(0,0).lineTo(10,10);
          expect(Path.toAbsolute(s.segments())).toEqual( [
            [ 'lineTo', 10, 10 ]
          ]);
        });

        it('using lineTo & lineBy', function() {
          var s = new Path(0,0).lineTo(10,10).lineBy(5,5);
          expect(Path.toAbsolute(s.segments())).toEqual( [
            [ 'lineTo', 10, 10 ],
            [ 'lineTo', 15, 15 ]
          ]);
        });

        it('using lineTo & horizontalLineBy', function() {
          var s = new Path(0,0).lineTo(10,10).horizontalLineBy(5);
          expect(Path.toAbsolute(s.segments())).toEqual( [
            [ 'lineTo', 10, 10 ],
            [ 'lineTo', 15, 10 ]
          ]);
        });

        it('using lineTo & verticalLineBy', function() {
          var s = new Path(0,0).lineTo(10,10).verticalLineBy(5);
          expect(Path.toAbsolute(s.segments())).toEqual( [
            [ 'lineTo', 10, 10 ],
            [ 'lineTo', 10, 15 ]
          ]);
        });

        it('using path', function() {
          var s = new Path('M25.221,1.417H6.11c-0.865,0-1.566,0.702-1.566,1.566');
          expect(Path.toAbsolute(s.segments())).toEqual( [
            [ 'moveTo', 25.221, 1.417 ],
            [ 'horizontalLineTo', 6.11 ],
            [ 'curveTo', 5.245, 1.417, 4.5440000000000005, 2.1189999999999998, 4.5440000000000005, 2.983 ]
          ]);
        });

        it('using path and sets segments()', function() {
          var s = new Path('M25.221,1.417H6.11c-0.865,0-1.566,0.702-1.566,1.566');
          s.segments(Path.toAbsolute(s.segments()));
          expect(s.segments()).toEqual( [
            [ 'moveTo', 25.221, 1.417 ],
            [ 'horizontalLineTo', 6.11 ],
            [ 'curveTo', 5.245, 1.417, 4.5440000000000005, 2.1189999999999998, 4.5440000000000005, 2.983 ]
          ]);
        });
      });


    });

    describe('attr', function(){

      it('Gets default values', function(){
        var s = new Path();
        expect(s.attr('cap')).toBe('butt');
        expect(s.attr('strokeColor')).toBe(0x000000ff);
        expect(s.attr('fillColor')).toBe(0x00000000);
        expect(s.attr('opacity')).toBe(1);
      });

      it('Sets & Gets cap', function(){
        var s = new Path();
        expect(s.attr('cap')).toBe('butt');
        s.attr('cap', 'xxx');
        expect(s.attr('cap')).toBe('butt');
        s.attr('cap', 'round');
        expect(s.attr('cap')).toBe('round');
        s.attr('cap', 'butt');
        expect(s.attr('cap')).toBe('butt');
        s.attr('cap', 'square');
        expect(s.attr('cap')).toBe('square');
      });

      it('Sets & Gets strokeColor', function(){
        var s = new Path();
        expect(s.attr('strokeColor')).toBe(0x000000ff);
        s.attr('strokeColor', 0xff00ffff);
        expect(s.attr('strokeColor')).toBe(0xff00ffff);
        s.attr('strokeColor', 'red');
        expect(s.attr('strokeColor')).toBe(0xff0000ff);
      });

      it('Sets & Gets opacity', function(){
        var s = new Path();
        expect(s.attr('opacity')).toBe(1);
        s.attr('opacity', .75);
        expect(s.attr('opacity')).toBe(.75);
        s.attr('opacity', -1);
        expect(s.attr('opacity')).toBe(0);
        s.attr('opacity', 2);
        expect(s.attr('opacity')).toBe(1);
      });

      it('Sets & Gets join', function(){
        var s = new Path();
        expect(s.attr('join')).toBe('miter');
        s.attr('join', 'xxx');
        expect(s.attr('join')).toBe('miter');
        s.attr('join', 'round');
        expect(s.attr('join')).toBe('round');
        s.attr('join', 'bevel');
        expect(s.attr('join')).toBe('bevel');
        s.attr('join', 'miter');
        expect(s.attr('join')).toBe('miter');
      });

      it('Sets & Gets miterLimit', function(){
        var s = new Path();
        expect(s.attr('miterLimit')).toBe(4);
        s.attr('miterLimit', 1.5);
        expect(s.attr('miterLimit')).toBe(1.5);
        s.attr('miterLimit', 777);
        expect(s.attr('miterLimit')).toBe(777);
      });

      it('Sets & Gets strokeWidth', function(){
        var s = new Path();
        expect(s.attr('strokeWidth')).toBe(0);
        s.attr('strokeWidth', 2);
        expect(s.attr('strokeWidth')).toBe(2);
        s.attr('strokeWidth', 88);
        expect(s.attr('strokeWidth')).toBe(88);
      });
    });

    describe('toAbsolute', function() {

      describe('basically', function() {
        it('it is a function', function() {
          expect(toString.call(Path.toAbsolute)).toEqual('[object Function]');
        });
      });

      describe('Generation of absolute segements', function() {

        invalidParametersMap.forEach(function(currentTest) {
          it('it returns ["moveTo", 0, 0] when the first parameter is ' + currentTest.descr, function() {
            expect(Path.toAbsolute(currentTest.input)).toEqual([['moveTo', 0, 0]]);
          });
        });

        var tests = [
          {
            input: [['moveTo', 0, 0]],
            expect: [['moveTo', 0, 0]]
          },
          {
            input: [['moveTo', 100, 100], ['lineBy', 100, -100]],
            expect: [['moveTo', 100, 100], ['lineTo', 200, 0]]
          },
          {
            input: [['moveBy', 1000, 1000], ['moveBy', -500, 500], ['moveBy', -111, -111]],
            expect: [['moveTo', 1000, 1000], ['moveTo', 500, 1500], ['moveTo', 389, 1389]]
          },
          {
            input: [['lineBy', 100, 100]],
            expect: [['lineTo', 100, 100]]
          },
          {
            input: [['moveTo', 0, 0], ['moveBy', -100, 500], ['lineTo', 300, 300], ['lineBy', -100, -200]],
            expect: [['moveTo', 0, 0], ['moveTo', -100, 500], ['lineTo', 300, 300], ['lineTo', 200, 100]]
          },
          {
            input: [['moveTo', 100, 100], ['lineTo', 200, 200], ['closePath'], ['lineBy', 100, 100]],
            expect: [['moveTo', 100, 100], ['lineTo', 200, 200], ['closePath'], ['lineTo', 200, 200]]
          },
          {
            input: [['moveTo', 100, 100], ['arcBy', 100, 50, 0, 1, 1, 250, 50]],
            expect: [['moveTo', 100, 100], ['arcTo', 100, 50, 0, 1, 1, 350, 150]]
          },
          {
            input: [['moveTo', 100, 100], ['quadraticCurveBy', 94.45, 220.10, 5, 184.80]],
            expect: [['moveTo', 100, 100], ['quadraticCurveTo', 194.45, 320.10, 105, 284.80]]
          },
          {
            input: [['moveTo', 0, 0], ['quadraticCurveBy', 94.45, 220.10, 5, 184.80], ['quadraticCurveBy', -89.4, -35.30, -131.65, -5]],
            expect: [['moveTo', 0, 0], ['quadraticCurveTo', 94.45, 220.10, 5, 184.80], ['quadraticCurveTo', -84.4, 149.5, -126.65, 179.8]]
          },
          {
            input: [['moveTo', 900, 1000], ['curveBy', 120, -50, 260, -200, 300, 400]],
            expect: [['moveTo', 900, 1000], ['curveTo', 1020, 950, 1160, 800, 1200, 1400]]
          },
          {
            input: [['moveTo', 900, 1000], ['curveBy', 120, -50, 260, -200, 300, 400], ['lineBy', -100, -100], ['curveBy', -200, 200, -200, -500, -600, -600]],
            expect: [['moveTo', 900, 1000], ['curveTo', 1020, 950, 1160, 800, 1200, 1400], ['lineTo', 1100, 1300], ['curveTo', 900, 1500, 900, 800, 500, 700]]
          },
          {
            input: [
              ['moveTo', 100, 100],
              ['arcBy', 100, 50, 0, 1, 1, 250, 50],
              ['quadraticCurveBy', 94.45, 220.10, 5, 184.80],
              ['lineTo', 250,150],
              ['closePath'],
              ['moveBy', 40,40],
              ['arcBy', 100, 50, 0, 1, 0, 250, 50],
              ['curveBy', 150, -300, 150, -300, 300, 0]
            ],
            expect: [
              ['moveTo', 100, 100],
              ['arcTo', 100, 50, 0, 1, 1, 350, 150],
              ['quadraticCurveTo', 444.45, 370.10, 355, 334.80],
              ['lineTo', 250,150],
              ['closePath'],
              ['moveTo', 140,140],
              ['arcTo', 100, 50, 0, 1, 0, 390, 190],
              ['curveTo', 540, -110, 540, -110, 690, 190]
            ]
          }
        ];

        tests.forEach(function(currentTest) {
          it('will return ' + currentTest.expect + ' when the input is ' + currentTest.input, function() {
            expect(Path.toAbsolute(currentTest.input)).toEqual(currentTest.expect);
          });
        });
      });

    });

    describe('#getBoundingBox()', function() {
      describe('uses all control points to determine the extrema in local coord system', function() {
        var left = 20;
        var top = 30;
        var width = 40;
        var height = 50;
        var expectedRight = left + width;
        var expectedBottom = top + height;

        // Create rectangle offset by {left,top} in its own coordinate space:
        var shape = new Path()
          .moveTo(left, top)
          .lineTo(expectedRight, top)
          .lineTo(expectedRight, expectedBottom)
          .lineTo(left, expectedBottom);

        it('Computed the correct bbox', function() {
          expect(shape.getBoundingBox()).toEqual({
            top: top,
            left: left,
            width: width,
            height: height,
            right: expectedRight,
            bottom: expectedBottom
          });
        });

      });
      describe('uses all control points to determine the extrema in outer coord system', function() {
        var left = 20;
        var top = 30;
        var width = 40;
        var height = 50;
        var expectedRight = left + width;
        var expectedBottom = top + height;
        var x = 100;
        var y = 200;

        // Create rectangle offset by {left,top} in its own coordinate space:
        var shape = new Path()
          .moveTo(left, top)
          .lineTo(expectedRight, top)
          .lineTo(expectedRight, expectedBottom)
          .lineTo(left, expectedBottom)
          .attr({
            x: 100,
            y: 200
          });

        it('Computed the correct bbox', function() {
          expect(shape.getBoundingBox( shape.attr('matrix') )).toEqual({
            top: top + y,
            left: left + x,
            width: width,
            height: height,
            right: expectedRight + x,
            bottom: expectedBottom + y
          });
        });

      });
      describe('Can calculate extrema of a circle correctly', function() {
        var shape = new Circle(40, 50, 45);
        expect(shape.getBoundingBox( shape.attr('matrix') )).toEqual({
          top: 5,
          left: -5,
          width: 90,
          height: 90,
          bottom: 95,
          right: 85
        });
      });
      describe('Can calculate extrema of complex curves', function() {
        var path = new Path()
          .moveTo(100, 40)
          .curveTo(700, 200, 200, 700, 300, 322)
          .lineTo(500, 560)
          .curveTo(700, 200, 200, 700, 500, 212)
          .lineTo(200, 600);
        // Verified visually
        expect(path.getBoundingBox()).toEqual({
          top: 40,
          left: 100,
          width: 448.7280710464647,
          height: 560,
          bottom: 600,
          right: 548.7280710464647
        });
      });
    });

    describe('fillGradient', function() {
      it('Can be set/get', function() {
        var s = new Rect(0, 0, 10, 10);
        var g = gradient.linear(0, ['red', 'yellow']);
        s.attr('fillGradient', g);
        expect(s.attr('fillGradient')).toBe(g);
        s.attr('fillGradient', null);
        expect(s.attr('fillGradient')).toBe(null);
      });
    });

    describe('strokeGradient', function() {
      it('Can be set/get', function() {
        var s = new Rect(0, 0, 10, 10);
        var g = gradient.linear(0, ['red', 'yellow']);
        s.attr('strokeGradient', g);
        expect(s.attr('strokeGradient')).toBe(g);
        s.attr('strokeGradient', null);
        expect(s.attr('strokeGradient')).toBe(null);
      });
    });

    describe('fill', function() {
      it('Can set fillGradient, fillColor and fillImage', function() {
        var s = new Path,
            grad = gradient.linear(0, ['red', 'purple']),
            bitmap = new Bitmap('data:image/png,');
        s.fill('red');
        expect(s.attr('fillColor')).toBe(+color('red'));
        s.fill('blue');
        expect(s.attr('fillColor')).toBe(+color('blue'));
        s.fill(grad);
        expect(s.attr('fillColor')).toBe(+color('blue'));
        expect(s.attr('fillGradient')).toBe(grad);
        s.fill(bitmap);
        expect(s.attr('fillColor')).toBe(+color('blue'));
        expect(s.attr('fillGradient')).toBe(grad);
        expect(s.attr('fillImage')).toBe(bitmap);
      });
    });

    describe('stroke', function() {
      it('Can set strokeGradient and strokeColor', function() {
        var s = new Path,
            grad = gradient.linear(0, ['red', 'purple']);
        s.stroke('red');
        expect(s.attr('strokeColor')).toBe(+color('red'));
        s.stroke('blue');
        expect(s.attr('strokeColor')).toBe(+color('blue'));
        s.stroke(grad);
        expect(s.attr('strokeColor')).toBe(+color('blue'));
        expect(s.attr('strokeGradient')).toBe(grad);
      });
    });

  });

});
