/**
 * A module for creating linear and radial gradients
 * @module gradient
 */
define([
  '../tools',
  '../color',
  './matrix'
],
function(tools, color, Matrix) {
  'use strict';

  var hasOwn = {}.hasOwnProperty;

  /**
   * Parses a gradient linear-gradient (CSS) string
   *
   * Supported input formats:
   *  + linear-gradient `linear-gradient( [ [ <angle> | to <side-or-corner> ] ,]? <color-stop>[, <color-stop>]+ )
   *
   * @name gradient
   * @private
   * @function
   * @memberOf module:gradient
   * @param grad The unparsed gradient
   */
  function gradient(g) {

    if (
      g instanceof gradient.LinearGradient ||
      g instanceof gradient.RadialGradient
    ) {
      return g;
    }

    return gradient.parse(g);
  }

  gradient.DEFAULT_UNITS = 'boundingBox';

  /**
   * Constructs a LinearGradient instance
   *
   * @name LinearGradient
   * @memberOf module:gradient
   * @constructor
   * @param {Number} direction The direction of the gradient in degrees
   * @param {Array} stops An array of arrays, each sub-array in the form:
   *  `[color, percentageOffset]`
   * @param {Matrix} [matrix] The transformation matrix for the gradient.
   * @param {String} [units=userSpace] Either "boundingBox" or "userSpace"
   */
  gradient.LinearGradient = function LinearGradient(direction, stops, matrix, units) {
    this.type = 'linear-gradient';
    this.stops = stops;
    this.matrix = matrix;
    this.direction = direction;
    this.units = units;
  };

  /**
   * Clones the instance, returning a new one
   *
   * @name clone
   * @function
   * @memberOf module:gradient.LinearGradient.prototype
   * @returns {LinearGradient} The clone
   */
  gradient.LinearGradient.prototype.clone = function() {
    var stops = [];
    this.stops.forEach(function(stop) {
      stops.push([stop[0], stop[1]]);
    });
    return new gradient.LinearGradient(
      this.direction,
      stops,
      this.matrix && this.matrix.clone(),
      this.units
    );
  };

  /**
   * Constructs a RadialGradient instance
   *
   * @name RadialGradient
   * @memberOf module:gradient
   * @constructor
   * @param {Array} stops Color stops in the form: `['red','yellow',...]` or
   *                      `[['red', 0], ['green', 50], ['#FFF', 100]]`
   *                      i.e. Sub-array [0] is color and [1] is percentage
   * @param {number} radius Radius in percentage
   * @param {Matrix} matrix Matrix transform for gradient
   * @param {String} units Either 'userSpace' or 'boundingBox'.
   * @param {Number} fx Focal x coordinate
   * @param {Number} fy Focal y coordinate
   **/
  gradient.RadialGradient = function RadialGradient(stops, radius, matrix, units, fx, fy) {
    this.type = 'radial-gradient';
    this.stops = stops;
    this.radius = radius;
    this.matrix = matrix;
    this.units = units;
    this.fx = fx;
    this.fy = fy;
  };


  /**
   * Clones the instance, returning a new one
   *
   * @name clone
   * @function
   * @memberOf module:gradient.RadialGradient.prototype
   * @returns {RadialGradient} The clone
   */
  gradient.RadialGradient.prototype.clone = function() {
    var stops = [];
    this.stops.forEach(function(stop) {
      stops.push([stop[0], stop[1]]);
    });
    return new gradient.RadialGradient(
      stops,
      this.radius,
      this.matrix && this.matrix.clone(),
      this.units,
      this.fx,
      this.fy
    );
  };

  /**
   * Repeat stops `n` times
   */
  gradient._repeat = function(stops, n) {

    var stopsLength = stops.length,
        start,
        newStop,
        newStops = [];

    for (var i = 0, l = n; i < l; ++i) {
      for (var s = 0; s < stopsLength; ++s) {
        newStop = stops[s].slice(0);
        start = 100 / n * i;
        newStop[1] = (newStop[1] / n) + start;
        newStops.push(newStop);
      }
    }

    return newStops;
  };

  /**
   * Interpolate all offsets of color-stops
   * E.g.
   * [[red,0],[green],[blue]]
   * will interpolate to:
   * [[red,0],[green,50],[blue,100]]
   */
  gradient._fillOffsets = function(stops) {

    var end,
        start,
        l = stops.length - 1;

    if (!stops || !stops.length) {
      return;
    }

    stops[0][1] = stops[0][1] || 0;
    stops[l][1] = stops[l][1] == null ? 100 : stops[l][1];

    // Initiate end to the first stop (i.e. the next 'start' item)
    end = stops[0][1];

    // Start at second stop and end at second-to-last
    // (leave out the first and last stops)
    for (var s = 1; s < l; ++s) {

      if (stops[s][1]) {
        end = parseFloat(stops[s][1]);
        continue; // Already defined, continue
      }

      start = end; // start = end from last run
      end = null;

      // Find the next defined offset
      for (var e = s + 1; e < l; ++e) {
        if (stops[e][1]) {
          end = stops[e][1];
          break;
        }
      }

      end = parseFloat(end);
      if (!end) {
        // If end has not been found, then it must be the last item:
        end = stops[l][1];
      }

      var d = (end - start) / (e - s + 1);

      // Fill remaining missing offsets (before next defined offset)
      for (; s < e; ++s) {
        start += d;
        stops[s][1] = start;
      }
    }

    return stops;
  };

  /**
   * Creates a linear gradient
   *
   * @name linear
   * @function
   * @memberOf module:gradient
   *
   * @param {Number|String} direction Direction in degrees or a string, one of:
   *                        `top`, `left`, `right`, `bottom`, `top left`,
   *                        `top right`, `bottom left`, `bottom right`
   * @param {Array|Object} stops Color stops in the form: `['red','yellow',...]`
   *  or `[['red', 0], ['green', 50], ['#FFF', 100]]`
   *  i.e. Sub-array [0] is color and [1] is percentage
   *  As an object: { 0: 'yellow', 50: 'red', 100: 'green' }
   * @param {Number} repeat Number of times to repeat gradient stops
   * @returns {LinearGradient} A LinearGradient instance
   */
  gradient.linear = function(direction, stops, repeat) {
    return gradient.advancedLinear(
      direction,
      stops,
      null,
      repeat
    );
  };

  /**
   * Creates a radial gradient
   *
   * @name radial
   * @function
   * @memberOf module:gradient
   * @param {Array} stops Color stops in the form: `['red','yellow',...]` or
   *                      `[['red', 0], ['green', 50], ['#FFF', 100]]`
   *                      i.e. Sub-array [0] is color and [1] is percentage
   * @param {Number} [radius] Radius in percentage
   * @param {Number} [cx] X coordinate of center of gradient in percentage
   * @param {Number} [cy] Y coordinate of center of gradient in percentage
   * @param {Number} [repeat] Number of times to repeat gradient stops
   * @returns {RadialGradient} A RadialGradient instance
   **/
  gradient.radial = function(stops, radius, cx, cy, repeat) {
    return gradient.advancedRadial(
      stops,
      (radius || 50) + '%',
      new Matrix(
        1, 0, 0, 1,
        cx == null ? .5 : cx/100,
        cy == null ? .5 : cy/100
      ),
      repeat
    );
  };

  /**
   * Creates a linear gradient
   *
   * @name advancedLinear
   * @function
   * @memberOf module:gradient
   * @param {Array|Object} stops Color stops in the form: `['red','yellow',...]`
   *  or `[['red', 0], ['green', 50], ['#FFF', 100]]`
   *  i.e. Sub-array [0] is color and [1] is percentage
   *  As an object: { 0: 'yellow', 50: 'red', 100: 'green' }
   *
   * @param {Number|String} direction Direction in degrees or a string, one of:
   *                        `top`, `left`, `right`, `bottom`, `top left`,
   *                        `top right`, `bottom left`, `bottom right`
   * @param {Matrix} [matrix] Matrix transform for gradient
   * @param {String} [repeat] How many times to repeat the gradient
   * @param {String} [units] Either 'userSpace' or 'boundingBox'.
   * @returns {LinearGradient} A LinearGradient instance
   */
  gradient.advancedLinear = function(direction, stops, matrix, repeat, units) {

    units = units || gradient.DEFAULT_UNITS;

    var dir = parseFloat(direction);

    if (tools.isArray(direction)) {
      dir = direction;
    } else if (isNaN(dir)) {
      dir = angleMap[direction];
    }

    if (!tools.isArray(stops)) {

      // Assumed to be object map -- form the stops array:
      var stopsArray = [];
      for (var i in stops) {
        if (hasOwn.call(stops, i)) {
          stopsArray.push([stops[i], parseFloat(i)]);
        }
      }
      stops = stopsArray;
      stops.sort(function(a, b) {
        return a[1] - b[1];
      });
    }

    stops = stops.map(function(stop) {
      return tools.isArray(stop) ?
        [color.parse(stop[0]), stop[1]] :
        [color.parse(stop)];
    });

    gradient._fillOffsets(stops);

    if (repeat) {
      stops = gradient._repeat(stops, repeat);
    }

    return new gradient.LinearGradient(dir, stops, matrix, units);
  };

  /**
   * Creates a radial gradient
   *
   * @name advancedRadial
   * @function
   * @memberOf module:gradient
   * @param {Array} stops Color stops in the form: `['red','yellow',...]` or
   *                      `[['red', 0], ['green', 50], ['#FFF', 100]]`
   *                      i.e. Sub-array [0] is color and [1] is percentage
   * @param {Number} [r] Radius in percentage (default: 50)
   * @param {Number} [cx] X coordinate of center of gradient in percentage (default: 50)
   * @param {Number} [cy] Y coordinate of center of gradient in percentage (default: 50)
   * @param {Matrix} [matrix] Matrix transform for gradient
   * @param {String} [repeat] How many times to repeat the gradient
   * @param {String} [units] Either 'userSpace' or 'boundingBox'.
   * @returns {RadialGradient} A RadialGradient instance
   **/
  gradient.advancedRadial = function(stops, r, matrix, repeat, units, fx, fy) {

    units = units || gradient.DEFAULT_UNITS;

    fx = fx || 0;
    fy = fy || 0;

    // Default radius is 50% so diameter = 100%
    r = r == null ? '50%' : r;

    if (!tools.isArray(stops)) {

      // Assumed to be object map -- form the stops array:
      var stopsArray = [];
      for (var i in stops) {
        if (hasOwn.call(stops, i)) {
          stopsArray.push([stops[i], parseFloat(i)]);
        }
      }
      stops = stopsArray;
      stops.sort(function(a, b) {
        return a[1] - b[1];
      });
    }

    stops = stops.map(function(stop) {
      return tools.isArray(stop) ?
        [color.parse(stop[0]), stop[1]] :
        [color.parse(stop)];
    });

    gradient._fillOffsets(stops);

    if (repeat) {
      stops = gradient._repeat(stops, repeat);
    }

    return new gradient.RadialGradient(stops, r, matrix, units, fx, fy);

  };

  gradient.parse = function(grad) {

    var parts = grad.match(/(linear)-gradient\((.+)\)$/);

    if (parts && parts[1] === 'linear') {
      return gradient.parseLinearGradient(parts[2]);
    }

    throw new Error('Invalid gradient: ' + grad);
  };

  var angleMap = {
    'top': 0,
    'right': 90,
    'bottom': 180,
    'left': 270,
    'top left': 315,
    'top right': 45,
    'bottom left': 225,
    'bottom right': 135
  };

  /**
   * Parses linear gradients, inspired by CSS spec
   * E.g.
   *  linear-gradient(to top right, red, white, blue)
   * @returns {LinearGradient} a LinearGradient instance
   */
  gradient.parseLinearGradient = function(args) {

    // args = e.g. "to bottom, yellow, red, blue"

    // linear-gradient(<POSITION>[,<STOP>*])
    // <POSITION> = <ANGLE> | top | bottom | left | right | top left etc.
    // <STOP> = <COLOR> <AT>
    // <AT> = N% | Npx

    var position = args.match(
          /^\s*(?:(-?(?:[0-9]+\.)?[0-9]+)deg|to\s+((?:(?:top|bottom)\s*)?(?:left|right)|(?:top|bottom)))/
        ) || ['',,'bottom'],
        deg = position[1],
        corner = position[2],
        regexStop = /(?:,|^)\s*(#[0-9a-f]{3,8}|(?:hsl|rgb)a?\(.+?\)|\w+)\s*((?:[0-9]+\.)?[0-9]+%|)?/ig,
        stop,
        stops = [];

    args = args.slice(position[0].length);

    while (stop = regexStop.exec(args)) {
      stops.push([
        stop[1],
        parseFloat(stop[2]) || null
      ]);
    }

    return gradient.linear(deg || corner, stops);
  };

  return gradient;
});
