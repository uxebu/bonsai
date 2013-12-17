define([
  './attributes/DisplayObject'
], function(DisplayObjectAttributes) {
  'use strict';

  function DisplayObject(attributes) {
    this._attributes = attributes || new DisplayObjectAttributes();
    this._attributeCache = null;
  }

  DisplayObject.prototype = {
    attr: function(name, value) {
      var key;
      var attributes = this._attributes;
      var numArguments = arguments.length;

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

  function setAttribute(attributes, name, value, owner) {
    var setterName = 'set_' + name;
    if (setterName in attributes) {
      value = attributes[setterName](value, attributes[name], getAttributeCache(owner));
    }
    if (name in attributes) {
      attributes[name] = value;
    }
  }

  function getAttribute(attributes, name, owner) {
    var getterName = 'get_' + name;
    return getterName in attributes ?
      attributes[getterName](attributes[name], getAttributeCache(owner)) : attributes[name];
  }

  function getAttributeCache(displayObject) {
    return displayObject._attributeCache || (displayObject._attributeCache = {});
  }

  return DisplayObject;
});
