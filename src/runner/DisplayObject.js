define([
  './attributes/DisplayObject'
], function(DisplayObjectAttributes) {
  'use strict';

  function DisplayObject(attributes) {
    this._attributes = attributes || new DisplayObjectAttributes();
  }

  DisplayObject.prototype = {
    attr: function(name, value) {
      var key;
      var attributes = this._attributes;
      var numArguments = arguments.length;

      if (numArguments === 0) { // return an object with all values
        var copy = {};
        for (key in attributes) {
          if (startsWith(key, 'set_')) continue; // skip over setters
          if (startsWith(key, 'get_')) {
            key = key.slice(4);
            if (key in attributes) continue; // only invoke getters if no attribute is found
          }

          copy[key] = getAttribute(attributes, key, this);
        }

        return copy;
      }

      if (numArguments === 1 && typeof name === 'object') { // update attributes from object
        var values = name;
        for (key in values) {
          setAttribute(attributes, key, values[key], this);
        }
        return this;
      }

      if (numArguments === 2) { // set a single attribute
        setAttribute(attributes, name, value, this);
        return this;
      }

      return getAttribute(attributes, name, this);
    }
  };

  function startsWith(string, prefix) {
    return string.lastIndexOf(prefix, 0) === 0;
  }

  function setAttribute(attributes, name, value, owner) {
    var setterName = 'set_' + name;
    if (setterName in attributes) {
      value = attributes[setterName](value, attributes[name], owner);
    }
    if (name in attributes) {
      attributes[name] = value;
    }
  }

  function getAttribute(attributes, name, owner) {
    var getterName = 'get_' + name;
    return getterName in attributes ?
      attributes[getterName](attributes[name], owner) : attributes[name];
  }

  return DisplayObject;
});
