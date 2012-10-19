define([
  '../../point',
  './curved_path',
  '../../segment_helper',
  '../display_object',
  '../../tools',
  '../../color',
  '../gradient',
  '../bitmap'
], function(
  Point, CurvedPath, SegmentHelper, DisplayObject, tools,
  color, gradient, Bitmap
) {
  'use strict';

  /** @module path */

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
      sqrt = Math.sqrt,
      min = Math.min,
      max = Math.max;

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
      this._fillGradient = gradient(grad);
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

  var getStrokeColor = getter('_strokeColor');
  function setStrokeColor(color) {
    this._strokeColor = parseColor(color, this._strokeColor);
  }

  function getStrokeGradient() {
    return this._strokeGradient;
  }
  function setStrokeGradient(grad) {
    if (grad) {
      this._strokeGradient = gradient(grad);
    } else {
      this._strokeGradient = null;
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
   * The Path Module/Contructor
   *
   * @constructor
   * @name Path
   * @memberOf module:path
   * @extends DisplayObject
   * @returns {Path} A new Instance of Path
   *
   * @property {__list__} __supportedAttributes__ List of supported attribute names.
   *    In addition to the property names listed for DisplayObject,
   *    these are the attribute names you can pass to the attr() method. Note
   *    that this property is not available in your code, it's just here for
   *    documentation purposes.
   * @property {String} __supportedAttributes__.cap The shape to be used at the end of open Path items, when they have a stroke. Can be one of 'round', 'square', 'butt'. Default: 'butt'
   * @property {String} __supportedAttributes__.fillColor The fill color. Default: black.
   * @property {gradient.LinearGradient|gradient.RadialGradient} __supportedAttributes__.fillGradient The fill gradient. Defaults: nothing\
   * @property {Bitmap} __supportedAttributes__.fillImage The fill image. Default: nothing
   * @property {Array|Number} __supportedAttributes__.fillRepeat Number of times to repeat the fill-image/gradient both horizontally and vertically. Default: [1,1]
   * @property {String} __supportedAttributes__.join The shape to be used at the corners of paths. Can be one of 'miter', 'round', 'bevel'. Default: 'miter'
   * @property {String} __supportedAttributes__.strokeColor The line color. Default: transparent
   * @property {gradient.LinearGradient|gradient.RadialGradient} __supportedAttributes__.strokeGradient The line gradient. Default: nothing
   * @property {Number} __supportedAttributes__.strokeWidth The line width. Default: 0
   * @property {Number} __supportedAttributes__.miterLimit The miter limit of the stroke. Default: 4
   *
   */
   function Path(param) {
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
      strokeOpacity: data(1, true, true),

      _join: data('miter', true),
      join: accessor(getJoin, setJoin, true),
      _strokeColor: data(0x000000ff, true), // black by default
      strokeColor: accessor(getStrokeColor, setStrokeColor, true),
      _strokeGradient: data(undefined, true),
      strokeGradient: accessor(getStrokeGradient, setStrokeGradient, true),
      strokeWidth: data(0, true, true),
      _miterLimit: data(4, true),
      miterLimit: accessor(getMiterLimit, setMiterLimit, true),

      segments: accessor(getSegments, setSegments, true)
    });

    var rendererAttributes = this._renderAttributes;
    rendererAttributes.cap = '_cap';
    rendererAttributes.fillColor = '_fillColor';
    rendererAttributes.strokeColor = '_strokeColor';
    rendererAttributes.strokeGradient = '_strokeGradient';
    rendererAttributes.fillGradient = '_fillGradient';
    rendererAttributes.fillImageId = '_fillImageId';
    rendererAttributes.fillRepeat = '_fillRepeat';
    rendererAttributes.fillOpacity = 'fillOpacity';
    rendererAttributes.strokeOpacity = 'strokeOpacity';
    rendererAttributes.join = '_join';
    rendererAttributes.strokeWidth = 'strokeWidth';
    rendererAttributes.miterLimit = '_miterLimit';

    this.morphableAttributes = {
      x: 1,
      y: 1,
      segments: 1,
      fillColor: 1,
      strokeColor: 1,
      strokeWidth: 1,
      fillOpacity: 1,
      strokeOpacity: 1,
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

  /** @lends module:path.Path.prototype */
  var proto = Path.prototype = Object.create(superObject);

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
      this._isPathDataMutated = true;
    }
    return superObject.markUpdate.call(this);
  };

  /**
   * Returns a clone of the shape.
   *
   * @param {Object} [cloneOptions]
   * @param {boolean} [cloneOptions.attributes] Whether to clone attributes,
   *    not just segments.
   * @returns {Path} A shape with identical segments to the instance.
   */
  proto.clone = function(cloneOptions) {
    var index = -1,
        segments = this._segments,
        length = segments.length,
        newSegments = new Array(length),
        newPath = new Path;

    while (++index < length) {
      newSegments[index] = segments[index].slice();
    }
    if (cloneOptions && cloneOptions.attributes) {
      newPath.attr(this.attr());
    }
    return newPath.segments(newSegments);
  };

  /**
   * Sets the segments of the Path and returns the current Path instance.
   * Or returns a copy of all the contained segments of the Path when no parameter is given.
   *
   * @example
   * myPath.segments();
   * myPath.segments('moveTo', 0, 0);
   * myPath.segments(['moveTo', 0, 0]);
   * myPath.segments([ ['moveTo', 0, 0], ['lineTo', 10, 10] ]);
   *
   * @param {Array} commands The commands
   * @returns {Array|Path} An Array of segments or the current Path instance.
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
   * Sets the segments of the Path and returns the current Path instance.
   * Or returns a copy of all the contained segments of the Path when no parameter is given.
   *
   * @example
   * myPath.points();
   * myPath.points(x,y);
   * myPath.points([x,y]);
   * myPath.points(x, y, x, y, x, y);
   *
   * @param {Array|Number} param An array of points or a list of points
   * @returns {Array|Path} An array of points or the current Path instance
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
   * Sets the segments of the Path and returns the current Path instance.
   * Or returns a path representation of all the contained segments of the Path when no parameter is given.
   *
   * @param {String} path A SVG Path (http://www.w3.org/TR/SVG/paths.html)
   * @returns {String|Path} A path or the current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
   */
  proto.verticalLineBy = function(y) {
    return this.lineBy(0, y); // lineBy takes care about validation
  };

/**
   * Appends a segment at the end of the list of segments, which describes a
   * straight line from the last Point to the given absolute Point.
   *
   * @param {Number} x absolute x-value
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @returns {Path} The current Path instance
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
   * @see http://www.w3.org/TR/SVG/paths.html#InterfaceSVGPathSegCurvetoCubicRel
   * @param {Number} cp1x (Relative) first control point x
   * @param {Number} cp1y (Relative) first control point y
   * @param {Number} cp2x (Relative) second control point x
   * @param {Number} cp2y (Relative) second control point y
   * @param {Number} x (Relative) x-value of the point
   * @param {Number} y (Relative) y-value of the point
   * @returns {Path} The current Path instance
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
   * @param {Number} rx The x-axis radius for the ellipse
   * @param {Number} ry The y-axis radius for the ellipse
   * @param {Number} xAxisRotation The rotation angle in radians for the
   *  ellipse's x-axis relative to the x-axis of the stage's {0,0}
   * @param {Boolean} largeArcFlag Defines the way in which the arc is drawn
   *  from its starting point to its ending point. See
   *  http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for
   *  details
   * @param {Boolean} sweepFlag Defines the way in which the arc is drawn
   *  from its starting point to its ending point. See
   *  http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for
   *  details
   * @param {Number} x X-axis location of the end of the arc
   * @param {Number} y Y-axis location of the end of the arc
   * @returns {Path} The current Path instance
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
   * @param {Number} rx The relative x-axis radius for the ellipse
   * @param {Number} ry The relative y-axis radius for the ellipse
   * @param {Number} xAxisRotation The rotation angle in radians for the
   *  ellipse's x-axis relative to the x-axis of the stage's {0,0}
   * @param {Boolean} largeArcFlag Defines the way in which the arc is drawn
   *  from its starting point to its ending point. See
   *  http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for
   *  details
   * @param {Boolean} sweepFlag Defines the way in which the arc is drawn
   *  from its starting point to its ending point. See
   *  http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands for
   *  details
   * @param {Number} x Relative X-axis location of the end of the arc
   * @param {Number} y Relative Y-axis location of the end of the arc
   * @returns {Path} The current Path instance
   */
  proto.arcBy = function(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y) {
    this._segments.push(['arcBy', rx, ry /*Point*/, xAxisRotation, largeArcFlag, sweepFlag, x, y /*Point*/]);
    this.markUpdate('shapeData');
    return this;
  };

  /**
   * Adds an arc segment to the list of contained segments.
   *
   * @param {Number} x The x-axis radius for the ellipse
   * @param {Number} y The y-axis radius for the ellipse
   * @param {Number} radius The radius of the ellipse
   * @param {deg|rad} aStartAngle Starting angle of arc in radians
   * @param {deg|rad} aEndAngle Ending angle of arc in radians
   * @param {Boolean} [anticlockwise] Whether you want the arc to be drawn 
   *  anticlockwise or clockwise (Boolean)
   * @returns {Path} The current Path instance
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
   * Returns the bounding box of that {Path}.
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
   * @returns {Path} The current Path instance
   */
  proto.clear = function() {
    this._segments.length = 0;
    this._curve.clear();
    return this;
  };

  /**
   * Applies a fillColor, fillImage or fillGradient to the shape
   *
   * @param {String|Number|LinearGradient|RadialGradient|Bitmap|color.RGBAColor}
   *  fill The fillColor (see `color.parse`), fillImage or fillGradient
   * @returns {Path} The current Path instance
   */
  proto.fill = function(fill) {
    if (typeof fill === 'string' || typeof fill === 'number' || fill instanceof color.RGBAColor) {
      return this.attr('fillColor', fill);
    } else if (fill instanceof gradient.LinearGradient || fill instanceof gradient.RadialGradient) {
      return this.attr('fillGradient', fill);
    } else if (fill instanceof Bitmap) {
      return this.attr('fillImage', fill);
    }
    throw Error('A fill of "' + fill + '" is not supported');
  };

  /**
   * Applies a strokeColor or strokeGradient to the shape
   *
   * @param {String|Number|LinearGradient|RadialGradient|Bitmap|color.RGBAColor}
   *  fill The fillColor (see `color.parse`), fillImage or fillGradient
   * @returns {Path} The current Path instance
   */
  proto.stroke = function(stroke, strokeWidth) {
    if (strokeWidth) {
      this.attr('strokeWidth', strokeWidth);
    }
    if (typeof stroke === 'string' || typeof stroke === 'number' || stroke instanceof color.RGBAColor) {
      return this.attr('strokeColor', stroke);
    } else if (stroke instanceof gradient.LinearGradient || stroke instanceof gradient.RadialGradient) {
      return this.attr('strokeGradient', stroke);
    }
    throw Error('A fill of "' + fill + '" is not supported');
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
  proto.type = 'Path';

  /**
   * Collects and returns specific data for the renderer.
   *
   * For the Path class, this is the segments information.
   *
   * @private
   * @return {void|Array} The additional data for the renderer.
   */
  proto._getRenderData = function() {
    if (!this._isPathDataMutated) {
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
    this._isPathDataMutated = false;

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
   * @param {Path} that The Path to morph to (all morphable attributes
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
   * @param {Path} that The Path to morph to (only segments will morph)
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

    var maxSegments = max(that._segments.length, this._segments.length);

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
   * @memberOf Path
   * @param {Array} Segments array
   * @returns {Array} New absolute segments array
   */
   Path.toAbsolute = function(segments) {
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

  /**
   * Returns dimensions/location of the shape
   *
   * @param {Matrix} [transform=null] A transform to apply to all points
   *    before computation.
   * @returns {Object} an object with all box properties
   */
  proto.getBoundingBox = function(transform) {

    function transformPoint(x, y) {
      var point = new Point(x, y);
      return transform ? transform.transformPoint(point) : point;
    }

    var xBounds = [],
        yBounds = [],
        curvedSegments = CurvedPath.toCurves(this.attr('segments').slice()),
        startPoint = new Point(0, 0);

    for (var i = 0, segment; (segment = curvedSegments[i++]);) {

      switch (segment[0]) {
        case 'moveTo':
          var point = transformPoint(segment[1], segment[2]);
          startPoint = point;
          xBounds.push(point.x);
          yBounds.push(point.y);
          break;
        case 'curveTo':
          var cp1Point = transformPoint(segment[1], segment[2]);
          var cp2Point = transformPoint(segment[3], segment[4]);
          var endPoint = transformPoint(segment[5], segment[6]);
          var thisBounds = CurvedPath.getBoundsOfCurve(
            startPoint.x, startPoint.y,
            cp1Point.x, cp1Point.y,
            cp2Point.x, cp2Point.y,
            endPoint.x, endPoint.y
          );
          // Append bounds to those collected thus far:
          xBounds.push(thisBounds.left, thisBounds.right);
          yBounds.push(thisBounds.top, thisBounds.bottom);
          startPoint = endPoint;
      }
    }

    var box = {};

    box.left = min.apply(null, xBounds);
    box.right = max.apply(null, xBounds);
    box.top = min.apply(null, yBounds);
    box.bottom = max.apply(null, yBounds);
    box.width = box.right - box.left;
    box.height = box.bottom - box.top;

    return box;
    
  };

  return Path;
});
