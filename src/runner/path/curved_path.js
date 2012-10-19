define([
  '../../point',
  '../../tools'
], function(Point, tools) {
  'use strict';

  var abs = Math.abs;
  var atan2 = Math.atan2;
  var asin = Math.asin;
  var ceil = Math.ceil;
  var cos = Math.cos;
  var max = Math.max;
  var min = Math.min;
  var PI  = Math.PI;
  var pow = Math.pow;
  var sqrt = Math.sqrt;
  var sin = Math.sin;
  var tan = Math.tan;

  /**
   * Construct a CurvedPath instance
   *
   * @constructor
   * @name CurvedPath
   * @memberOf module:path
   * @returns {Curve} A new Instance of Curve
   */
  function CurvedPath() {
    this._segments = [];
    this.requiredCurves = 0;
    this.currentPoint = new Point(0, 0);
    this.lastMoveTo = new Point(0, 0);
  };

  /** @lends CurvedPath */
  var proto = CurvedPath.prototype;

  proto.clear = function() {
    this._segments.length = 0;
  };

  /**
   * Used internally to push to the _segments array. In addition to the basic
   * arguments passed, (e.g. `moveTo, 0, 0`) this method will add properties
   * to indicate the segments from values (i.e. the previous x/y points)
   * and lastMoveTo. These properties will be used in splitCurves
   */
  proto._push = function() {
    var segment = [].slice.call(arguments);
    segment.from = this.currentPoint.clone();
    segment.lastMoveTo = this.lastMoveTo.clone();
    this._segments.push(segment);
    return this;
  };

  proto.moveTo = function(x, y) {
    this._push('moveTo', x, y);
    this.currentPoint = new Point(x, y);
    this.lastMoveTo = new Point(x, y);
    return this;
  };

  proto.moveBy = function(x, y) {
    var currentPoint = this.currentPoint;
    return this.moveTo(currentPoint.x + x, currentPoint.y + y);
  };

  proto.closePath = function() {
    this._push('closePath');
    this.currentPoint = this.lastMoveTo.clone();
    return this;
  };

  proto.lineTo = function(x, y) {
    var currentPoint = this.currentPoint;
    this._push('curveTo', currentPoint.x, currentPoint.y, x, y, x, y);
    this.currentPoint = new Point(x, y);
    return this;
  };

  proto.lineBy = function(x, y) {
    var currentPoint = this.currentPoint;
    return this.lineTo(currentPoint.x + x, currentPoint.y + y);
  };

  proto.curveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
    this._push('curveTo', cp1x, cp1y, cp2x, cp2y, x, y);
    this.currentPoint = new Point(x, y);
    return this;
  };

  proto.curveBy = function(cp1x, cp1y, cp2x, cp2y, x, y) {
    var currentPointX = this.currentPoint.x;
    var currentPointY = this.currentPoint.y;
    return this.curveTo(
      currentPointX + cp1x,
      currentPointY + cp1y,
      currentPointX + cp2x,
      currentPointY + cp2y,
      currentPointX + x,
      currentPointY + y
    );
  };

  proto.arcTo = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endX, endY) {

    var center,
        centerX,
        centerY,
        diffAngle,
        endAngle,
        startAngle,
        splitAngle,
        splitArcN;
    var currentPointX = this.currentPoint.x;
    var currentPointY = this.currentPoint.y;

    var props = propertiesFromAbsoluteArc(
      currentPointX, currentPointY, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endX, endY
    );

    centerX = props.cx;
    centerY = props.cy;
    startAngle = props.startAngle;
    endAngle = props.endAngle;
    diffAngle = endAngle - startAngle;

    // Save rx and ry (they may have been mutated by `propertiesFromAbsoluteArc`)
    rx = props.rx;
    ry = props.ry;

    splitArcN = ceil(abs(diffAngle) / (PI/2));
    splitAngle = diffAngle / splitArcN;

    for (var slice = 0; slice < splitArcN; ++slice) {

      // We need to calculate the bezier curve for each slice of the arc
      // (each arcTo has been split into `splitArcN` (default: 4) parts)

      var _curX = _curX || currentPointX,
          _curY = _curY || currentPointY,
          _startAngle = startAngle + splitAngle * slice,
          _endAngle = _startAngle + splitAngle,

          k = (4.0 / 3.0) * tan((
            (_endAngle) - (_startAngle)
          ) / 4.0),

          _endX = centerX + rx * cos(_endAngle),
          _endY = centerY + ry * sin(_endAngle),

          cp1x = _curX + (k * rx * -sin(_startAngle)),
          cp1y = _curY + (k * ry * cos(_startAngle)),
          cp2x = _endX + (k * rx * sin(_endAngle)),
          cp2y = _endY + (k * ry * -cos(_endAngle));

      _curX = _endX;
      _curY = _endY;

      this._push('curveTo', cp1x, cp1y, cp2x, cp2y, _endX, _endY);
    }

    this.currentPoint = new Point(endX, endY);

    return this;
  };

  proto.arcBy = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endX, endY) {
    var currentPoint = this.currentPoint;
    return this.arcTo(
      rx, ry, xAxisRotation, largeArcFlag, sweepFlag, endX + currentPoint.x, endY + currentPoint.y
    );
  };

  proto.quadraticCurveTo = function(cpx, cpy, x, y) {

    // From raphael's q2c function

    var _13 = 1 / 3,
        _23 = 2 / 3,
        currentPoint = this.currentPoint;

    this._push(
      'curveTo',
      _13 * currentPoint.x + _23 * cpx,
      _13 * currentPoint.y + _23 * cpy,
      _13 * x + _23 * cpx,
      _13 * y + _23 * cpy,
      x,
      y
    );

    this.currentPoint = new Point(x, y);

    return this;
  };

  proto.quadraticCurveBy = function(cpx, cpy, x, y) {

    var currentPoint = this.currentPoint;
    return this.quadraticCurveTo(
      cpx + currentPoint.x,
      cpy + currentPoint.y,
      x + currentPoint.x,
      y + currentPoint.y
    );
  };

  /**
   * Inserts nullCurve at specified index or at end of segments
   */
  proto.nullCurve = function(index) {

    index = index == null ? this._segments.length - 1 : index;

    var segment,
        x,
        y,
        previousSegment = this._segments[index];

    // We need to grab the last segment's toX/toY values, so we can
    // use them to position this null curve:

    if (previousSegment) {
      x = previousSegment[previousSegment.length - 2];
      y = previousSegment[previousSegment.length - 1];
    } else {
      x = y = 0;
    }

    segment = ['curveTo', x, y, x, y, x, y];

    segment.from = new Point(x, y);
    if (previousSegment) {
      segment.lastMoveTo = previousSegment.lastMoveTo.clone();
    } else {
      segment.lastMoveTo = new Point(0, 0);
    }

    this._segments.splice(index + 1, 0, segment);

    return this;
  };

  proto.splitCurve = function(index, amount) {

    amount = 2;

    var left, right, splitInPoints;
    var curvedSegment = this._segments[index];
    var splitSegments = [];
    // parametric approach. Choose a point in a range from 0 to 1.
    var t = 1/amount;

    // skip out-of-range-index and ´moveTo´ segment
    if (!curvedSegment || curvedSegment.length < 7) {
      return this;
    }

    splitInPoints = splitAbsoluteCubicBezier(
      curvedSegment.from.clone(),
      new Point(curvedSegment[1], curvedSegment[2]),
      new Point(curvedSegment[3], curvedSegment[4]),
      new Point(curvedSegment[5], curvedSegment[6]),
      t
    );

    left  = splitInPoints.left;
    right = splitInPoints.right;

    // piece 1
    var piece1 = ['curveTo', left[1].x, left[1].y, left[2].x, left[2].y, left[3].x, left[3].y];
    piece1.from = left[0].clone();
    piece1.lastMoveTo = curvedSegment.lastMoveTo.clone();
    splitSegments.push(piece1);

    // piece 2
    var piece2 = ['curveTo', right[1].x, right[1].y, right[2].x, right[2].y, right[3].x, right[3].y];
    piece2.from = right[0].clone();
    piece2.lastMoveTo = curvedSegment.lastMoveTo.clone();
    splitSegments.push(piece2);

    this._segments.splice(index, 1, piece1, piece2);

    return this;
  };


  /** CLASS STATIC METHODS **/

  CurvedPath.propertiesFromAbsoluteArc = propertiesFromAbsoluteArc;
  function propertiesFromAbsoluteArc(x1, y1, rx, ry, angleInDegrees, large, sweep, x2, y2) {

    // based on http://www.w3.org/TR/SVG/implnote.html#ArcImplementationNotes
    // and http://fridrich.blogspot.com/2011/06/bounding-box-of-svg-elliptical-arc.html

    // Any nonzero value for either of the flags large or sweep is taken
    // to mean the value 1
    large = !!large;
    sweep = !!sweep;

    // precompute
    var angleInRad = (angleInDegrees * PI) / 180; // TODO: radFromDegrees
    var cosAngle = cos(angleInRad);
    var rx2 = pow(rx, 2);
    var ry2 = pow(ry, 2);
    var sinAngle = sin(angleInRad);

    // step 1: see F.6.5.1
    var midOfLineJoinX = (x1 - x2) / 2;
    var midOfLineJoinY = (y1 - y2) / 2;
    var x1Rotated = cosAngle*midOfLineJoinX + sinAngle*midOfLineJoinY;
    var y1Rotated = -sinAngle*midOfLineJoinX + cosAngle*midOfLineJoinY;

    // step 2: see F.6.5.2
    var cxTransformed;
    var cyTransformed;
    var factor;
    var radicand;
    var ratio;
    var sign;
    var x1Rotated2 = pow(x1Rotated, 2);
    var y1Rotated2 = pow(y1Rotated, 2);

    // see F.6.6 (correction of radii)
    var rRatio = (pow(midOfLineJoinX, 2)/rx2) + (pow(midOfLineJoinY, 2)/ry2);
    if (rRatio > 1) {
      // Determine radii that will satisfy the distance:
      rx = sqrt(rRatio) * rx;
      ry = sqrt(rRatio) * ry;
      return propertiesFromAbsoluteArc(
        x1, y1, rx, ry, angleInDegrees, large, sweep, x2, y2
      );
    }

    radicand = rx2*ry2 - rx2*y1Rotated2 - ry2*x1Rotated2;
    radicand /= (rx2*y1Rotated2 + ry2*x1Rotated2);

    if (radicand < 0) {
      ratio = rx/ry;
      radicand = y1Rotated2 + x1Rotated2/pow(ratio, 2);
      ry = sqrt(radicand);
      rx = ratio*ry;
      cxTransformed = 0;
      cyTransformed = 0;
    } else {
      //+ sign is chosen if large ≠ sweep, and the − sign is chosen if large = sweep
      sign = large === sweep ? -1 : 1;
      factor = sign * sqrt(radicand);

      cxTransformed = factor * rx  * y1Rotated / ry;
      cyTransformed = -factor * ry * x1Rotated / rx;
    }
    // step 3: see F.6.5.3
    var cx = cxTransformed*cosAngle - cyTransformed*sinAngle + (x1 + x2)/2;
    var cy = cxTransformed*sinAngle + cyTransformed*cosAngle + (y1 + y2)/2;

    // step 4: compute angle
    // TODO: why is this working?
    var f1 = asin((y1 - cy) / ry);
    var f2 = asin((y2 - cy) / ry);
    // x1 II & III quadrant
    f1 = x1 < cx ? PI - f1 : f1;
    // x2 II & III quadrant
    f2 = x2 < cx ? PI - f2 : f2;
    f1 < 0 && (f1 = PI * 2 + f1);
    f2 < 0 && (f2 = PI * 2 + f2);
    if (sweep && f1 > f2) {
        f1 = f1 - PI * 2;
    }
    if (!sweep && f2 > f1) {
        f2 = f2 - PI * 2;
    }

    return {
      cx: cx,
      cy: cy,
      rx: rx,
      ry: ry,
      startAngle: f1,
      endAngle: f2
    };
  };

  CurvedPath.splitAbsoluteCubicBezier = splitAbsoluteCubicBezier;
  function splitAbsoluteCubicBezier(startPoint, controlPoint1, controlPoint2, endPoint, t) {
    // based on http://en.wikipedia.org/wiki/De_Casteljau%27s_algorithm

    if (t == 0) {
      return {
        left:  [startPoint, startPoint, startPoint, startPoint],
        right: [startPoint, controlPoint1, controlPoint2, endPoint]
      };
    }

    if (t == 1) {
      return {
        left: [startPoint, controlPoint1, controlPoint2, endPoint],
        right:  [endPoint, endPoint, endPoint, endPoint]
      };
    }

    // step 1
    var p10 = Point.lerp(startPoint, controlPoint1, t);
    var p11 = Point.lerp(controlPoint1, controlPoint2, t);
    var p12 = Point.lerp(controlPoint2, endPoint, t);
    // step 2
    var p20 = Point.lerp(p10, p11, t);
    var p21 = Point.lerp(p11, p12, t);
    // step 3
    var p30 = Point.lerp(p20, p21, t);

    return {
      left:  [startPoint, p10, p20, p30],
      right: [p30, p21, p12, endPoint]
    };
  };

  /**
   * Returns an array containing the segments-length of each sub-path.
   * @param {Array} segments The segments to be counted.
   * @returns {Array} An array listing the length of each sub-path
   */
  CurvedPath.countSubPaths = function(segments) {

    var counts = [],
        count = 0;

    for (var i = 0, l = segments.length; i < l; ++i) {
      if (segments[i][0] === 'closePath' || i === l - 1) {
        counts.push(count + 1);
        count = 0;
        continue;
      }
      ++count;
    }

    return counts;
  },

  /**
   * Converts a single sub-path of segments to curveTo commands
   * @param {Array} segments An array of segments (representing a SINGLE sub-path). This means
   *  a moveTo->closePath progression or similar.
   * @param {Number} [requiredCurves] Number of required curves. We will add null curves (evenly
   *  distributed) to ensure that the returned curved-segments array has this number of segments.
   * @returns New segments (curved) array
   */
  CurvedPath.subPathToCurves = function(segments, requiredCurves) {

    var cp = new CurvedPath(),
        curvedSegments = cp._segments,
        curvedSegmentsLength,
        distributionAmount,
        distributionStep,
        distributionRemainder,
        hasEndingClosePath = false,
        segment,
        segmentType;

    if (!segments) {
      return [];
    }

    if (!segments.length && requiredCurves) {
      // We need to return a sub-path of `requiredCurves` length, so we
      // create a blank sub-path:
      segments = [['moveTo', 0, 0], ['closePath']];
    }

    for (var i = 0, l = segments.length; i < l; ++i) {

      segment = segments[i];
      segmentType = segment[0];

      if (segmentType) {
        cp[segmentType].apply(cp, segment.slice(1));
      }
    }

    // If we don't have enough curves, we need to generate and evenly
    // distribute null curves.

    curvedSegmentsLength = curvedSegments.length;

    hasEndingClosePath = curvedSegmentsLength &&
      curvedSegments[curvedSegmentsLength - 1][0] === 'closePath';

    if (curvedSegmentsLength < requiredCurves) {

      requiredCurves = requiredCurves - curvedSegmentsLength;

      if (hasEndingClosePath) {
        // If closePath is the last command then we don't want to insert
        // any nullCurves beyond it. So decrement the segments-length so it
        // seems like it's not there:
        curvedSegmentsLength--;
      }

      // We calculate how many null-curves we have to insert (distributionAmount)
      // and how often (distributionStep). E.g. a distAmount of 2 and a distStep of 1
      // would mean inserting 2 nullCurves at every segment.

      distributionStep = Math.ceil(curvedSegmentsLength / requiredCurves);
      distributionAmount = Math.ceil(1 / (curvedSegmentsLength / requiredCurves));

      outer: for (var i = curvedSegmentsLength - 1; i >= 0; i -= distributionStep) {
        for (var x = distributionAmount; x--;) {
          if (requiredCurves--) {
            cp.nullCurve(i);
          } else {
            // We're complete, exit:
            break outer;
          }
        }
      }

      curvedSegmentsLength = curvedSegments.length;

      // (In the situation that we still have requiredCurves left:)
      // Finish off remaining curves by inserting nullCurves at the end
      while (requiredCurves-- > 0) {
        cp.nullCurve(
          hasEndingClosePath ?
            // Place before ending closePath:
            curvedSegmentsLength - 2 :
            // Place directly at end:
            curvedSegmentsLength - 1
        );
      }
    }

    return curvedSegments;
  };

  /**
   * Converts segments to curveTo commands
   * @param {Array} segments An array of segments
   * @param {Array|Number} [requiredCurves] Number of required curves. If it's a number
   *  then it is assumed to be the desired length of the first and only sub-path. If it's an
   *  an array then it is assumed to be a list of numbers indicating the desired length of each
   *  sub-path. So, passing, [2,3] says you want two sub-paths, one with a lengh of 2, the other
   *  with a length of 3.
   * @returns New segments array
   */
  CurvedPath.toCurves = function(segments, requiredCounts) {

    if (!tools.isArray(segments)) {
      return [];
    }

    if (!tools.isArray(requiredCounts)) {
      requiredCounts = [requiredCounts];
    }

    var segmentCounts = CurvedPath.countSubPaths(segments),
        curvedSegments = [],
        maxSubPathLength = Math.max(segmentCounts.length, requiredCounts.length);

    for (var i = 0, l = maxSubPathLength; i < l; ++i) {
      // Build up curvedSegments with result of each subPathToCurves operation
      curvedSegments = curvedSegments.concat(
        CurvedPath.subPathToCurves(
          segments.splice(0, segmentCounts[i]),
          requiredCounts[i]
        )
      );
    }

    return curvedSegments;
  };

  /** 
   * Calculates the potential bounds of a single cubic bezier curve
   * @param {Array} p0 The starting point of the curve in the form [x, y]
   * @param {Array} curve A curveTo segment (e.g. `['curveTo',n,n,n,n,n,n]`)
   */
  CurvedPath.getBoundsOfCurve = function(p0x, p0y, cp1x, cp1y, cp2x, cp2y, p1x, p1y) {

    var p0 = [p0x, p0y];
    var p1 = [cp1x, cp1y];
    var p2 = [cp2x, cp2y];
    var p3 = [p1x, p1y];
    var bounds = [[], []];

    bounds[0].push(p0x);
    bounds[1].push(p0y);
    bounds[0].push(p3[0]);
    bounds[1].push(p3[1]);

    for (var i = 0; i < 2; ++i) {
      var b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i];
      var a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i];
      var c = 3 * p1[i] - 3 * p0[i];
      if (a == 0) {
        if (b == 0) {
          continue;
        }
        var t = -c / b;
        if (0 < t && t < 1) {
          bounds[i].push(f(t));
        }
        continue;
      }
      var b2ac = pow(b, 2) - 4 * c * a;
      if (b2ac < 0) {
        continue;
      }
      var t1 = (-b + sqrt(b2ac))/(2 * a);
      if (0 < t1 && t1 < 1) bounds[i].push(f(t1));
      var t2 = (-b - sqrt(b2ac))/(2 * a);
      if (0 < t2 && t2 < 1) bounds[i].push(f(t2));
    }

    // Return bounds in the form `[ xBoundsArray, yBoundsArray ]`
    return {
      left: min.apply(null, bounds[0]),
      top: min.apply(null, bounds[1]),
      right: max.apply(null, bounds[0]),
      bottom: max.apply(null, bounds[1])
    };

    function f(t) {
      return pow(1-t, 3) * p0[i] 
        + 3 * pow(1-t, 2) * t * p1[i] 
        + 3 * (1-t) * pow(t, 2) * p2[i]
        + pow(t, 3) * p3[i];
    }
  };

  CurvedPath.fromArc = function(x1, y1, rx, ry, angle, large, sweep, x2, y2) {

    // If the endpoints (x1, y1) and (x2, y2) are identical,
    // then this is equivalent to omitting the elliptical arc segment entirely.
    if (x1 === x2 && y1 === y2) {
      return;
    }

    // If rx = 0 or ry = 0 then this arc is treated as a straight
    // line segment (a "lineto") joining the endpoints.
    if (rx === 0 || ry === 0) {
      return ['lineTo', x, y];
    }

    // If rx or ry have negative signs, these are dropped; the absolute value is used instead.
    rx = abs(rx);
    ry = abs(ry);

    // angle is taken mod 360 degrees.
    angle = angle % 360;

    // Any nonzero value for either of the flags fA or fS is taken to mean the value 1.
    large = !!large;
    sweep = !!sweep;
  };

  return CurvedPath;
});
