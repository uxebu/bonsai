/**
 * Contains the Group class.
 * @exports group
 * @requires module:display_object
 * @requires module:display_list
 * @requires module:tools
 */
// a simple container.
define([
  './display_object',
  './display_list',
  '../tools'
], function(DisplayObject, DisplayList, tools) {
  'use strict';

  /**
   * The Group constructor
   *
   * @constructor
   *
   * @extends module:display_object.DisplayObject
   * @mixes module:display_list.DisplayList
   * @memberOf module:group
   */
  function Group() {
    DisplayObject.call(this);
  }

  var proto = Group.prototype = Object.create(DisplayObject.prototype);
  tools.mixin(proto, DisplayList);

  /**
   * @see module:display_object.DisplayObject.type
   */
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
