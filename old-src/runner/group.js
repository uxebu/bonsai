define([
  './display_object',
  './display_list',
  '../tools'
], function(DisplayObject, displayList, tools) {
  'use strict';

  var DisplayList = displayList.DisplayList;

  /**
   * Creates an empty Group instance
   *
   * @classdesc A group is a DisplayObject that can contain other DisplayObjects.
   * @constructor
   * @name Group
   * @extends DisplayObject
   * @mixes displayList.methods
   */
  function Group(displayList) {
    if (!displayList) {
      displayList = new DisplayList();
    }
    displayList.owner = this;
    this.displayList = displayList;
    DisplayObject.call(this);
  }

  /** @lends Group.prototype */
  var proto = Group.prototype = Object.create(DisplayObject.prototype);
  tools.mixin(proto, displayList.methods);

  proto.type = 'Group';

  /**
   * Returns a clone of the group.
   *
   * Will recursively add all children to the clone that have a clone()
   * method. Will skip those that do not.
   *
   * @param {Object} [cloneOptions]
   * @param {boolean} [cloneOptions.attributes] Whether to clone attributes
   *
   * @returns {Group} The clone
   */
  proto.clone = function(cloneOptions) {
    var clone = new Group();
    if (cloneOptions.attributes) {
      clone.attr(this.attr());
    }
    this.children().forEach(function(child) {
      child.clone && clone.addChild(child.clone(cloneOptions));
    }, this);
    return clone;
  };

  return Group;
});
