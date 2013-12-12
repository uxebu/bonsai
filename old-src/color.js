define([
  './tools',
  './color_map'
],
function(tools, colorMap) {
  'use strict';

  /**
   * The color module provides APIs to use and mutate colors.
   * @module color
   */

  var max = Math.max,
      min = Math.min,
      rand = Math.random,
      round = Math.round;

  /**
   * Parses a color value and returns a `color.RGBAColor` instance.
   *
   * @name color
   * @function
   * @memberOf module:color
   * @param {String|Number|RGBAColor} c The color to be parsed, a number of the
   *  form `0x<rr><gg><bb><aa>`, a string (color name found in color_map) or
   *  a any of `rgb`, `rgba`, `hsl`, `hsla`, or hex (`#RRGGBB`).
   * @returns {null|RGBAColor} An RGBAColor instance or null for failed parsing
   */
  function color(c, fallback) {
    c = color.parse(c, fallback);
    return c === null ? c : new RGBAColor(
      c >> 24 & 0xff,
      c >> 16 & 0xff,
      c >> 8 & 0xff,
      (c >> 0 & 0xff) / 255
    );
  }

  color.RGBAColor = RGBAColor;

  /**
   * Constructs a new RGBAColor instance with specified `r`, `g`, `b`, and `a`
   * values.
   *
   * @classdesc This class is used internally by the color module. It can be used
   *  to represent a color consisting of Red, Green, Blue and Alpha values. It also
   *  provides methods to mutate the color and methods to spawn new colors.
   * @constructor
   * @name RGBAColor
   * @memberOf module:color
   * @param {Number} r Red (0..255)
   * @param {Number} g Green (0..255)
   * @param {Number} b Blue (0..255)
   * @param {Number} a Alpha (0..1)
   */
  function RGBAColor(r, g, b, a) {

    var hsl = rgbToHsl(r, g, b);

    this._properties = {
      r: r = (r || 0),
      g: g = (g || 0),
      b: b = (b || 0),
      a: a = a == null ? 1 : a,
      h: hsl.h,
      s: hsl.s,
      l: hsl.l
    };
  }

  /** @lends module:color.RGBAColor.prototype */
  var proto = RGBAColor.prototype;

  proto.red         = proto.r = getSet('r');
  proto.green       = proto.g = getSet('g');
  proto.blue        = proto.b = getSet('b');
  proto.alpha       = proto.a = getSet('a');
  proto.hue         = proto.h = getSet('h');
  proto.saturation  = proto.s = getSet('s');
  proto.lightness   = proto.l = getSet('l');

  function getSet(prop) {
    return function(val) {
      return arguments.length > 0 ?
        this.set(prop, val) :
        this.get(prop);
    };
  }

  /**
   * Set one of r, g, b, a, h, s, l
   * It allows the full forms too, since it only grabs charAt(0)
   * E.g. red, alpha, hue, lightness etc.
   *
   * @param {String|Object} prop Property to change (e.g. hue, or h) or a
   * hash-map of properties andT values
   * @param {String} [val] Value to change if prop is the property and NOT a
   * hash-map
   */
  proto.set = function(prop, val) {

    var rgb, props = this._properties;

    if (val == null) {
      // Assume hash-map of props/vals
      if (prop) {
        for (var i in prop) {
          this.set(i, prop[i]);
        }
      }
      return this;
    }

    val = +val;

    prop = prop.charAt(0);

    switch (prop) {
      case 'r':
      case 'g':
      case 'b':
      case 'a':
        props[prop] = val;
        break;
      case 'h':
      case 's':
      case 'l':

        // consider out-of-range values (allowed range: 0-1)
        props[prop] = max(0, min(1, val));

        rgb = hslToRgb(props.h, props.s, props.l);
        props.r = rgb >> 24 & 0xff;
        props.g = rgb >> 16 & 0xff;
        props.b = rgb >> 8 & 0xff;

        break;
      default:
        throw Error('No support for setting: ' + prop);
        break;
    }

    return this;
  };

  /**
   * Get one of r, g, b, a, h, s, l
   */
  proto.get = function(prop) {

    var props = this._properties;

    switch (prop) {
      case 'r':
      case 'g':
      case 'b':
        return round(props[prop]);
      case 'a':
        return props[prop];
      case 'h':
      case 's':
      case 'l':
        return props[prop];
      default:
        throw Error('No support for getting: ' + prop);
        break;
    }
  };

  /**
   * Returns a lighter color
   *
   * @param {Number} [n] Increase by n lightness
   */
  proto.lighter = function(n) {
    var clone = this.clone();
    clone.set('l', clone.get('l') + (n == null ? .01 : n));
    return clone;
  };

  /**
   * Returns a darker color
   *
   * @param {Number} [n] Decreased by n lightness
   */
  proto.darker = function(n) {
    var clone = this.clone();
    clone.set('l', clone.get('l') - (n == null ? .01 : n));
    return clone;
  };

  /**
   * Returns the midpoint color between this color and whatever is passed
   *
   * @param {RGBAColor|String|Number} c The midpoint color
   */
  proto.midpoint = function(c) {
    c = color(c);
    return new RGBAColor(
      (this.r() + c.r()) / 2,
      (this.g() + c.g()) / 2,
      (this.b() + c.b()) / 2,
      (this.a() +  c.a()) / 2
    );
  };

  /**
   * Applies a colorMatrix
   *
   * @source http://fedev.blogspot.de/2008/04/filter-effects-color-matrix.html
   * @param {colorMatrix} colorMatrix The value of the colorMatrix filter
   *
   * @returns {RGBAColor} The current RGBAColor instance
   */
  proto.setColorMatrix = function(colorMatrix) {
    var cm = [],
        props = this._properties,
        r = props.r,
        g = props.g,
        b = props.b,
        a = props.a;
    // cast to numbers
    for(var i = colorMatrix.length; i--;) {
      cm[i] = +colorMatrix[i];
    }

    this.set('r', range(r * cm[0]  + g * cm[1]  + b * cm[2]  + a * cm[3]  + 255 * cm[4],  0, 255));
    this.set('g', range(r * cm[5]  + g * cm[6]  + b * cm[7]  + a * cm[8]  + 255 * cm[9],  0, 255));
    this.set('b', range(r * cm[10] + g * cm[11] + b * cm[12] + a * cm[13] + 255 * cm[14], 0, 255));
    this.set('a', range(r * cm[15] + g * cm[16] + b * cm[17] + a * cm[18] +       cm[19], 0,   1));

    return this;
  };

  proto._setPointAlongRange = function(prop, n, range) {

    prop = prop.charAt(0);

    var current = this[prop]();

    switch (prop) {
      case 'r':
      case 'g':
      case 'b':
        this.set(
          prop,
          range ?
            max(0, min(
              255,
              (n * range) + (current - range/2)
            )) :
            n * 255
        );
        break;
      default:
        // h,s,l,a
        this.set(prop, range ? max(0, min(
          1,
          (n * range) + current - range/2
        )) : n);
    }

    return this;
  };

  /**
   * Returns a color with randomised properties as per the passed
   * properties array and range.
   *
   * @param {Array|String} props The property/properties to be randomized
   * @param {Number} range The range of the randomisation. 0..1 for hsla,
   *    and 0..255 for rgba.  If passed, then the randomization will occur
   *    around the current value to the specified degree. If no range is passed
   *    then the produced value could be anything (red = 0..255, alpha = 0..1 etc.)
   * @returns {RGBAColor} Randomly produced color
   */
  proto.randomize = function(props, range) {

    if (!props || typeof props == 'string') {
      props = props ? [props] : ['r', 'g', 'b'];
    }

    var clone = this.clone();

    for (var l = props.length; l--;) {
      clone._setPointAlongRange(props[l], rand(), range);
    }

    return clone;
  };

  /**
   * Clones the color instance and optionally mutates properties
   *
   * @param {Object} [properties] hash-map of properties/vals to mutate once
   * cloned. E.g. `{hue:.2, lightness:.3}`
   * @returns {RGBAColor} Cloned instance of color
   */
  proto.clone = function(properties) {
    return properties ? color(+this).set(properties) : color(+this);
  };

  /**
   * Returns the color in rgba() format as specified in the CSS spec
   *
   * @returns {String} RGBA representation
   */
  proto.rgba = function() {
    return 'rgba(' + [
      this.r(),
      this.g(),
      this.b(),
      this.a()
    ].join(',') + ')';
  };

  /**
   * Returns the color in rgb() format as specified in the CSS spec
   *
   * @returns {String} RGB representation
   */
  proto.rgb = function() {
    return 'rgb(' + [
      this.r(),
      this.g(),
      this.b()
    ].join(',') + ')';
  };

  /**
   * Returns the color in hsla() format as specified in the CSS spec
   *
   * @returns {String} HSLA representation
   */
  proto.hsla = function() {
    return 'hsla(' + [
      round(this.h() * 360),
      round(this.s() * 100) + '%',
      round(this.l() * 100) + '%',
      this.a()
    ].join(',') + ')';
  };

  /**
   * Returns the color in 32-bit int repr
   *
   * @returns {Number} Color as 32-bit int
   */
  proto.int32 = function() {
    return (
        (this.r() & 0xff) << 24 |
        (this.g() & 0xff) << 16 |
        (this.b() & 0xff) << 8 |
        (this.a() * 0xff & 0xff)
      ) >>> 0;
  };

  /**
   * Returns the color in 32-bit repr ('0x<rr><gg><bb><aa>')
   *
   * @returns {String} Color as '0x<rr><gg><bb><aa>'
   */
  proto.toString = function() {
    return '0x' +
      (
        '0000000' + //make sure we have at least eight hex digits
        ((
          (this.r() & 0xff) << 24 |
          (this.g() & 0xff) << 16 |
          (this.b() & 0xff) << 8 |
          (this.a() * 0xff & 0xff)
        ) >>> 0).toString(16)
      ).slice(-8); // use the last eight hex digits
  };

  // Helper functions for hsl to rgb conversion
  function hueToRgb(m1, m2, h) {
    h = h < 0 ? h + 1 : (h > 1 ? h - 1 : h);
    if (h * 6 < 1) {
      return m1 + (m2 - m1) * h * 6;
    }
    if (h * 2 < 1) {
      return m2;
    }
    if (h * 3 < 2) {
      return m1 + (m2 - m1) * (2/3 - h) * 6;
    }
    return m1;
  }

  /**
   * Converts h, s, l values to a 0xrrggbb value.
   *
   * @param {number} h Hue value from 0 to 1
   * @param {number} s Saturation value from 0 to 1
   * @param {number} l Lightness value from 0 to 1
   * @returns {number} A 3 byte integer, byte 3 is r, byte 2 is g, byte 1 is b
   */
  function hslToRgb(h, s, l) {
    var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
    var m1 = l * 2 - m2;
    var r = hueToRgb(m1, m2, h + 1/3) * 255,
        g = hueToRgb(m1, m2, h) * 255,
        b = hueToRgb(m1, m2, h - 1/3) * 255;

    return round(r) << 24 | round(g) << 16 | round(b) << 8;
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var h, s, l, diff,
        mmax = max(r, g, b),
        mmin = min(r, g, b);
    l = (mmin + mmax) / 2;
    if (mmax == mmin) {
      h = s = 0;
    } else {
      diff = mmax - mmin;
      s = l > 0.5 ? diff / (2 - mmax - mmin) : diff / (mmax + mmin);
      switch (mmax) {
        case r: h = (g - b) / diff + (g < b ? 6 : 0); break;
        case g: h = (b - r) / diff + 2; break;
        case b: h = (r - g) / diff + 4; break;
      }
      h /= 6;
    }
    return {h:h, s:s, l:l};
  }

  function range(value, mmin, mmax) {
    return min(mmax, max(mmin, value));
  }

  /**
   * Parses a color value and returns a 32-bit integer representing the color.
   * The number is in the form `0x<rr><gg><bb><aa>`.
   *
   * @name color.parse
   * @memberOf module:color
   * @param value The value to parse as a color
   * @param fallback The value to fallback on if we can't parse `value`
   */
  color.parse = function parseColor(value, fallback) {

    var alpha;

    value = String(value);

    if (value in colorMap) {
      value = colorMap[value];
    }

    if (/^#[0-9a-f]{6}$/i.test(value)) {
      value = (parseInt(value.slice(1), 16) << 8 | 0xff) >>> 0;
    } else if (/^#[0-9a-f]{8}$/i.test(value)) {
      value = parseInt(value.slice(1), 16) >>> 0;
    } else if (/^#[0-9a-f]{3}$/i.test(value)) {
      value = parseInt(value.slice(1), 16);
      var r = value & 0xf00, g = value & 0xf0, b = value & 0xf;
      value = (r << 20 | r << 16 | g << 16 | g << 12 | b << 12 | b << 8 | 0xff) >>> 0;
    }

    if (!isNaN(value)) {
      return +value;
    }

    value = value.split('(');
    if (value.length == 2) {
      var values = value[1].slice(0, -1).split(','), len = values.length;
      switch (value[0]) {
        case 'rgb':
          alpha = 255;
        // fallthrough intended
        case 'rgba':
          if (len == 4 || len == 3 && alpha) {
            return (
              (values[0] & 0xff) << 24 |
              (values[1] & 0xff) << 16 |
              (values[2] & 0xff) << 8 |
              (alpha || min(1, max(0, values[3])) * 0xff & 0xff)
            ) >>> 0;
          }
          break;
        case 'hsl':
          alpha = 255;
        // fallthrough intended
        case 'hsla':
          if (len == 4 || len == 3 && alpha) {
            value = hslToRgb(values[0] % 360 / 360, parseInt(values[1]) / 100, parseInt(values[2]) / 100);
            return value | (alpha || values[3] * 0xff & 0xff);
          }
          break;
      }
    }

    return fallback == null ? null : color.parse(fallback);
  };

  return color;
});
