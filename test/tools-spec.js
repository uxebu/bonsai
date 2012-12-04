define([
  'bonsai/tools'
], function(tools) {
  'use strict';

  var slice = [].slice,
      toString = {}.toString;

  /*--------------------------------------------------------------------------*/

  describe('tools.beget', function() {
    function Klass() { }
    Klass.prototype.a = 1;

    it('Assigns the [[Prototype]] correctly', function() {
      var result = tools.beget(Klass.prototype);
      expect(result.a).toEqual(1);
    });

    it('Returns an object', function() {
      var result = tools.beget(Klass.prototype);
      expect(result).toBeOfType('object');
    });
  });

 /*--------------------------------------------------------------------------*/

  describe('tools.forEach', function() {
    var array = ['a', 'b', 'c', ''];

    it('Passes the correct arguments', function() {
      var args
      tools.forEach(array, function() {
        args || (args = slice.call(arguments));
      });

      expect(args).toEqual(['a', 0, array]);
    });

    it('Returns the passed array', function() {
      var result = tools.forEach(array, function() { });
      expect(result).toEqual(array);
    });

    it('Iterates over all indexes', function() {
      var values = [];
      tools.forEach(array, function(value) {
        values.push(value);
      });

      expect(values).toEqual(['a', 'b', 'c', '']);
    });

    it('Exits early when returning `false`', function() {
      var values = [];
      tools.forEach(array, function(value) {
        values.push(value);
        return values.length < 2;
      });

      expect(values).toEqual(['a', 'b']);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.forOwn', function() {
    function Klass() {
      this.a = 1;
      this.b = 2;
      this.c = 3;
    }

    var object = new Klass;
    Klass.prototype.d = 4;

    it('Passes the correct arguments', function() {
      var args
      tools.forOwn(object, function() {
        args || (args = slice.call(arguments));
      });

      expect(args).toEqual([1, 'a', object]);
    });

    it('Returns the passed object', function() {
      var result = tools.forOwn(object, function() { });
      expect(result).toEqual(object);
    });

    it('Iterates over own properties', function() {
      var values = [];
      tools.forOwn(object, function(value) {
        values.push(value);
      });

      expect(values.sort()).toEqual([1, 2, 3]);
    });

    it('Exits early when returning `false`', function() {
      var values = [];
      tools.forOwn(object, function(value) {
        values.push(value);
        return values.length < 2;
      });

      expect(values.length).toEqual(2);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.hitch', function() {
    var context = {};

    it('Passes arguments and sets the `this` binding correctly', function() {
      expect(
        tools.hitch(context, function() {
          var args = slice.call(arguments);
          args.unshift(this);
          return args;
        })(1, 2, 3)
      ).toEqual([context, 1, 2, 3]);
    });

    it('Performs partial application', function() {
      expect(
        tools.hitch(context, function() {
          var args = slice.call(arguments);
          args.unshift(this);
          return args;
        }, 'foo', 'bar')(3, 2, 1)
      ).toEqual([context, 'foo', 'bar', 3, 2, 1]);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.indexOf', function() {
    var array = ['a', 'b', 'c'];

    it('Produces the correct result', function() {
      expect(tools.indexOf(array, 'b')).toEqual(1);
    });

    it('Matches values by strict equality', function() {
      expect(tools.indexOf(array, new String('b'))).toEqual(-1);
    });

    it('Searches from the given `fromIndex`', function() {
      var array = ['a', 'b', 'c', 'a'];
      expect(tools.indexOf(array, 'a', 1)).toEqual(3);
    });

    it('Handles extreme negative `fromIndex` values correctly', function() {
      array['-1'] = 'z';
      expect(tools.indexOf(array, 'z', -4)).toEqual(-1);
    });

    it('Handles extreme positive `fromIndex` values correctly', function() {
      var object = { '0': 'a', '1': 'b', '2': 'c', 'length': 2 };
      expect(tools.indexOf(object, 'c', 2)).toEqual(-1);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.map', function() {
    var array = ['a', 'b', 'c'];

    it('Passes the correct arguments', function() {
      var args;
      tools.map(array, function() {
        args || (args = slice.call(arguments));
      });

      expect(args).toEqual(['a', 0, array]);
    });

    it('Produces the correct result', function() {
      var result = tools.map(array, function(value, index) {
        return value + index;
      });

      expect(result).toEqual(['a0', 'b1', 'c2']);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.mixin', function() {
    function Klass() {
      this.a = 1;
      this.b = 2;
    }

    Klass.prototype.c = 3;

    it('Handles a single source correctly', function() {
      var result = tools.mixin({}, { 'a': 'A', 'c': 3 });
      expect(result).toEqual({ 'a': 'A',  'c': 3 });
    });

    it('Handles multiple sources correctly', function() {
      var result = tools.mixin({}, { 'a': 'A', 'c': 3 }, { 'a': 1, 'b': 2 });
      expect(result).toEqual({ 'a': 1, 'b': 2, 'c': 3 });
    });

    it('Iterates over all enumerable properties', function() {
      var result = tools.mixin({}, new Klass);
      expect(result).toEqual({ 'a': 1, 'b': 2, 'c': 3 });
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('tools.reduce', function() {
    var array = ['b', 'c', 'd'];

    it('Passes the correct arguments', function() {
      var args;
      tools.reduce(array, function() {
        args || (args = slice.call(arguments));
      }, 'a');

      expect(args).toEqual(['a', 'b', 0, array]);
    })

    it('Accumulates correctly', function() {
      var result = tools.reduce(array, function(string, value) {
        return string + value;
      }, 'a');

      expect(result).toEqual('abcd');
    });

    it('Handles arguments with no initial value correctly', function() {
      var args;
      tools.reduce(array, function() {
        args || (args = slice.call(arguments));
      });

      expect(args).toEqual(['b', 'c', 1, array]);
    });
  });

  describe('.removeValueFromArray', function() {
    var removeValueFromArray = tools.removeValueFromArray;

    it('returns the array passed in', function() {
      var array = [];
      expect(removeValueFromArray(array)).toBe(array);
    });

    it('removes a value from the beginning of an array', function() {
      expect(
        removeValueFromArray(['ab', 'cd', 'ef', 'gh'], 'ab')
      ).toEqual(['cd', 'ef', 'gh']);
    });

    it('removes a value from the end of an array', function() {
      expect(
        removeValueFromArray(['ab', 'cd', 'ef', 'gh'], 'gh')
      ).toEqual(['ab', 'cd', 'ef']);
    });

    it('removes a value from the middle of an array', function() {
      expect(
        removeValueFromArray(['ab', 'cd', 'ef', 'gh'], 'ef')
      ).toEqual(['ab', 'cd', 'gh']);
    });

    it('removes a value that occurs multiple times', function() {
      expect(
        removeValueFromArray(['ef', 'ab', 'cd', 'ef', 'gh', 'ef'], 'ef')
      ).toEqual(['ab', 'cd', 'gh']);
    });

    it('cleans a sparse array', function() {
      var a = {}, b = [], c = function() {}, d = 'arbitrary string', e = 15;
      var input = [,,a,,d,e,,,c,a,a,,b,,b];
      var expected = [a,d,e,c,a,a,b,b];
      expect(removeValueFromArray(input)).toEqual(expected);
    });
  });

  /*--------------------------------------------------------------------------*/

  describe('radFromDeg', function () {
    var radFromDeg = tools.radFromDeg;

    function toRadians(degrees) {
      return degrees * Math.PI / 180;
    }

    it('converts degrees to radians', function () {
      var degrees = 45;
      var expected = toRadians(degrees);

      expect( radFromDeg(degrees) ).toBeCloseTo(expected, 10);
    });

    it('converts `ndeg` to radians', function () {
      var degrees = 45;
      var expected = toRadians(degrees);

      expect( radFromDeg(degrees + 'deg') ).toBeCloseTo(expected, 10);
    });

  });

  describe('degFromRad', function () {
    var degFromRad = tools.degFromRad;

    function toDegrees(radians) {
      return radians * 180 / Math.PI;
    }

    it('converts radians to ndegrees', function () {
      var radians = 0.785398163; // 45 degrees
      var expected = toDegrees(radians) + 'deg';

      expect(degFromRad(radians)).toBe(expected);
    });

    it('converts radians to ndegrees with a precision of 0', function () {
      var radians = 0.785398163; // 45 degrees
      var expected = toDegrees(radians).toFixed(0) + 'deg';
      console.log('expected', expected);

      expect(degFromRad(radians, 0)).toBe(expected);
    });

  });

});
