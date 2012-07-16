define([
  '../point',
  './curved_path',
  '../segment_helper',
  './display_object',
  '../tools',
  '../color',
  './gradient',
  './bitmap'
], function(
  Point, CurvedPath, SegmentHelper, DisplayObject, tools,
  color, parseGradient, Bitmap
) {
  'use strict';

  var accessor = tools.descriptorAccessor,
      data = tools.descriptorData,
      getter = tools.getter,
      isArray = tools.isArray;
  var parseColor = color.parse;
  var exportToPath = SegmentHelper.exportToPath,
      validTokens = SegmentHelper.validTokens,
      parsePath = SegmentHelper.parsePath,
      parseCommandList = SegmentHelper.parseCommandList;
  var abs = Math.abs,
      cos = Math.cos,
      pow = Math.pow,
      PI = Math.PI,
      PI2 = PI * 2, // full circle
      sin = Math.sin,
      sqrt = Math.sqrt;

  // attributes section needs documentation

  function getFillColor() {
    return this._fillColor; // return color instance
  }
  function setFillColor(fill) {
    this._fillColor = parseColor(fill, this._fillColor);
  }

  function getFillGradient() {
    return this._fillGradient;
  }
  function setFillGradient(grad) {
    if (grad) {
      this._fillGradient = parseGradient(grad);
    } else {
      this._fillGradient = null;
    }
  }

  function getFillImage() {
    return this._fillImage;
  }
  function setFillImage(img) {

    var owner = this._owner;

    owner._mutatedAttributes.fillImageId = true;

    if (!img) {
      this._fillImage && DisplayObject.unregisterOffStageObj(owner, this._fillImage);
      this._fillImage = null;
      this._fillImageId = null;
      return;
    }

    if (!(img instanceof Bitmap)) {
      throw Error('img is not instance of Bitmap.');
    }

    if (owner.stage) {
      DisplayObject.registerOffStageObj(owner, img, owner.stage, 'fillImage');
    }

    this._fillImageId = img.id;
    this._fillImage = img;
  }

  function getFillRepeat() {
    return this._fillRepeat;
  }
  function setFillRepeat(repeat) {
    var isArr = tools.isArray(repeat);
    if (!repeat) {
      repeat = 1;
    }
    if (
      (isArr && !isNaN(repeat[0]) && !isNaN(repeat[1])) ||
      !isNaN(repeat)
    ) {
      this._fillRepeat = isArr ? repeat : [repeat, repeat];
    } else {
      throw Error('repeat argument must be a number or an array [n, n].');
    }
  }

  var getLineColor = getter('_lineColor');
  function setLineColor(color) {
    this._lineColor = parseColor(color, this._lineColor);
  }

  function getLineGradient() {
    return this._lineGradient;
  }
  function setLineGradient(grad) {
    if (grad) {
      this._lineGradient = parseGradient(grad);
    } else {
      this._lineGradient = null;
    }
  }

  var getCap = getter('_cap');
  function setCap(cap) {
    if (cap === 'butt' || cap === 'round' || cap === 'square') {
      this._cap = '' + cap;
    }
  }

  var getJoin = getter('_join');
  function setJoin(join) {
    if (join === 'miter' || join === 'round' || join === 'bevel') {
      this._join = '' + join;
    }
  }

  var getMiterLimit = getter('_miterLimit');
  function setMiterLimit(miterLimit) {
    if (miterLimit >= 1) {
      this._miterLimit = +miterLimit;
    }
  }

  function getSegments() {
    return this._owner._segments;
  }

  function setSegments(s) {
    this._owner._segments = s;
    this._owner.markUpdate('shapeData');
  }

  /*
  What is a Segment:
  - Segment is an Array (implemented)
  [type, [currentPoint [, attributes], endPoint]

  - Segment is an Object (not implemented yet)
  Object.create(null, {
    type : { value : 'type'},
    currentPoint : { value : null},
    endPoint : { value : null},
    attributes : { value : null}
  });
  One of the advantages of endpoint parameterization is that it permits a consistent
  path syntax in which all path commands end in the coordinates of the new "current point".
  */

  /**
   * The Shape Module/Contructor
   *
   * @constructor
   * @name Shape
   * @extends DisplayObject
   * @returns {Shape} A new Instance of Shape
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {string} __supportedAttributes__.cap The shape to be used at the end of open Path items, when they have a stroke. Can be one of 'round', 'square', 'butt'. Default: 'butt'
   * @property {string} __supportedAttributes__.fillColor The fill color. Default: black.
   * @property {string} __supportedAttributes__.fill Alias for fillColor
   * @property {string} __supportedAttributes__.fillGradient The fill gradient. Defaults: nothing
   * @property {string} __supportedAttributes__.join The shape to be used at the corners of paths. Can be one of 'miter', 'round', 'bevel'. Default: 'miter'
   * @property {string} __supportedAttributes__.line The line color. Default: transparent
   * @property {number} __supportedAttributes__.lineWidth The line width. Default: 0
   * @property {number} __supportedAttributes__.miterLimit The miter limit of the stroke. Default: 4
   *
   */
   function Shape(param) {
    // calling parent constructor
    DisplayObject.call(this);
    // define default properties
    Object.defineProperties(this._attributes, {
      _cap: data('butt', true),
      cap: accessor(getCap, setCap, true),

      _fillColor: data(0, true), // transparent by default
      fillColor: accessor(getFillColor, setFillColor, true),
      _fillGradient: data(undefined, true),
      fillGradient: accessor(getFillGradient, setFillGradient, true),
      _fillImage: data(null, true),
      _fillImageId: data(null, true),
      fillImage: accessor(getFillImage, setFillImage, true),
      _fillRepeat: data([1,1], true),
      fillRepeat: accessor(getFillRepeat, setFillRepeat, true),
      fillOpacity: data(1, true, true),
      lineOpacity: data(1, true, true),

      _join: data('miter', true),
      join: accessor(getJoin, setJoin, true),
      _lineColor: data(0x000000ff, true), // black by default
      lineColor: accessor(getLineColor, setLineColor, true),
      _lineGradient: data(undefined, true),
      lineGradient: accessor(getLineGradient, setLineGradient, true),
      lineWidth: data(0, true, true),
      _miterLimit: data(4, true),
      miterLimit: accessor(getMiterLimit, setMiterLimit, true),

      segments: accessor(getSegments, setSegments, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.cap = '_cap';
    rendererAttributes.fillColor = '_fillColor';
    rendererAttributes.lineColor = '_lineColor';
    rendererAttributes.lineGradient = '_lineGradient';
    rendererAttributes.fillGradient = '_fillGradient';
    rendererAttributes.fillImageId = '_fillImageId';
    rendererAttributes.fillRepeat = '_fillRepeat';
    rendererAttributes.fillOpacity = 'fillOpacity';
    rendererAttributes.lineOpacity = 'lineOpacity';
    rendererAttributes.join = '_join';
    rendererAttributes.lineWidth = 'lineWidth';
    rendererAttributes.miterLimit = '_miterLimit';

    this.morphableAttributes = {
      x: 1,
      y: 1,
      segments: 1,
      fillColor: 1,
      lineColor: 1,
      lineWidth: 1,
      fillOpacity: 1,
      lineOpacity: 1,
      opacity: 1,
      fillGradient: 1,
      scale: 1,
      scaleX: 1,
      scaleY: 1,
      rotation: 1,
      filters: 1
    };

    this._segments = [];
    this._curve = new CurvedPath();

    // Initially, everything should be sent for rendering:
    this._mutatedAttributes = tools.mixin({}, this._renderAttributes);

    if (param) {
      // get first meaningful value
      // param could be a multidimensional array, an array or simply a string|number.
      var testee = isArray(param)
        ? isArray(param[0])
            ? param[0][0]
            : param[0]
        : param;

      //assuming a [command] or list of [command] or array of [command]
      if (validTokens.indexOf(testee) != -1) {
        return this.segments.apply(this, arguments);

      // assuming x,y or [x,y]
      } else if (typeof testee == 'number') {
        return this.points.apply(this, arguments);

      //assuming [path]
      } else if (typeof param == 'string') {
        return this.path(param);
      }

      // param is invalid
      throw TypeError('Expected array of segments or points, ' +
        'or SVG path string. Got "' + param + ' instead.');
    }
  }

  var superObject = DisplayObject.prototype;

  /** @lends Shape.prototype */
  var proto = Shape.prototype = Object.create(superObject);

  proto._activate = function(stage) {
    var returnValue = superObject._activate.apply(this, arguments);

    // Make sure we change the img's stage whenever
    // this displayObject's stage changes:
    var fillImage = this._attributes._fillImage;
    if (fillImage) {
      DisplayObject.registerOffStageObj(this, fillImage, stage, 'fillImage');
    }
    this.markUpdate('shapeData');

    return returnValue;
  };

  proto.markUpdate = function(updateSubject) {
    if (updateSubject === 'shapeData') {
      this._isShapeDataMutated = true;
    }
    return superObject.markUpdate.call(this);
  };

  /**
   * Returns a clone of the shape.
   *
   * @param {Object} [cloneOptions]
   * @param {boolean} [cloneOptions.attributes] Whether to clone attributes,
   *    not just segments.
   * @returns {Shape} A shape with identical segments to the instance.
   */
  proto.clone = function(cloneOptions) {
    var index = -1,
        segments = this._segments,
        length = segments.length,
        newSegments = new Array(length),
        newShape = new Shape;

    while (++index < length) {
      newSegments[index] = segments[index].slice();
    }
    if (cloneOptions && cloneOptions.attributes) {
      newShape.attr(this.attr());
    }
    return newShape.segments(newSegments);
  };

  /**
   * Sets the segments of the Shape and returns the current Shape instance.
   * Or returns a copy of all the contained segments of the Shape when no parameter is given.
   *
   * @example
   * myShape.segments();
   * myShape.segments('moveTo', 0, 0);
   * myShape.segments(['moveTo', 0, 0]);
   * myShape.segments([ ['moveTo', 0, 0], ['lineTo', 10, 10] ]);
   *
   * @param {Array} commands The commands
   * @returns {Array|Shape} An Array of segments or the current Shape instance.
   */
  proto.segments = function(segments) {
    if (arguments.length === 0) {
      return this._segments.slice().map(function(s) {
        return s.slice();
      });
    } else if (isArray(segments)) {
      if (isArray(segments[0])) {
        // 2-dimensional array, needs to be flattened
        var concat = segments.concat;
        segments = concat.call.apply(concat, segments);
      }
    } else if (typeof segments == 'string') {
      // expecting a list of string arguments
      segments = arguments;
    } else {
      throw new TypeError('Invalid parameter: ' + segments);
    }

    this._segments = parseCommandList(segments);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Sets the segments of the Shape and returns the current Shape instance.
   * Or returns a copy of all the contained segments of the Shape when no parameter is given.
   *
   * @example
   * myShape.points();
   * myShape.points(x,y);
   * myShape.points([x,y]);
   * myShape.points(x, y, x, y, x, y);
   *
   * @param {Array|Number} param An array of points or a list of points
   * @returns {Array|Shape} An array of points or the current Shape instance
   */
  proto.points = function(param) {
    if (typeof param == 'undefined') {
      // the last two segment-attributes are always the current point
      return this._segments.map(function(segment) {
          return segment.slice(-2);
      }).filter(Boolean); // filter out segments without point
    }
    param = isArray(param) ? param : arguments;
    for (var i = 0, x, y, len = param.length; i < len; i += 2) {
      x = param[i];
      y = param[i + 1];
      if (i) {
        this.lineTo(x, y);
      } else {
        this.clear().moveTo(x, y);
      }
    }

    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Sets the segments of the Shape and returns the current Shape instance.
   * Or returns a path representation of all the contained segments of the Shape when no parameter is given.
   *
   * @param {String} path A SVG Path (http://www.w3.org/TR/SVG/paths.html)
   * @returns {String|Shape} A path or the current Shape instance
   */
  proto.path = function(path) {
    var segments = this._segments;
    if (typeof path == 'undefined') {
      return exportToPath(segments);
    } else if (typeof path == 'string') {
      this._segments = parsePath(path);
      this.markUpdate('shapeData');
      return this;
    }
    throw new TypeError('Invalid parameter: ' + path);
  };

  /**
   * Appends a segment at the end of the list of segments and creates a new subpath.
   *
   * @param {Number} x absolute x-value
   * @param {Number} y absolute y-value
   * @returns {Shape} The current Shape instance
   */
  proto.moveTo = function(x, y) {
    if (!isFinite(x) || !isFinite(y)) {
      throw TypeError('moveTo needs two finite arguments');
    }

    var segments = this._segments;

    segments.push(['moveTo', x, y]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Appends a segment at the end of the list of segments and creates a new subpath.
   *
   * @param {Number} x relative x-value
   * @param {Number} y relative y-value
   * @returns {Shape} The current Shape instance
   */
  proto.moveBy = function(x, y) {
      if (!isFinite(x) || !isFinite(y)) {
        throw TypeError('moveBy needs two finite arguments');
      }

    var segments = this._segments;

    segments.push(['moveBy', x, y]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Appends a segment at the end of the list of segments, which describes a
   * close path.
   *
   * @returns {Shape} The current Shape instance
   */
  proto.closePath = function() {
    this._segments.push(['closePath']);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given absolute Point.
   *
   * @param {Number} x absolute x-value
   * @param {Number} y absolute y-value
   * @returns {Shape} The current Shape instance
   */
  proto.lineTo = function(x, y) {
    if (!isFinite(x) || !isFinite(y)) {
      throw TypeError('lineTo needs two finite arguments');
    }

    this._segments.push(['lineTo', x, y]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given relative Point.
   *
   * @param {Number} x relative x-value
   * @param {Number} y relative y-value
   * @returns {Shape} The current Shape instance
   */
  proto.lineBy = function(x, y) {
    if (!isFinite(x) || !isFinite(y)) {
      throw TypeError('lineBy needs two finite arguments');
    }

    this._segments.push(['lineBy', x, y]);
    this.markUpdate('shapeData');
    return this;
  };

/**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given absolute Point.
   *
   * @param {Number} y absolute y-value
   * @returns {Shape} The current Shape instance
   */
  proto.verticalLineTo = function(y) {
    var p = this.lastPoint();
    return this.lineTo(p[0], y); // lineTo takes care about validation
  };

/**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given relative Point.
   *
   * @param {Number} y relative y-value
   * @returns {Shape} The current Shape instance
   */
  proto.verticalLineBy = function(y) {
    return this.lineBy(0, y); // lineBy takes care about validation
  };

/**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given absolute Point.
   *
   * @param {Number} x absolute x-value
   * @returns {Shape} The current Shape instance
   */
  proto.horizontalLineTo = function(x) {
    var p = this.lastPoint();
    return this.lineTo(x, p[1]); // lineTo takes cate about validation
  };

/**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given relative Point.
   *
   * @param {Number} x relative x-value
   * @returns {Shape} The current Shape instance
   */
  proto.horizontalLineBy = function(x) {
    return this.lineBy(x, 0); // lineBy takes cate about validation
  };

  /**
   * Appends an bezier-curve segment. Appends a segment at the end of the list of contained segments.
   *
   * @see http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSegCurvetoCubicAbs
   * @param {Number} cp1x first control point x
   * @param {Number} cp1y first control point y
   * @param {Number} cp2x second control point x
   * @param {Number} cp2y second control point y
   * @param {Number} x x-value of the point
   * @param {Number} y y-value of the point
   * @returns {Shape} The current Shape instance
   */
  proto.curveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (arguments.length < 6) {
      throw Error('Incorrect number of arguments.');
    }
    this._segments.push([
      'curveTo',
      cp1x, cp1y, // Point
      cp2x, cp2y, // Point
      x, y // Point
    ]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Appends an bezier-curve segment. Appends a segment at the end of the list of contained segments.
   *
   * @see Shape.curveBy
   */
  proto.curveBy = function(cp1x, cp1y, cp2x, cp2y, x, y) {
    if (arguments.length < 6) {
      throw Error('Incorrect number of arguments.');
    }
    this._segments.push([
      'curveBy',
      cp1x, cp1y, // Point
      cp2x, cp2y, // Point
      x, y // Point
    ]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Adds a quadratic bezier curve to the shape. Coordinates are absolute
   * (i.e. relate to the coordinate system of the shape).
   *
   * @param {number} cpx x value of the control point
   * @param {number} cpy y value of the control point
   * @param {number} x x value of the anchor point
   * @param {number} y y value of the anchor point
   * @returns {this} the instance
   */

  proto.quadraticCurveTo = function(cpx, cpy, x, y) {
    if (arguments.length < 4) {
      throw Error('quadraticCurveTo needs 4 arguments');
    }
    this._segments.push([
      'quadraticCurveTo',
      cpx, cpy, // control point
      x, y // anchor point
    ]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Adds a quadratic bezier curve to the shape. Coordinates are relative
   * (i.e. relate to the end of the previous path segment).
   *
   * @param {number} cpx x value of the control point
   * @param {number} cpy y value of the control point
   * @param {number} x x value of the anchor point
   * @param {number} y y value of the anchor point
   * @returns {this} the instance
   */
  proto.quadraticCurveBy = function(cpx, cpy, x, y) {
    if (arguments.length < 4) {
      throw Error('quadraticCurveBy needs 4 arguments');
    }
    this._segments.push([
      'quadraticCurveBy',
      cpx, cpy, // control point
      x, y // anchor point
    ]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Adds an arc to the list of contained segments.
   * It provides the same API like SVG does.
   *
   * @param {Number} rx description
   * @param {Number} ry description
   * @param {Number} xAxisRotation description
   * @param {Boolean} largeArcFlag description
   * @param {Boolean} sweepFlag description
   * @param {Number} x description
   * @param {Number} y description
   * @returns {Shape} The current Shape instance
   */
  proto.arcTo = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this._segments.push(['arcTo', rx, ry /*Point*/, xAxisRotation, largeArcFlag, sweepFlag, x, y /*Point*/]);
    this.markUpdate('shapeData');
    return this;
  };


  /**
   * Adds an arc segment to the list of contained segments.
   * It provides the same API like SVG does.
   *
   * @param {Number} rx description
   * @param {Number} ry description
   * @param {Number} xAxisRotation description
   * @param {Boolean} largeArcFlag description
   * @param {Boolean} sweepFlag description
   * @param {Number} x description
   * @param {Number} y description
   * @returns {Shape} The current Shape instance
   */
  proto.arcBy = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this._segments.push(['arcBy', rx, ry /*Point*/, xAxisRotation, largeArcFlag, sweepFlag, x, y /*Point*/]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Adds an arc segment to the list of contained segments.
   *
   * @param {Number} x description
   * @param {Number} y description
   * @param {Number} r2adius description
   * @param {deg|rad} aStartAngle description (TODO deg)
   * @param {deg|rad} aEndAngle description (TODO deg)
   * @param {Boolean} [anticlockwise] description
   * @returns {Shape} The current Shape instance
   */
  proto.arc = function(x, y, radius, aStartAngle, aEndAngle, anticlockwise) {
    anticlockwise = !!anticlockwise;

    var startX, startY, endX, endY;
    var startAngle = (anticlockwise) ? aEndAngle : aStartAngle;
    var endAngle = (anticlockwise) ? PI2 - aStartAngle : aEndAngle;
    var diffAngle = abs(endAngle - startAngle);

    startX = x + radius * cos(startAngle);
    startY = y + radius * sin(startAngle);
    if (diffAngle < PI2) {
      endX = x + radius * cos(endAngle);
      endY = y + radius * sin(endAngle);
    } else { // angles differ by more than 2*PI: draw a full circle
      endX = startX;
      endY = startY - .0001;
    }

    return this[this._segments.length ? 'lineTo' : 'moveTo'](startX, startY)
      .arcTo(radius, radius, 0, (diffAngle < PI) ? 0 : 1, 1, endX, endY);
  };

  /**
   * Returns a new Shape instance with an rect.
   *
   * @param {Number} x The x position of the rect
   * @param {Number} y The y position of the rect
   * @param {Number} width The width of the rect
   * @param {Number} height The height of the rect
   * @param {Number|Array} radius rounded corner radius or an array of radiuses
   *  for each corner, in the order top-left, top-right, bottom-right, bottom-left
   * @returns {Shape} The current Shape instance
   */
  proto.rect = function(x, y, width, height, radius) {

    var bottomLeftRadius,
        bottomRightRadius,
        topLeftRadius,
        topRightRadius;

    if (radius) {

      topLeftRadius = radius[0] || radius;
      topRightRadius = radius[1] || radius;
      bottomRightRadius = radius[2] || radius;
      bottomLeftRadius = radius[3] || radius;

      this
        .moveTo(x, y + topLeftRadius)
        .arcBy(topLeftRadius, topLeftRadius, 0, 0, 1, topLeftRadius, -topLeftRadius)
        .lineBy(width - topLeftRadius - topRightRadius, 0)
        .arcBy(topRightRadius, topRightRadius, 0, 0, 1, topRightRadius, topRightRadius)
        .lineBy(0, height - topRightRadius - bottomRightRadius)
        .arcBy(bottomRightRadius, bottomRightRadius, 0, 0, 1, -bottomRightRadius, bottomRightRadius)
        .lineBy(-(width - bottomLeftRadius - bottomRightRadius), 0)
        .arcBy(bottomLeftRadius, bottomLeftRadius, 0, 0, 1, -bottomLeftRadius, -bottomLeftRadius);
    } else {
      this
        .moveTo(x, y)
        .lineBy(width, 0)
        .lineBy(0, height)
        .lineBy(-width, 0);
    }

    return this.closePath();
  };

  /**
   * Returns the bounding box of that {Shape}.
   *
   * @returns {Object} bb An object with x, y, width, height
   * @ignore
   */
  proto.boundingBox = function() {
    throw 'Not implemented';
  };

  /**
   * Returns a point at a certain length
   *
   * @see pathLength
   * @param {Number} length
   * @returns {Array} The x and y position
   */
  proto.pointAtLength = function(length) {
    throw 'Not implemented';
    //return {Point};
  };

  /**
   * Clears all segments.
   *
   * @returns {Shape} The current Shape instance
   */
  proto.clear = function() {
    this._segments.length = 0;
    this._curve.clear();
    return this;
  };

  //******************************** HELPER ************************************

  /**
   * Returns the last element of the segments array or throws a warning if the
   * segments array is empty.
   *
   * @returns {Array} The last segment of the segments array.
   */
  proto.lastSegment = function() {
    var seg = this._segments.slice(-1);
    if (typeof seg[0] != 'undefined') { //= array.length > 0
      return seg;
    } else {
      //TODO
      //console.warn('No segments defined.');
    }
  };

  /**
   * Returns the last point of the segments array or throws a warning if the
   * segments array is empty.
   *
   * @returns {Point} The last point of the segments array.
   */
  proto.lastPoint = function() {

    var segment, segType, segLen, absRegEx, relRegEx, segments, len;
    var x = 0, y = 0, searchMoveType = false;

    // get last segment of the current segment array
    var lastSegment = this._segments.slice(-1)[0];

    // in case we hit a absolute segment
    if (/To/.test(lastSegment[0])) {
      return lastSegment.slice(-2);
    }

    // in case we hit a relative segment or `closePath´ segment
    segments = this._segments, len = segments.length;

    while(len-->0) {
      segment = segments[len];
      segType = segment[0];
      segLen = segment.length;
      absRegEx = searchMoveType ? /moveTo/ : /To/;
      relRegEx = searchMoveType ? /moveBy/ : /By/;

      if (absRegEx.test(segType)) {
        // return x and y when the current segment is absolute
        return [segment[segLen - 2] + x, segment[segLen - 1] + y];
      } else if (/close/.test(segType)) {
        // from here on we're skipping all segments until we reach
        // a `moveTo` or `moveBy`
        searchMoveType = true;
      } else if (relRegEx.test(segType)) {
        // save the addition of all relative segments
        x += segment[segLen - 2];
        y += segment[segLen - 1];
      }
    };
    // when we completely walked through all the points
    throw new Error('Could not find a point.');
  };

  /**
   * The type of the given instance.
   */
  proto.type = 'Shape';

  /**
   * Collects and returns specific data for the renderer.
   *
   * For the Shape class, this is the segments information.
   *
   * @private
   * @return {void|Array} The additional data for the renderer.
   */
  proto._getRenderData = function() {
    if (!this._isShapeDataMutated) {
      return;
    }

    var item, segment, serialized;
    var data = [], segments = this._segments;
    for (var i = 0, iMax = segments.length; i < iMax; i++) {
      segment = segments[i];
      serialized = [];
      for (var j = 0, jMax = segment.length; j < jMax; j++) {
        item = segment[j];
        serialized.push(j && item instanceof Point ? [item.x, item.y] : item);
      }
      data.push(serialized);
    }
    this._isShapeDataMutated = false;

    return data;
  };

  /**
   * Converts segments to absolute bezier curve instructions (curveTo)
   *
   * @param {Number} [requiredCurves] Number of curves required
   */
  proto.toCurves = function(requiredCurves) {
    this._segments = CurvedPath.toCurves(this._segments, requiredCurves);
  };

  /**
   * Morphs segments to that of another shapes, along with other attrs
   *
   * @param {Shape} that The Shape to morph to (all morphable attributes
   *  will morph)
   * @param {Number} duration The duration of the morph animation. Available
   *  formats are _s (seconds), _ms (milliseconds), _ (frames - no unit)
   * @param {Object} [animOptions] Additional options to pass to the animation,
   *  e.g. `{easing: ..., onEnd: function(){...}}`
   */
  proto.morphTo = function(that, duration, animOptions) {

    // Do toCurves once to establish any arcTo->curves
    // arcTo will result in 1-4 curves, (we need this before the max calc below)
    this.toCurves();
    that.toCurves();

    var thisSubPathCount = CurvedPath.countSubPaths(this._segments),
        thatSubPathCount = CurvedPath.countSubPaths(that._segments),
        thisIsGreater = thisSubPathCount.length > thatSubPathCount.length,

        // We want a segments-counts array with the highest amount in each sub-path.
        //  So if this._segments has three sub-paths of lengths: 3, 6, 3
        // And if that._segments has three sub-paths of lengths: 5, 3, 3
        //               Then the resulting maxSegments will be: 5, 6, 3
        // We will then convert both `this` and `that` to have sub-paths with those
        // lengths defined in `maxSegments`.

        shorter = thisIsGreater ? thatSubPathCount : thisSubPathCount,
        longer = thisIsGreater ? thisSubPathCount : thatSubPathCount,
        maxSegments = longer.map(function(n, i) {
          return shorter[i] > n ? shorter[i] : n;
        }),
        attr;

    // We need both shapes to be of equal segment-length, so each segment
    // can animate to its corresponding segment in the target shape
    this.toCurves(maxSegments);
    that.toCurves(maxSegments);

    attr = that.attr();

    for (var i in attr) {
      if (null == attr[i] || !(i in this.morphableAttributes)) {
        delete attr[i];
      }
    }

    return this.animate(duration, attr, animOptions);
  };

  /**
   * Morphs segments to that of another shapes
   *
   * @param {Shape} that The Shape to morph to (only segments will morph)
   * @param {Number} duration The duration of the morph animation. Available
   *  formats are _s (seconds), _ms (milliseconds), _ (frames - no unit)
   * @param {Object} [animOptions] Additional options to pass to the animation,
   *  e.g. `{easing: ..., onEnd: function(){...}}`
   */
  proto.morphSegmentsTo = function(that, duration, animOptions) {

    // Do toCurves once to establish any arcTo->curves
    // arcTo will result in 1-4 curves, (we need this before the max calc below)
    this.toCurves();
    that.toCurves();

    var maxSegments = Math.max(that._segments.length, this._segments.length);

    // We need both shapes to be of equal segment-length, so each segment
    // can animate to its corresponding segment in the target shape
    this.toCurves(maxSegments);
    that.toCurves(maxSegments);

    return this.animate(duration, {
      segments: that.attr('segments')
    }, animOptions);
  };

  /**
   * Transforms segments to absolute segments. i.e. lineBy->lineTo etc.
   *
   * @memberOf Shape
   * @param {Array} Segments array
   * @returns {Array} New absolute segments array
   */
   Shape.toAbsolute = function(segments) {
    var segmentsLength = segments && segments.length;

    if (!segmentsLength) {
      return [['moveTo', 0, 0]];
    }

    var mx = 0;
    var my = 0;
    var res = [];
    var start = 0;
    var x = 0;
    var y = 0;

    if (segments[0][0] == 'moveTo') {
      x = segments[0][1];
      y = segments[0][2];
      mx = x;
      my = y;
      start++;
      res[0] = ['moveTo', x, y];
    }
    for (var r, pa, j, paLength, segType, i = start; i < segmentsLength; i++) {

      // add a segment-copy
      res.push(r = []);

      // the current segment
      pa = segments[i];
      paLength = pa.length;
      segType = pa[0];

      // if the segment-type is relative
      // convert all relative to absolute values.
      // add the absolute values to the result-array
      if (/By/.test(segType)) { // start at index 3 (arc{3}By)
        r[0] = segType.replace(/By/,'To');
        switch (segType) {
          case 'arcBy':
            r[1] = pa[1];
            r[2] = pa[2];
            r[3] = pa[3];
            r[4] = pa[4];
            r[5] = pa[5];
            r[6] = (pa[6] + x);
            r[7] = (pa[7] + y);
            break;
          case 'verticalLineBy':
            r[1] = pa[1] + y;
            break;
          case 'horizontalLineBy':
            r[1] = pa[1] + x;
            break;
          case 'moveBy':
            mx = pa[1] + x;
            my = pa[2] + y;
          default:
            for (var j = 1; j < paLength; j++) {
                r[j] = pa[j] + ((j % 2) ? x : y); // TODO: should be rounded
            }
        }
      } else {
        // add existing absolute values to the result-array
        for (var k = 0, kk = paLength; k < kk; k++) {
          r[k] = pa[k];
        }
      }
      switch (r[0]) {
        case 'closePath':
          x = mx;
          y = my;
          break;
        case 'horizontalLineTo':
          x = r[1];
          break;
        case 'verticalLineTo':
          y = r[1];
          break;
        case 'moveTo':
          mx = r[r.length - 2];
          my = r[r.length - 1];
        default:
          x = r[r.length - 2];
          y = r[r.length - 1];
      }
    }
    return res;
  };


  /************************* Factories & Abstractions *************************/

  /**
   * Returns a new Shape instance with an arc.
   *
   * @example
   * Shape.arc(75, 75, 75, 0, 2*Math.PI); // circle
   * Shape.arc(75, 75, 75, 0, 360); // circle TODO
   *
   * @see proto.arc
   * @memberOf Shape
   * @returns {Shape} A new Shape instance
   */
  Shape.arc = function(x, y, radius, aStartAngle, aEndAngle, anticlockwise) {
    return new Shape().arc(x, y, radius, aStartAngle, aEndAngle, anticlockwise);
  };

  /**
   * Returns a new Shape instance with a circle.
   *
   * @memberOf Shape
   * @param {Number} x description
   * @param {Number} y description
   * @param {Number} radius description
   * @returns {Shape} A new Shape instance
   */
  Shape.circle = function(x, y, radius) {
    return Shape.ellipse(x, y, radius, radius);
  };

  Shape.ellipse = function(centerX, centerY, radiusX, radiusY) {
      return new Shape()
        .moveTo(radiusX, 0)
        .arcTo(radiusX, radiusY, 0, 0, 0, -radiusX, 0)
        .arcTo(radiusX, radiusY, 0, 0, 0, radiusX, 0)
        .attr({x: centerX, y: centerY});
  };

  /**
   * Returns a new Shape instance with an rect.
   *
   * @example
   * bs.Shape.rect(0, 0, 150, 150);
   *
   * @memberOf Shape
   * @param {Number} x The x position of the rect
   * @param {Number} y The y position of the rect
   * @param {Number} width The width of the rect
   * @param {Number} height The height of the rect
   * @param {Number} radius rounded corners
   * @returns {Shape} A new Shape instance
   */
  Shape.rect = function(x, y, width, height, radius) {
    return new Shape()
      .attr({origin: {x: width / 2, y: height / 2}, x: x, y: y})
      .rect(0, 0, width, height, radius);
  };

  /**
   * Returns a Shape instance containing a regular polygon.
   *
   * @memberOf Shape
   * @param {number} x The horizontal offset/translation of the polygon center.
   * @param {number} y The vertical offset/translation of the polygon center.
   * @param {number} radius The radius of the polygon
   * @param {number} sides The number of sides of the polygon. Must be > 3
   * @returns {Shape} A shape instance
   */
  Shape.polygon = function(x, y, radius, sides) {
    if (!(sides >= 3)) { // >= catches NaN, null, etc.
      throw RangeError('A polygon needs at least 3 sides.');
    }

    sides >>>= 0; // floor number of sides, max number of sides is 4294967295
    var shape = new Shape().attr({x: x, y: y});

    // start at 12 o'clock, continue clockwise
    shape.moveTo(0, -radius);
    for (var i = 1, current; i < sides; i++) {
      current = PI2 * i / sides;
      shape.lineTo(sin(current) * radius, -cos(current) * radius);
    }
    shape.closePath();

    return shape;
  };

  /**
   * Returns a Shape instance containing a star.
   *
   * @memberOf Shape
   * @param {number} x The horizontal offset/translation of the star center.
   * @param {number} y The vertical offset/translation of the star center.
   * @param {number} radius The radius of the star
   * @param {number} rays The number of rays of the star. Must be > 3
   * @param {number} [factor] determines the star "pointiness".
   *    0: all rays start at (0, 0)
   *    1: the star looks like a regular polygon: 3 vertices are on a line.
   *    If omitted, a regular star is created
   * @returns {Shape} A shape instance
   */
  Shape.star = function(x, y, radius, rays, factor) {
    if (!(rays >= 3)) { // >= catches NaN, null, etc.
      throw RangeError('A star needs at least 3 rays.');
    }

    // use a shape as starting point
    var shape = Shape.polygon(x, y, radius, rays);

    // make a star from it by inserting points
    var segments = shape.segments();
    var from = segments[0], to;
    var starSegments = [from.slice()];

    /*
      If factor is not given, we default to a regular star.

      We create a regular star by connecting every `floor((rays - 1) / 2)` ray
      end point verteces.
    */
    if (!(factor >= 0 || factor < 0)) { // catches NaN, undefined etc.
      var b = segments[rays / 2 - .5 | 0];
      var ax = 0, ay = from[2], bx = b[1], by = b[2];
      to = segments[1];
      var qx = (ax + to[1]) / 2, qy = (ay + to[2]) / 2;

      //     y = x * (by - ay) / bx - radius
      //  && y = x * qy / qx
      //  => x * qy / qx = x * (by - ay) / bx + radius
      // <=> x = (qx * bx * -radius) / (qy * bx - qx * by + qx * ay)
      var ix = (qx * bx * -radius) / (qy * bx - qx * by + qx * ay);
      factor = ix / qx;
    }

    for (var i = 0; i < rays; i++) {
      to = segments[(i + 1) % rays];
      var fromX = from[1], fromY = from[2], toX = to[1], toY = to[2];
      starSegments.push(
        ['lineTo', (fromX + toX) / 2 * factor, (fromY + toY) / 2 * factor],
        to
      );

      from = to;
    }

    to[0] = 'closePath';
    to.length = 1;

    return shape.segments(starSegments);
  };

  /**
   * Returns dimensions/location of the shape
   *
   * @param {String} key "size" for the full dimensions object or one of "top",
   *  "bottom", "left", "right", "width", "height"
   * @returns {Object|Number} If you passed "size" as the key then an object
   *  will be returned, otherwise a number
   */
  proto.getComputed = function(key) {
    /*
      TODO: this is an extremely simplified algorithm that might yield incorrect
      results.

      It loops over all segments (normalized to cubic bezier curves) and simply
      uses all points.

      To achieve correct results, the extrema of those curves need to be
      calculated.

      This may be achieved by converting the curves to their polynomial form
      and computing the derivative.

      More information:
      http://stackoverflow.com/questions/2587751/an-algorithm-to-find-bounding-box-of-closed-bezier-curves
      https://www.google.com/search?q=derivative+cubic+bezier
     */
    // results
    var size = {top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0};
    var curves = CurvedPath.toCurves(this.attr('segments').slice());
    var isFirst = true;
    var max = Math.max, min = Math.min;
    for (var i = 0, curve; (curve = curves[i]); i += 1) {
      if (curve[0] !== 'closePath') {
        for (var j = 1, len = curve.length; j < len; j += 2) {
          var x = curve[j], y = curve[j + 1];
          size.top = isFirst ? y : min(size.top, y);
          size.right = isFirst ? x : max(size.right, x);
          size.bottom = isFirst ? y : max(size.bottom, y);
          size.left = isFirst ? x : min(size.left, x);

          isFirst = false;
        }
      }
    }

    x = this.attr('x');
    y = this.attr('y');

    size.top += y;
    size.right += x;
    size.bottom += y;
    size.left += x;
    size.width = size.right - size.left;
    size.height = size.bottom - size.top;

    return key === 'size' ? size : size[key];
  };

  return Shape;
});
