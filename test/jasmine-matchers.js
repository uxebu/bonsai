beforeEach(function() {
  function testKeyList(keys, object, testFn) {
    for (var i = 0, len = keys.length; i < len; i += 1) {
      if (!testFn(object, keys[i])) {
        return false;
      }
    }
    return true;
  }

  function testKeyObject(referenceObject, object, testFn) {
    for (var key in referenceObject) {
      if (!testFn(object, key, referenceObject[key])) {
        return false;
      }
    }
    return true;
  }

  function hasProperty(object, key) {
    return key in object;
  }
  function hasOwnProperty(object, key) {
    return {}.hasOwnProperty.call(object, key);
  }
  function hasPropertyWithValue(object, key, value) {
    return object[key] === value;
  }
  function hasOwnPropertyWithValue(object, key, value) {
    return hasOwnProperty(object, key) && hasPropertyWithValue(object, key, value);
  }

  this.addMatchers({
    toBeArray: function() {
      return {}.toString.call(this.actual) === '[object Array]';
    },

    toBeInstanceOf: function(Constructor) {
      return this.actual instanceof Constructor;
    },

    toBeNan: function() { // needs to be spelled 'Nan' due to jasmine conventions
      var actual = this.actual;
      // NaN is the only value that is not strictly equal to itself
      return actual !== actual;
    },

    toBeOfType: function(type) {
      return typeof this.actual === type;
    },

    toHaveLength: function(length) {
      return this.actual.length === length;
    },

    toHaveProperties: function(name0, name1, name2) {
      return typeof name0 === 'object' ?
        testKeyObject(name0, this.actual, hasPropertyWithValue) :
        testKeyList(arguments, this.actual, hasProperty);
    },

    toHaveOwnProperties: function(name0, name1, name2) {
      return typeof name0 === 'object' ?
        testKeyObject(name0, this.actual, hasOwnPropertyWithValue) :
        testKeyList(arguments, this.actual, hasOwnProperty);
    }
  })
});
