define([
  '../tools'
], function(tools) {
  'use strict';

  var max = Math.max, min = Math.min;
  var reduce = tools.reduce;
  var removeValueFromArray = tools.removeValueFromArray;

  /**
   * The DisplayList mixin, a mixin for display objects that may contain
   *  other display objects.
   *
   * @name DisplayList
   * @mixin
   */
  var DisplayList = /** @lends DisplayList */{
    /**
     * Adds a child at the end list of contained display objects.
     *
     * If an index is given, the child is inserted at that index, moving
     * array items at that index and onwards one along. If the child is
     * inserted at a different point (different parent and/or index), it
     * is removed first.
     *
     * @param {DisplayObject} child The child to add
     * @param {number} [index] The index for the child in the DisplayList
     * @returns {this} This instance
     */
    addChild: function(child, index) {
      var hasIndex = index >= 0;

      // Add multiple children
      if (tools.isArray(child)) {
        if (hasIndex) {
          child.reverse();
        }

        tools.forEach(child, function(child) {
          if (hasIndex) {
            this.addChild(child, index);
          } else {
            this.addChild(child);
          }
        }, this);
        return this;
      }

      var stage = this.stage;

      if (child.parent) {
        child.parent.removeChild(child); //TODO: can we optimize this? //TODO: can we determine whether to use keepIndexes?
      }

      // no need to mark all children for update if already in tree
      var needsDeepMarkUpdate = !child.stage && stage;
      child.parent = this;

      var children = this._children || (this._children = []);
      var len = children.length;

      if (hasIndex) {
        if (children[index]) {
          children.splice(index, 0, child);
          len += 1;
        } else {
          children[index] = child;
        }
      } else {
        index = children.push(child) - 1;
        len += 1;
      }

      var currentIndex, next, previous;
      // find previous
      for (currentIndex = index - 1; currentIndex >= 0; currentIndex -= 1) {
        previous = children[currentIndex];
        if (previous) {
          break;
        }
      }

      if (previous) {
        next = previous.next; // no need to search in second step
        previous.next = child;
      } else {
        // find next
        for (currentIndex = index + 1; currentIndex < len; currentIndex += 1) {
          next = children[currentIndex];
          if (next) {
            break;
          }
        }
      }
      if (next) {
        child.next = next;
      }

      var registry = stage && stage.registry;
      var displayObjects = registry && registry.displayObjects;
      var registerMovie = registry && registry.movies.add;
      var needsInsertion = registry && registry.needsInsertion;
      if (needsDeepMarkUpdate) {
        var current = child, queue = [], push = queue.push;
        var i = 0;
        do {
          current._activate(stage);
          current.markUpdate();
          if (registry) {
            var id = current.id;
            displayObjects[id] = current;
            needsInsertion[id] = current;
            if (typeof current.emitFrame == 'function') { // a 'timeline-like' object
              registerMovie(current);
            }
          }
          if ((children = current._children)) {
            push.apply(queue, removeValueFromArray(children.slice()));
          }
        } while ((current = queue[i++]));
      } else {
        child._activate(stage);
        if (needsInsertion) {
          needsInsertion[child.id] = child;
        }
        child.markUpdate();
      }

      return this;
    },

    /**
     * Returns or sets the children of the display list.
     *
     * @param {DisplayObject[]} [newChildren] If specified, clears the display
     *  list and adds all passed children.
     * @param {number} [index] The starting index for the children in the DisplayList
     * @returns {this|DisplayObject[]} If called without parameter, returns a
     *  a copy of the internal array of children. Returns the display list
     *  when called with parameter.
     */
    children: function(newChildren, index) {

      if (!newChildren) {
        var children = this._children;
        // TODO: better return original?
        return children ? children.slice() : [];
      }

      this.clear();
      return this.addChild.apply(this, arguments);
    },

    /**
     * Clears the display list
     *
     * @returns {this}
     */
    clear: function() {
      var children = this._children;
      if (children) {
        children.slice(0).map(this.removeChild, this);
      }
      return this;
    },

    getComputed: function(key) {
      var children = this._children || (this._children = []);
      var isFirst = true;
      if (key === 'top' || key === 'right' || key === 'bottom' || key === 'left') {
        var attributeName = key === 'top' || key === 'bottom' ? 'y' : 'x';
        var compare = (key === 'top' || key === 'left') ? min : max;

        return tools.reduce(children, function(current, child, i) {
          if (!child) { // guard for sparse child arrays
            return current;
          }
          var childValue = child.attr(attributeName) + child.getComputed(key);
          if (isFirst) {
            isFirst = false;
            return childValue;
          }
          return compare(current, childValue);
        }, 0);
      } else {
        var size = tools.reduce(children, function(size, child) {
          if (!child) { // guard for sparse child arrays
            return size;
          }
          var childSize = child.getComputed('size');
          var childX = child.attr('x');
          var childY = child.attr('y');

          var childTop = childY + childSize.top;
          size.top = isFirst ? childTop : min(size.top, childTop);

          var childRight = childX + childSize.right;
          size.right = isFirst ? childRight : max(size.right, childRight);

          var childBottom = childY + childSize.bottom;
          size.bottom = isFirst ? childBottom : max(size.bottom, childBottom);

          var childLeft = childX + childSize.left;
          size.left = isFirst ? childLeft : min(size.left, childLeft);

          isFirst = false;

          return size;
        }, {top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0});

        size.height = size.bottom - size.top;
        size.width = size.right - size.left;

        return key === 'size' ? size : size[key];
      }
    },

    /**
     *
     * @param {child} child
     * @returns {number} The child's index, or -1 if not found
     */
    getIndexOfChild: function(child) {
      var children = this._children;
      return children ? children.indexOf(child) : -1;
    },

    /**
     * Removes a child from the display list
     *
     * @param {DisplayObject|number} child The child or index to remove.
     * @param {String} [removalStrategy='changeIndexes'] In default mode
     *  ('changeIndexes'), no gaps are left in the display list.
     *  If 'keepIndexes' is passed, the child will simply be deleted from the
     *  children array, leaving a gap.
     * @returns {this}
     */
    removeChild: function(child, removalStrategy) {

      var children = this._children,
          index = children ? children.indexOf(child) : -1;

      if (index == -1) {
        return this;
      }

      for (var i = index - 1; i >= 0; i -= 1) {
        var previous = children[i];
        if (previous) {
          previous.next = child.next;
          break;
        }
      }

      if (child.next) {
        if (removalStrategy === 'keepIndexes') {
          delete children[index];
        } else {
          children.splice(index, 1);
        }
      } else {
        children.length = index;
      }
      delete child.parent;
      delete child.next;

      var id;
      var stage = child.stage;
      var isInTree = !!stage;
      var registry = stage && stage.registry;
      var displayObjects = registry && registry.displayObjects;
      var unregisterMovie = registry && registry.movies.remove;
      var needsInsertion = registry && registry.needsInsertion;
      var current = child;
      var queue = [];
      var push = queue.push;

      if (isInTree) {
        child.markUpdate();
        index = 0;
        do {
          if (registry) {
            unregisterMovie(current);
            id = current.id;
            delete displayObjects[id];
            delete needsInsertion[id];
          }
          current._deactivate();
          if ((children = current._children)) {
            push.apply(queue, removeValueFromArray(children.slice()));
          }
        } while ((current = queue[index++]));
      }

      return this;
    }
  };

  return DisplayList;
});
