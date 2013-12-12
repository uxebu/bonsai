define([
  'bonsai/point',
  'bonsai/runner/path/path',
  'bonsai/runner/path/curved_path'
], function(Point, Path, CurvedPath) {

  function expectEqualSegments(a, b) {

    // Shallow compare two arrays in string form:

    // This is used instead of Jasmine's expect(segments).toEqual(segments)
    // because it was returning false: our segments contain special properties
    // such as fromX/fromY (not stored in regular indexes). See _push method.

    return expect(
      a.map(function(seg) {
        return '[' + seg.map(function(prop) {
          return (typeof prop === 'number') ? prop.toPrecision(5) : prop;
        }).join(',') + ']';
      }).join(',').replace(/\s/g, '')
    ).toBe(
      b.map(function(seg) {
        return '[' + seg.map(function(prop) {
          return (typeof prop === 'number') ? prop.toPrecision(5) : prop;
        }).join(',') + ']';
      }).join(',').replace(/\s/g, '')
    );

  }

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
  var toString = {}.toString;

  describe('CurvedPath', function() {

    describe('basically', function() {

      it('retuns an instance of Curve', function() {
        expect((new CurvedPath())).toBeInstanceOf(CurvedPath);
      });

    });

    describe('has an instance variable ´segments´', function() {

      it('it is an array', function() {
        var curve = new CurvedPath();
        expect(toString.call(curve._segments)).toEqual('[object Array]');
      });

    });

    describe('has an instance method `_push`', function() {
      it('Adds new segment with from (Point) / lastMoveTo (Point)', function() {

        var segment = ['moveTo', 100, 100];

        segment.from = new Point(0, 0);
        segment.lastMoveTo = new Point(0, 0);

        expect(
          new CurvedPath()._push('moveTo', 100, 100)._segments
        ).toEqual([segment]);

        segment = ['moveTo', 100, 100];
        segment.from = new Point(20,20);
        segment.lastMoveTo = new Point(10, 10);

        expect(
          new CurvedPath().moveTo(10, 10).lineTo(20, 20).moveTo(100, 100)._segments.pop()
        ).toEqual(segment);

      });
    })

    describe('has an instance method ´clear´', function() {

      it('it is a function', function() {
        var curve = new CurvedPath();
        expect(toString.call(curve.clear)).toEqual('[object Function]');
      });

      it('it sets ´segments´.length to zero', function() {
        var curve = new CurvedPath();
        curve._segments = ['test'];
        curve.clear();
        expect(curve._segments.length).toEqual(0);
      });

    });

    describe('has an class method ´propertiesFromAbsoluteArc´', function() {

      it('it is a function', function() {
        expect(toString.call(CurvedPath.propertiesFromAbsoluteArc)).toEqual('[object Function]');
      });

      var testMap = [
        {
          expect: [50 , 200, 100, 50, 0,   1, 1, 300, 250],
          toEqual:  { cx : 175, cy : 225 },
        },
        {
          expect: [50 ,  80, 100, 50, 30,  1, 1, 300, 130],
          toEqual: { cx : 175, cy : 105 },
        },
        {
          expect: [300, 100, 100, 50, 30,  1, 1, 550, 150],
          toEqual: { cx : 425, cy : 125 },
        },
        {
          expect: [400, 300, 100, 50, 45,  1, 1, 650, 350],
          toEqual: { cx : 525, cy : 325 } ,
        },
        {
          expect: [150, 600, 100, 50, 135, 1, 1, 400, 650],
          toEqual: { cx : 275, cy : 625 },
        },
        {
          expect: [300, 350, 150, 50, 0,   0, 0, 550, 400],
          toEqual: { cx : 443.190171877725, cy : 364.89434895681944 },
        },
        {
          expect: [500, 750, 150, 50, 0,   0, 1, 750, 800],
          toEqual: { cx : 606.809828122275, cy : 785.1056510431805 },
        },
        {
          expect: [550, 600, 150, 50, 0,   1, 0, 800, 650],
          toEqual: { cx : 656.809828122275, cy : 635.1056510431805 },
        },
        {
          expect: [700, 450, 150, 50, 0,   1, 1, 950, 500],
          toEqual: { cx : 843.190171877725, cy : 464.89434895681944 }
        }
      ];

      testMap.map(function(currentTest) {
        it('it returns important properties of an arc notation like ' + currentTest.expect, function() {
          expect(CurvedPath.propertiesFromAbsoluteArc.apply(null, currentTest.expect).cx).toEqual(currentTest.toEqual.cx);
          expect(CurvedPath.propertiesFromAbsoluteArc.apply(null, currentTest.expect).cy).toEqual(currentTest.toEqual.cy);
        });
      });

    });

    describe('Class method `countSubPaths`', function() {

      it('is a function', function() {
        expect(toString.call(CurvedPath.countSubPaths)).toEqual('[object Function]');
      });

      it('counts sub-paths', function() {
        expect(CurvedPath.countSubPaths([['moveTo', 0, 0]])).toEqual([1]);
        expect(CurvedPath.countSubPaths([['moveTo', 0, 0], ['lineTo', 10, 10]])).toEqual([2]);
        expect(CurvedPath.countSubPaths([['moveTo', 0, 0], ['closePath']])).toEqual([2]);
        expect(CurvedPath.countSubPaths([['moveTo', 0, 0], ['lineTo', 10, 10], ['closePath']])).toEqual([3]);
        expect(
          CurvedPath.countSubPaths([
            ['moveTo', 0, 0],
            ['lineTo', 200, 200],
            ['closePath'],
            ['lineTo', 20, 20],
            ['lineTo', 30, 30],
            ['closePath']
          ])
        ).toEqual([3, 3]);
        expect(
          CurvedPath.countSubPaths([
            ['moveTo', 0, 0],
            ['lineTo', 200, 200],
            ['closePath'],
            ['lineTo', 20, 20],
            ['lineTo', 30, 30],
            ['closePath'],
            ['moveTo', 0, 0],
            ['lineTo', 200, 200]
          ])
        ).toEqual([3, 3, 2]);
      });

    });

    describe('Class method `subPathToCurves`', function() {

      it('Returns required amount of segments (via requiredCurves argument)', function() {
        expectEqualSegments(
          CurvedPath.subPathToCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100]
          ], 3),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100] // nullSegment
          ]
        );
        expectEqualSegments(
          CurvedPath.subPathToCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100]
          ], 10),
          [
            // Evenly distribute the eight (10-2) null segments
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100], // nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100], // nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100], // nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100] // nullSegment
          ]
        );
      });

    });

    describe('Class method ´toCurves´', function() {

      it('is a function', function() {
        expect(toString.call(CurvedPath.toCurves)).toEqual('[object Function]');
      });

      invalidParametersMap.map(function(currentTest) {
        it('it returns an empty array when the first parameter is ' + currentTest.descr, function() {
          expect(CurvedPath.toCurves(currentTest.input)).toEqual([]);
        });
      });

      it('it returns an empty array in case of an computation error', function() {
        expect(CurvedPath.toCurves([2])).toEqual([]);
      });

      it('Returns required amount of segments (via requiredCurves argument)', function() {
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100]
          ], [6]),
          [
            // Evenly distribute the four null segments
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0], // nullSegment
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100], // nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100]  // nullSegment
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100]
          ], [3]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100] // nullSegment
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100]
          ], [0]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 100, 100, 100, 100]
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100],
            ['closePath'],
            ['moveTo', 200, 200],
            ['lineTo', 0, 200],
            ['closePath']
          ], [0]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['closePath'],
            ['moveTo', 200, 200],
            ['curveTo', 200, 200, 0, 200, 0, 200],
            ['closePath']
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100],
            ['closePath'],
            ['moveTo', 200, 200],
            ['lineTo', 0, 200],
            ['closePath']
          ], [5,5]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0], //
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100], //
            ['closePath'],
            ['moveTo', 200, 200],
            ['curveTo', 200, 200, 200, 200, 200, 200], //
            ['curveTo', 200, 200, 0, 200, 0, 200],
            ['curveTo', 0, 200, 0, 200, 0, 200], //
            ['closePath']
          ]
        );
        expectEqualSegments(
          // Only two required-sub-path lengths being passed, so the
          // third sub-path is expected to be unchanged other than
          // curves conversion of lineTo:
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100],
            ['closePath'],
            ['moveTo', 200, 200],
            ['lineTo', 0, 200],
            ['closePath'],
            ['moveTo', 300, 300],
            ['lineTo', 0, 300],
            ['closePath']
          ], [5, 5]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0], //
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100], //
            ['closePath'],
            ['moveTo', 200, 200],
            ['curveTo', 200, 200, 200, 200, 200, 200], //
            ['curveTo', 200, 200, 0, 200, 0, 200],
            ['curveTo', 0, 200, 0, 200, 0, 200], //
            ['closePath'],
            // Last sub-path (only curves conversion has occurred, no insertion of extra curves.)
            ['moveTo', 300, 300],
            ['curveTo', 300, 300, 0, 300, 0, 300],
            ['closePath']
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100],
            ['closePath'],
            ['moveTo', 200, 200],
            ['lineTo', 0, 200],
            ['closePath']
          ], [5, 5, 10]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0], //
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100], //
            ['closePath'],
            ['moveTo', 200, 200],
            ['curveTo', 200, 200, 200, 200, 200, 200], //
            ['curveTo', 200, 200, 0, 200, 0, 200],
            ['curveTo', 0, 200, 0, 200, 0, 200], //
            ['closePath'],
            // 10 length sub-path
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],
            ['closePath']
          ]
        );
        expectEqualSegments(
          CurvedPath.toCurves([
            ['moveTo', 0, 0],
            ['lineTo', 100, 100],
            ['lineTo', 400, 250]
          ], [12]),
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 0, 0, 0, 0],// nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0],// nullSegment
            ['curveTo', 0, 0, 0, 0, 0, 0],// nullSegment
            ['curveTo', 0, 0, 100, 100, 100, 100],
            ['curveTo', 100, 100, 100, 100, 100, 100],// nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100],// nullSegment
            ['curveTo', 100, 100, 100, 100, 100, 100],// nullSegment
            ['curveTo', 100, 100, 400, 250, 400, 250],
            ['curveTo', 400, 250, 400, 250, 400, 250],// nullSegment
            ['curveTo', 400, 250, 400, 250, 400, 250],// nullSegment
            ['curveTo', 400, 250, 400, 250, 400, 250] // nullSegment
          ]
        );
      });

    });

    describe('has an instance method ´lineTo´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().lineTo)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().lineTo(100, 100)._segments,
          [['curveTo', 0, 0, 100, 100, 100, 100]]
        );
        expectEqualSegments(
          new CurvedPath().lineTo(500, 190)._segments,
          [['curveTo', 0, 0, 500, 190, 500, 190]]
        );
      });
    });

    describe('has an instance method ´lineBy´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().lineBy)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().lineBy(150, 200)._segments,
          [['curveTo', 0, 0, 150, 200, 150, 200]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(100, 100).lineBy(150, 150)._segments,
          [['moveTo', 100, 100], ['curveTo', 100, 100, 250, 250, 250, 250]]
        );
      });
    });

    describe('has an instance method ´moveTo´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().moveTo)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(100, 100)._segments,
          [['moveTo', 100, 100]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(-500, 190)._segments,
          [['moveTo', -500, 190]]
        );
      });
    });

    describe('has an instance method ´moveBy´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().moveBy)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().moveBy(100, 100)._segments,
          [['moveTo', 100, 100]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(200, -200).moveBy(100, 250)._segments,
          [['moveTo', 200, -200], ['moveTo', 300, 50]]
        );
      });
    });

    describe('has an instance method `closePath`', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().closePath)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {

        // Requirements from: http://www.w3.org/TR/SVG/paths.html#PathDataClosePathCommand

        // The "closepath" (Z or z) ends the current subpath and causes an
        // automatic straight line to be drawn from the current point to
        // the initial point of the current subpath.
        expectEqualSegments(
          new CurvedPath().moveTo(100, 100).lineTo(200, 100).lineTo(100, 200).closePath()._segments,
          [
            ['moveTo', 100, 100],
            ['curveTo', 100, 100, 200, 100, 200, 100],
            ['curveTo', 200, 100, 100, 200, 100, 200],
            ['closePath']
          ]
        );

        // If a "closepath" is followed immediately by a "moveto", then the
        // "moveto" identifies the start point of the next subpath
        expectEqualSegments(
          new CurvedPath().moveTo(100, 100).lineTo(200, 100).lineTo(100, 200).closePath().moveTo(50, 50).lineTo(0, 0)._segments,
          [
            ['moveTo', 100, 100],
            ['curveTo', 100, 100, 200, 100, 200, 100],
            ['curveTo', 200, 100, 100, 200, 100, 200],
            ['closePath'],
            ['moveTo', 50, 50],
            ['curveTo', 50, 50, 0, 0, 0, 0]
          ]
        );

        // If a "closepath" is followed immediately by any other command, then
        // the next subpath starts at the same initial point as the current subpath.
        expectEqualSegments(
          new CurvedPath().moveTo(100, 100).lineTo(200, 100).lineTo(100, 200).closePath().lineTo(0, 0)._segments,
          [
            ['moveTo', 100, 100],
            ['curveTo', 100, 100, 200, 100, 200, 100],
            ['curveTo', 200, 100, 100, 200, 100, 200],
            ['closePath'],
            ['curveTo', 100, 100, 0, 0, 0, 0]
          ]
        );

      });
    });

    describe('has an instance method ´curveTo´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().curveTo)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().curveTo(100, 100, 200, 200, 300, 300)._segments,
          [['curveTo', 100, 100, 200, 200, 300, 300]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(-500, 190).curveTo(100, 100, 200, 200, 300, 300)._segments,
          [['moveTo', -500, 190], ['curveTo', 100, 100, 200, 200, 300, 300]]
        );
      });
    });

    describe('has an instance method ´curveBy´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().curveBy)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().curveBy(100, 100, 200, 200, 300, 300)._segments,
          [['curveTo', 100, 100, 200, 200, 300, 300]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(100, 150).curveBy(100, 100, 200, 200, 300, 50)._segments,
          [['moveTo', 100, 150], ['curveTo', 200, 250, 300, 350, 400, 200]]
        );
      });
    });

    describe('has an instance method `quadraticCurveTo`', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().quadraticCurveTo)).toEqual('[object Function]');
      });
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().quadraticCurveTo(150, 100, 200, 200)._segments,
          [['curveTo', 100, 66.66666666666666, 166.66666666666666, 133.33333333333331, 200, 200]]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(20, 20).quadraticCurveTo(300, 700, 200, 100)._segments,
          [
            ['moveTo', 20, 20],
            ['curveTo', 206.66666666666666, 473.3333333333333, 266.66666666666663, 499.99999999999994, 200, 100]
          ]
        );
      });
    });

    describe('has an instance method `quadraticCurveBy`', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().quadraticCurveBy)).toEqual('[object Function]');
      });
      // Should forward to quadraticCurveTo
      it('Pushes a curveTo segment to segments array', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(300, 100).quadraticCurveBy(300, -250, 200, 100)._segments,
          [
            ['moveTo', 300, 100 ], [ 'curveTo', 500, -66.66666666666667, 566.6666666666666, -33.33333333333334, 500, 200]
          ]
        );
      });
    });

    describe('has an instance method ´arcTo´', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().arcTo)).toEqual('[object Function]');
      });
      it('Calculates correct curves for arcTo segments', function() {
        expectEqualSegments(
          new CurvedPath().arcTo(150, 200, 0, 0, 0, 400, 400)._segments,
          [
            ['curveTo', -82.84271049373314, 147.27593336224058, -60.45694729305488, 356.20971449079934, 50.00000175781253, 466.6666635416667],
            ['curveTo', 160.45695080867995, 577.1236125925341, 317.1572869174321, 547.2759307734059, 400, 400]
          ]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(300, 300).arcTo(100, 100, 0, 0, 0, 500, 500)._segments,
          [
            ['moveTo', 300, 300],
            ['curveTo', 244.77152501692066, 355.22847498307937, 244.77152501692066, 444.7715250169207, 300, 500],
            ['curveTo', 355.22847498307937, 555.2284749830793, 444.7715250169207, 555.2284749830793, 500, 500]
          ]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(300, 300).arcTo(100, 100, 0, 0, 0, 250, 250)._segments,
          [
            ['moveTo', 300, 300],
            ['curveTo', 289.97870133779054, 277.80031375901723, 272.19968624098266, 260.0212986622094, 249.9999999999999, 250]
          ]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(200, 200).arcTo(100, 100, 0, 0, 1, 600, 600)._segments,
          [
            ['moveTo', 200, 200],
            ['curveTo', 310.4569499661587, 89.54305003384134, 489.5430500338413, 89.54305003384131, 600, 200],
            ['curveTo', 710.4569499661586, 310.4569499661587, 710.4569499661586, 489.5430500338413, 600, 600]
          ]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(200, 200).arcTo(100, 100, 0, 1, 0, 250, 250)._segments,
          [
            ['moveTo', 200, 200],
            ['curveTo', 155.98000196913011, 180.12865845991843, 104.04811995788504, 194.55857213142423, 76.58977842258156, 234.29105155784546],
            ['curveTo', 49.13143688727809, 274.0235309842667, 53.994181582368654, 327.7031033729077, 88.14553910473047, 361.85446089526954],
            ['curveTo', 122.29689662709231, 396.00581841763136, 175.9764690157334, 400.8685631127219, 215.7089484421546, 373.4102215774184],
            ['curveTo', 255.4414278685758, 345.95188004211485, 269.8713415400816, 294.01999803086983, 249.99999999999994, 249.99999999999997]
          ]
        );
        expectEqualSegments(
          new CurvedPath().moveTo(200, 200).arcTo(100, 100, 0, 1, 1, 250, 250)._segments,
          [
            ['moveTo', 200, 200],
            ['curveTo', 180.1286584599184, 155.98000196913014, 194.55857213142417, 104.04811995788512, 234.29105155784538, 76.58977842258162],
            ['curveTo',274.0235309842666, 49.131436887278106, 327.70310337290766, 53.99418158236861, 361.8544608952695, 88.14553910473042],
            ['curveTo', 396.0058184176313, 122.29689662709222, 400.8685631127219, 175.97646901573327, 373.41022157741844, 215.7089484421545],
            ['curveTo', 345.95188004211496, 255.44142786857574, 294.01999803086994, 269.8713415400816, 250.00000000000006, 250]
          ]
        );
      });
    });

    describe('has an instance method ´arcBy´', function() {
      // With arcBy we're just confirming that it forwards to arcTo correctly
      // For now, we only need one assetion to test this:
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().arcBy)).toEqual('[object Function]');
      });
      it('Calculates correct curves for arcBy segments', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(200, 200).arcBy(100, 100, 0, 0, 0, 250, 250)._segments,
          [
            ['moveTo', 200, 200],
            ['curveTo', 130.96440757323415, 269.03559395225136, 130.96440819155933, 380.9644054294235, 200.00000138106793, 449.99999861893207],
            ['curveTo', 269.03559457057656, 519.0355918084407, 380.96440604774864, 519.0355924267658, 450, 450]
          ]
        );
      });
    });

    describe('has an instance method `nullCurve`', function() {
      // With arcBy we're just confirming that it forwards to arcTo correctly
      // For now, we only need one assetion to test this:
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().nullCurve)).toEqual('[object Function]');
      });
      it('Inserts null curves into segments array', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(200, 220).nullCurve()._segments,
          [
            ['moveTo', 200, 220],
            ['curveTo', 200, 220, 200, 220, 200, 220]
          ]
        );
      });
    });

    describe('has an instance method `splitCurve`', function() {
      it('it is a function', function() {
        expect(toString.call(new CurvedPath().splitCurve)).toEqual('[object Function]');
      });
      it('it returns the current instance', function() {
        expect(new CurvedPath().splitCurve()).toBeInstanceOf(CurvedPath);
      });
      it('Does not split when parameter ´index´ is out of range', function() {
        expectEqualSegments(
          new CurvedPath().splitCurve()._segments,
          new CurvedPath()._segments
        );
        expectEqualSegments(
          new CurvedPath().splitCurve(1)._segments,
          new CurvedPath()._segments
        );
      });
      it('Does not split when ´index´ points to a ´moveTo´ segment', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(0, 0).splitCurve(0)._segments,
          new CurvedPath().moveTo(0, 0)._segments
        );
      });
      it('Splits a curved representation of a ´lineTo´ segment into two curved segments', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(0, 0).lineTo(200, 200).splitCurve(1)._segments,
          [
            ['moveTo', 0, 0],
            ['curveTo', 0, 0, 50, 50, 100, 100],
            ['curveTo', 150, 150, 200, 200, 200, 200]
          ]
        );
      });
      it('Splits a curved representation of a ´curveTo´ segment into two curved segments', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(0, 0).curveTo(100, 0, 150, 50, 200, 300).splitCurve(1)._segments,
          [
            ['moveTo', 0, 0],
            ['curveTo', 50, 0, 87.5, 12.5, 118.75, 56.25],
            ['curveTo', 150, 100, 175, 175, 200, 300]
          ]
        );
      });
      it('Splits a curved representation of a ´arcTo´ segment into two curved segments', function() {
        expectEqualSegments(
          new CurvedPath().moveTo(0, 0).arcTo(100, 50, 0, 1, 1, 250, 50).splitCurve(1)._segments,
          [
            ['moveTo', 0, 0],
            ['curveTo', 13.807118745769836, -17.25889843221229, 40.29822031355755, -30.085678118654748, 71.96699141100895, -36.871843353822904],
            ['curveTo', 103.63576250846035, -43.65800858899106, 140.48220313557542, -44.403559372884914, 175, -37.5],
            ['curveTo', 244.03559372884916, -23.692881254230166, 277.61423749153965, 15.482203135575418, 250, 50],
          ]
        );
      });
    });

    describe('has an class method `splitAbsoluteCubicBezier`', function() {
      var splitAbsBezier = CurvedPath.splitAbsoluteCubicBezier;

      // TODO: need to figure out how to spy on the Point constructor
      // spyOn(window, 'Point').andCall(function() { return 'baz';} );

      it('it is a function', function() {
        expect(splitAbsBezier).toBeOfType('function');
      });
      it('throws a TypeError when arguments are invalid', function() {
        expect(function() {
          splitAbsBezier();
        }).toThrow();
      });
      it('it returns an object with a `left` and `right` property.', function() {
        var result = splitAbsBezier(new Point(0,0), new Point(50,50), new Point(100,100), new Point(200,200), 0);
        expect(result).toHaveProperties('left', 'right');
      });
      it('it returns an object with a `left` property that contains an array.', function() {
        var result = splitAbsBezier(new Point(0,0), new Point(50,50), new Point(100,100), new Point(200,200), 0);
        expect(result).toHaveProperties('left', 'right');
      });
      // TODO: related to "spy Point" todo
      //it('splits a cubic bézier represented curve with `t = 0` into two curved segments', function() {
      //  expect('left' in splitAbsBezier(new Point(0,0), new Point(50,50), new Point(100,100), new Point(200,200), 0)).toBe('');
      //});

    });

    describe('getBoundsOfCurve', function() {
      it('Returns bounds of cubic bezier where curves to not exceed start or end points', function() {
        expect(
          CurvedPath.getBoundsOfCurve(
            10, 10,
            300, 20,
            0, 200,
            200, 200
          )
        ).toEqual({
          top: 10,
          left: 10,
          right: 200,
          bottom: 200
        });
      });
      it('Returns bounds of cubic bezier where curves exceed the start point', function() {
        expect(
          CurvedPath.getBoundsOfCurve(
            10, 10,
            -100, -20,
            0, 200,
            200, 200
          )
        ).toEqual({
          // Verified visually
          top: 7.188773200543233,
          left: -35.42711114040688,
          right: 200,
          bottom: 200
        });
      });
      it('Returns bounds of cubic bezier where curves exceed the end point', function() {
        expect(
          CurvedPath.getBoundsOfCurve(
            10, 10,
            100, 20,
            300, 650,
            200, 200
          )
        ).toEqual({
          // Verified visually
          top: 10,
          left: 10,
          right: 227.32435900508673,
          bottom: 361.86818746765124
        });
      });
      it('Returns bounds of cubic bezier where curves exceed both start and end points', function() {
        expect(
          CurvedPath.getBoundsOfCurve(
            20, 20,
            -200, -120,
            300, 650,
            200, 200
          )
        ).toEqual({
          // Verified visually
          top: 2.7156747405887716,
          left: -36.5340999118199,
          right: 213.3936040440513,
          bottom: 342.8039531991939
        });
      });
    });

  });

});
