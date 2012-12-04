define([], function() {
  //'use strict'; //TODO: add back in as soon as our plugins are fixed

  var hasOwnProperty = {}.hasOwnProperty,
      indexOf = [].indexOf,
      noop = function() {},
      push = [].push,
      slice = [].slice,
      toString = {}.toString,
      PI = Math.PI;

  /**
   *
   * This module contains generic utility functions which are used heavily
   * internally.
   *
   * @exports tools
   */
  var tools = {

    /**
     * Returns the base url directory for a given document.
     *
     * This value can be used to create URLs relative to a document. It is
     * guaranteed to have a trailing slash.
     *
     * @param {HTMLDocument} document
     * @returns {string}
     */
    baseUri: function(document) {
      var undefined, baseUri = document.baseURI;
      if (baseUri !== undefined) {
        // remove non-dir components at end, ensure trailing slash;
        return baseUri.replace(/[/]+[^/]*$/, '/');
      } else {
        var a = document.createElement('a');
        a.href = '.';
        return a.href;
      }
    },

    /**
     * Creates a new object with the given [[Prototype]].
     *
     * @param {Object} prototype The [[Prototype]].
     * @returns {Object} The new object.
     */
    beget: function(prototype) {
      noop.prototype = prototype;
      return new noop;
    },

    /**
     * Creates a property descriptor for an accessor property.
     *
     * @param {Function} get The getter function
     * @param {Function} set The setter function
     * @param {boolean} [enumerable] Whether the property should be enumerable
     * @param {boolean} [configurable] Whether the property should
     *  be configurable
     * @returns {Object} A property descriptor suitable for Object.create(),
     *  Object.defineProperty() and Object.defineProperties().
     */
    descriptorAccessor: function(get, set, enumerable, configurable) {
      return {
        get: get,
        set: set,
        enumerable: !!enumerable,
        configurable: !!configurable
      };
    },

    /**
     * Creates a property descriptor for a data property.
     *
     * @param {mixed} value The initial value
     * @param {boolean} [writable] Whether the property should be writable
     * @param {boolean} [enumerable] Whether the property should be enumerable
     * @param {boolean} [configurable] Whether the property should
     *  be configurable
     * @returns {Object} A property descriptor suitable for Object.create(),
     *  Object.defineProperty() and Object.defineProperties().
     */
    descriptorData: function(value, writable, enumerable, configurable) {
      return {
        value: value,
        writable: !!writable,
        enumerable: !!enumerable,
        configurable: !!configurable
      };
    },

    /**
     * A generic `Array#forEach` like method.
     * Callbacks may terminate the loop by explicitly returning `false`.
     *
     * @param {Array} array The array to iterate over.
     * @param {Function} callback The function called per iteration.
     * @param {Object} thisArg The `this` binding for the callback function.
     * @returns {Array} Returns the array iterated over.
     */
    forEach: function(array, callback, thisArg) {
      var index,
          length = array.length;

      // optimize for the common case of not providing a `thisArg`
      thisArg && (callback = tools.hitch(thisArg, callback));
      for (index = 0; index < length; index += 1) {
        if (callback(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    },

    /**
     * Iterates over an object's own properties, executing the `callback` for each.
     * Callbacks may terminate the loop by explicitly returning `false`.
     *
     * @param {Object} object The object to iterate over.
     * @param {Function} callback The function executed per own property.
     * @param {Object} thisArg The `this` binding for the callback function.
     * @returns {Object} Returns the object iterated over.
     */
    forOwn: function(object, callback, thisArg) {
      // optimize for the common case of not providing a `thisArg`
      thisArg && (callback = tools.hitch(thisArg, callback));
      for (var key in object) {
        if (hasOwnProperty.call(object, key) &&
            callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    },

    /**
     * Creates a simple getter.
     *
     * The function returned will return the property specified from the
     * respective context (`this`) on invokation.
     *
     * @param {string} propertyName The name of the property to look up.
     * @returns {Function}
     */
    getter: function(propertyName) {
      return function() {
        return this[propertyName];
      };
    },

    /**
     * Returns a function that will only ever execute with a specified `this` binding.
     *
     * @param {Object} thisArg The `this` binding for the `fn` function.
     *  If `fn` is a string, `thisArg` is also the object containing `fn`.
     * @param {Function|String} A function to be bound to `thisArg`, or the name
     *  of the method in `thisArg` to be bound.
     * @param [fixedArgs...] Any number of parameters. Will be passed to the
     *  bound function before any other parameters.
     * @returns {Function} The bound function.
     */
    hitch: function(thisArg, fn, fixedArgs) {
      if (arguments.length > 2) {
        fixedArgs = slice.call(arguments, 2);
        var fixedLength = fixedArgs.length;
      }
      if (typeof fn == 'string') {
        fn = thisArg[fn];
      }
      return fixedArgs ?
        function() {
          // resetting `fixArgs` length + push is faster than concat + slice
          fixedArgs.length = fixedLength;
          push.apply(fixedArgs, arguments);
          return fn.apply(thisArg, fixedArgs);
        } :
        function() {
          return fn.apply(thisArg, arguments);
        };
    },

    /**
     * Performs a strict equality search for the given `value` and returns the
     * index it is found at else `-1`.
     *
     * @param {Array} array The array to iterate over.
     * @param {Mixed} value The value to search for.
     * @param {Number} [fromIndex=0] The index to start searching from.
     * @returns {Number} The index of the matched value or `-1`.
     */
    indexOf: function(array, value, fromIndex) {
      return indexOf.call(array, value, fromIndex);
    },

    /**
     * Checks if a value has an internal `[[Class]]` of Array.
     *
     * @function
     * @param {Mixed} value The value to check.
     * @returns {Boolean} Returns `true` if the value has an internal [[Class]]
     *  of Array, else `false`.
     */
    isArray: Array.isArray || function(value) {
      // http://es5.github.com/#x15.4.3.2
      return toString.call(value) == '[object Array]';
    },

    /**
     * Returns an array of all own enumerable property names.
     *
     * @function
     * @param {Object} object The object to iterate over.
     * @returns {Array} An array of property names.
     */
    keys: Object.keys || function(object) {
      // http://es5.github.com/#x15.2.3.14
      if (object !== Object(object)) {
        throw TypeError();
      }
      var result = [];
      for (var key in object) {
        if (hasOwnProperty.call(object, key)) {
          result.push(key);
        }
      }
      return result;
    },

    /**
     * A generic `Array#map` like method.
     *
     * @param {Array} array The array to iterate over.
     * @param {Function} callback The function called per iteration.
     * @param {Object} thisArg The `this` binding for the callback function.
     * @returns {Array} A new array of values returned by the callback.
     */
    map: function(array, callback, thisArg) {
      var index,
          length = array.length,
          result = Array(length);

      // optimize for the common case of not providing a `thisArg`
      thisArg && (callback = tools.hitch(thisArg, callback));
      for (index = 0; index < length; index += 1) {
        result[index] = callback(array[index], index, array);
      }
      return result;
    },

    /**
     * Copies all enumerable properties from source object(s) to the destination object.
     * Multiple source objects are supported.
     *
     * @param {Object} destination The object to copy properties to.
     * @param {Object} [source, ..] The object(s) to copy properties from.
     * @returns {Object} The destination object.
     */
    mixin: function(destination, source) {
      var index,
          key,
          length = arguments.length;

      for (index = 1; index < length; index += 1) {
        source = arguments[index] || {};
        for (key in source) {
          destination[key] = source[key];
        }
      }
      return destination;
    },

    /**
     * Gets absolute offset of the given DOM element.
     *
     * @param {Element} element The DOM element.
     * @returns {Object} An object with the absolute offset left and top values.
     */
    offset: function(element) {
      // TODO: Add corrections for client left/top and scroll offsets
      var left = 0,
          top = 0,
          offsetParent = element;

      do {
        left += offsetParent.offsetLeft;
        top += offsetParent.offsetTop;
      } while (offsetParent = offsetParent.offsetParent);

      return {
        left: left,
        top: top
      };
    },

    /**
     * A generic `Array#reduce` like method.
     *
     * @param {Array} array The array to iterate over.
     * @param {Function} callback The function called per iteration.
     * @param {Mixed} accumulator Initial value of the accumulator.
     * @returns {Mixed} The accumulator.
     */
    reduce: function(array, callback, accumulator) {
      var noaccum = arguments.length < 3;

      var index,
          length = array.length;

      if (noaccum) {
        accumulator = array[0];
      }

      for (index = noaccum ? 1 : 0; index < length; index += 1) {
        accumulator = callback(accumulator, array[index], index, array);
      }
      return accumulator;
    },

    /**
     * Removes all occurrences of a value within an array.
     *
     * Can also be used to remove gaps from an array.
     *
     * @param {Array} array The array to remove values from
     * @param [value=undefined] The value to remove from the array
     * @returns {Array} The array passed in.
     */
    removeValueFromArray: function(array, value) {
      var current, numRemoved = 0;
      for (var i = 0, length = array.length; i < length; i += 1) {
        current = array[i];
        if (current === value) {
          numRemoved += 1;
        } else if (numRemoved) {
          array[i - numRemoved] = current;
        }
      }

      array.length -= numRemoved;

      return array;
    },

    /**
     * Get degrees value from a radian.
     *
     * @param {Number} rad radians
     * @param {Number} [precision] Floating point precision
     * @returns {String} degrees
     */
    degFromRad: function (rad, precision) {
      var degrees = rad * 180 / PI;
      if (typeof precision === 'number') {
        degrees = degrees.toFixed(precision);
      }

      return degrees + 'deg';
    },

    /**
     * Calculates the radians of a degree string
     *
     * @param {String|Number} deg degrees
     * @returns {Number} radians
     */
    radFromDeg: function (deg) {
      return parseFloat(deg) * PI / 180;
    }

  };

  return tools;
});
