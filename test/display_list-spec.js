define([
  'bonsai/runner/display_list',
  'bonsai/runner/display_object',
  'common/mock'
], function(displayList, DisplayObject, mock) {
  var DisplayList = displayList.DisplayList;

  function reduce(sequence, callback, initial) {
    var accumulated, startIndex;
    var length = sequence.length;
    if (arguments.length) {
      accumulated = initial;
      startIndex = 0;
    } else {
      accumulated = sequence[0];
      startIndex = 1;
    }
    for (var i = startIndex; i < length; i += 1) {
      accumulated = callback(accumulated, sequence[i], i);
    }
    return accumulated;
  }

  function map(sequence, callback) {
    return reduce(sequence, function(mapped, item, i) {
      mapped[i] = callback(item, i);
      return mapped;
    }, []);
  }

  function filter(sequence, callback) {
    return reduce(sequence, function(filtered, item) {
      if (callback(item)) {
        filtered.push(item);
      }
      return filtered;
    }, []);
  }

  function createArbitraryDisplayObject() {
    return new DisplayObject()
  }
  createArbitraryDisplayObject.objectId = 0;

  function createDisplayList(owner) {
    return new DisplayList(owner || createArbitraryDisplayObject());
  }

  function createArbitraryGroup() {
    var group = createArbitraryDisplayObject();
    group.displayList = createDisplayList(group);

    return group;
  }

  function createStage() {
    return mock.createStage();
  }

  describe('DisplayList', function() {
    describe('constructor', function() {
      it('should expose the first argument as `owner` property', function() {
        var owner = createArbitraryDisplayObject();
        expect(createDisplayList(owner).owner).toBe(owner);
      });
    });

    describe('instances', function() {
      it('should have a `children` property being an array', function() {
        expect(createDisplayList()).toHaveOwnProperties('children');
        expect(createDisplayList().children).toBeArray();
      })
    });

    describe('prototype', function() {
      describe('add', function() {
        it('should not replace its children property, but modify it in place', function() {
          var displayList = createDisplayList();
          var children = displayList.children;

          displayList.add(createArbitraryDisplayObject());
          expect(displayList.children).toBe(children);
        });

        it('should not replace its children property, but modify it in ' +
          'place when adding an array', function() {

          var displayList = createDisplayList();
          var children = displayList.children;

          displayList.add([createArbitraryDisplayObject(), createArbitraryDisplayObject()]);
          expect(displayList.children).toBe(children);
        });

        it('should append a child to an empty list', function() {
          var displayList = createDisplayList();
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild);
          expect(displayList.children).toEqual([newChild]);
        });

        it('should append an array of children to an empty list', function() {
          var displayList = createDisplayList();
          var newChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];

          displayList.add(newChildren);
          expect(displayList.children).toEqual(newChildren);
          expect(displayList.children).toHaveLength(3);
        });

        it('should append a child to a non-empty list', function() {
          var displayList = createDisplayList();
          var existingChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];
          displayList.add(existingChildren);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild);
          expect(displayList.children).toEqual(existingChildren.concat(newChild));
        });

        it('should append an array of children to a non-empty list', function() {
          var displayList = createDisplayList();
          var existingChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];
          displayList.add(existingChildren);
          var newChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];

          displayList.add(newChildren);
          expect(displayList.children).toEqual(existingChildren.concat(newChildren));
        });

        it('should insert a child at a specified index', function() {
          var displayList = createDisplayList();
          var existingChild1 = createArbitraryDisplayObject();
          var existingChild2 = createArbitraryDisplayObject();
          displayList.add([existingChild1, existingChild2]);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild, 1);
          expect(displayList.children).toEqual([existingChild1, newChild, existingChild2]);
        });

        it('should insert an array of children at a specified index', function() {
          var displayList = createDisplayList();
          var existingChild1 = createArbitraryDisplayObject();
          var existingChild2 = createArbitraryDisplayObject();
          displayList.add([existingChild1, existingChild2]);
          var newChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];

          displayList.add(newChildren, 1);
          expect(displayList.children)
            .toEqual([existingChild1].concat(newChildren, existingChild2));
        });

        it('should append a child to the end of the list if the specified ' +
          'index is higher than the length of the list', function() {

          var displayList = createDisplayList();
          var existingChild1 = createArbitraryDisplayObject();
          var existingChild2 = createArbitraryDisplayObject();
          displayList.add([existingChild1, existingChild2]);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild, 16);
          expect(displayList.children).toEqual([existingChild1, existingChild2, newChild]);
        });

        it('should append an array of children to the end of the list if the ' +
          'specified index is higher than the length of the list', function() {

          var displayList = createDisplayList();
          var existingChild1 = createArbitraryDisplayObject();
          var existingChild2 = createArbitraryDisplayObject();
          displayList.add([existingChild1, existingChild2]);
          var newChildren = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];

          displayList.add(newChildren, 16);
          expect(displayList.children).toEqual([existingChild1, existingChild2].concat(newChildren));
        });

        it('should set the parent property of the added child to the owner ' +
          'of the display list', function() {

          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild);
          expect(newChild.parent).toBe(owner);
        });

        it('should set the parent property of the added children to the owner ' +
          'of the display list when adding an array of children', function() {

          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);
          var newChild1 = createArbitraryDisplayObject();
          var newChild2 = createArbitraryDisplayObject();
          var newChild3 = createArbitraryDisplayObject();

          displayList.add([newChild1, newChild2, newChild3]);
          expect(newChild1.parent).toBe(owner);
          expect(newChild2.parent).toBe(owner);
          expect(newChild3.parent).toBe(owner);
        });

        it('should set the parent property of the added child to the owner ' +
          'of the display list when adding with index', function() {

          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);
          displayList.add([
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ]);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild, 1);
          expect(newChild.parent).toBe(owner);
        });

        it('should set the parent property of the added children to the owner ' +
          'of the display list when adding an array of children with index', function() {

          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);
          displayList.add([
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ]);
          var newChild1 = createArbitraryDisplayObject();
          var newChild2 = createArbitraryDisplayObject();
          var newChild3 = createArbitraryDisplayObject();

          displayList.add([newChild1, newChild2, newChild3], 1);
          expect(newChild1.parent).toBe(owner);
          expect(newChild2.parent).toBe(owner);
          expect(newChild3.parent).toBe(owner);
        });

        it('should set the next property on the previous sibling', function() {
          var displayList = createDisplayList();
          var previousSibling = createArbitraryDisplayObject();
          displayList.add(previousSibling);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild);
          expect(previousSibling.next).toBe(newChild);
        });

        it('should set the next property on a newly added child to undefined', function() {
          var displayList = createDisplayList();
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild);
          expect(newChild.next).toBe(void 0);
        });

        it('should set the next property on a new child when added with index', function() {
          var displayList = createDisplayList();
          var existingChild = createArbitraryDisplayObject();
          displayList.add(existingChild);
          var newChild = createArbitraryDisplayObject();

          displayList.add(newChild, 0);
          expect(newChild.next).toBe(existingChild);
        });

        it('should treat an undefined (but given) index parameter as if only one argument was passed and append the child', function() {
          var displayList = createDisplayList();
          displayList.add([
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()]
          );

          var newChild = createArbitraryDisplayObject();
          displayList.add(newChild, void 0);
          expect(displayList.children.indexOf(newChild)).toBe(3);
        });

        it('should avoid adding the owner of a display list to the display list', function() {
          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);

          displayList.add(owner);
          expect(displayList.children).toEqual([]);
        });

        it('should set the next property on the previous sibling when adding ' +
          'an array of children', function() {

          var displayList = createDisplayList();
          var previousSibling = createArbitraryDisplayObject();
          displayList.add(previousSibling);
          var newChild = createArbitraryDisplayObject();

          displayList.add([newChild, createArbitraryDisplayObject()]);
          expect(previousSibling.next).toBe(newChild);
        });

        it('should set the next properties of all added children when appending', function() {
          var displayList = createDisplayList();
          var newChild1 = createArbitraryDisplayObject();
          var newChild2 = createArbitraryDisplayObject();
          var newChild3 = createArbitraryDisplayObject();

          displayList.add([newChild1, newChild2, newChild3]);
          expect(newChild1.next).toBe(newChild2);
          expect(newChild2.next).toBe(newChild3);
          expect(newChild3.next).toBe(void 0);
        });

        it('should set the next properties of all added children when adding with index', function() {
          var displayList = createDisplayList();
          var existingChild = createArbitraryDisplayObject();
          displayList.add(existingChild);

          var newChild1 = createArbitraryDisplayObject();
          var newChild2 = createArbitraryDisplayObject();
          var newChild3 = createArbitraryDisplayObject();

          displayList.add([newChild1, newChild2, newChild3], 0);
          expect(newChild1.next).toBe(newChild2);
          expect(newChild2.next).toBe(newChild3);
          expect(newChild3.next).toBe(existingChild);
        });

        it('should avoid adding the owner of a display list to the display list', function() {
          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);

          displayList.add(owner);
          expect(displayList.children).toEqual([]);
        });

        it('should avoid adding the owner of a display list to the display ' +
          'list when adding an array', function() {
          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);

          displayList.add([createArbitraryDisplayObject(), owner, createArbitraryDisplayObject()]);
          expect(displayList.children).toEqual([]);
        });

        it('should avoid adding the owner of a display list to the display ' +
          'list when the owner is contained by a sub hierarchy', function() {
          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);

          var group = createArbitraryGroup();
          group.displayList.add(owner);

          displayList.add(group);
          expect(displayList.children).toEqual([]);
        });

        it('should call the _activate method of a new child, passing the ' +
          'stage of the owner', function() {

          var owner = createArbitraryDisplayObject();
          var stage = owner.stage = createStage();
          var displayList = createDisplayList(owner);

          var newChild = createArbitraryDisplayObject();
          newChild._activate = jasmine.createSpy('_activate');

          displayList.add(newChild);
          expect(newChild._activate).toHaveBeenCalledWith(stage)
        });

        it('should not call the _activate method of a new child if the parent ' +
          'is not contained by the stage (its stage property has no value)', function() {

          var owner = createArbitraryDisplayObject();
          var displayList = createDisplayList(owner);

          var newChild = createArbitraryDisplayObject();
          newChild._activate = jasmine.createSpy('_activate');

          displayList.add(newChild);
          expect(newChild._activate).not.toHaveBeenCalled();
        });

        it('should remove a display object from its old parent before adding', function() {
          var oldParent = createArbitraryGroup();
          var newParent = createArbitraryGroup();
          var child = createArbitraryDisplayObject();

          oldParent.displayList.add(child);
          newParent.displayList.add(child);

          expect(oldParent.displayList.children).toEqual([]);
        });

        it('should remove all display objects from their old parent before adding', function() {
          var oldParent = createArbitraryGroup();
          var newParent = createArbitraryGroup();
          var children = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];

          oldParent.displayList.add(children);
          newParent.displayList.add(children);

          expect(oldParent.displayList.children).toEqual([]);
        });
      });

      describe('remove()', function() {
        function testRemoval(existingChildren) {
          var removeIndex = reduce(existingChildren, function(removeIndex, item, i) {
            return item ? removeIndex : i;
          }, existingChildren.length);

          var initialChildren = map(existingChildren, function(indexHasChild) {
            return indexHasChild ? createArbitraryDisplayObject() : void 0;
          });

          var expected = filter(initialChildren, Boolean);
          var childToRemove = initialChildren[removeIndex] =
            createArbitraryDisplayObject();

          var displayList = createDisplayList();
          displayList.add(initialChildren);

          displayList.remove(childToRemove);
          expect(displayList.children).toEqual(expected)
        }

        it('should not replace its children property, but modify it in place', function() {
          var displayList = createDisplayList();
          var children = displayList.children;

          var child = createArbitraryDisplayObject();
          displayList.add(child);

          displayList.remove(child);
          expect(displayList.children).toBe(children);
        });

        it('should return true if the child was removed (was an actual child)', function() {
          var displayList = createDisplayList();
          var child = createArbitraryDisplayObject();
          displayList.add(child);

          expect(displayList.remove(child)).toBe(true);
        });

        it('should return true if the display object is not contained by the display list', function() {
          var displayList = createDisplayList();
          var child = createArbitraryDisplayObject();

          expect(displayList.remove(child)).toBe(false);
        });

        it('removes a child at from a display list containing only that child', function() {
          testRemoval([]);
        });

        it('removes a child from the end of the display list', function() {
          testRemoval([{}, {}]);
        });
        it('removes a child from the start of the display list', function() {
          testRemoval([ , {}, {}]);
        });
        it('removes a child from the middle of the display list', function() {
          testRemoval([{}, , {}]);
        });
        it('does not do anything when called with a child not contained by ' +
          'the display list', function() {

          var displayList = createDisplayList();
          var children = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];
          displayList.add(children);

          displayList.remove(createArbitraryDisplayObject());
          expect(displayList.children).toEqual(children);
          expect(displayList.children).toHaveLength(3);
        });
        it('sets the parent property of the removed child to undefined', function() {
          var displayList = createDisplayList();
          var child1 = createArbitraryDisplayObject();
          var childToRemove = createArbitraryDisplayObject();
          var child3 = createArbitraryDisplayObject();

          displayList.add([child1, childToRemove, child3]);

          displayList.remove(childToRemove);
          expect(childToRemove.parent).toBe(void 0);
        });
        it('sets the next property of the removed child to undefined', function() {
          var displayList = createDisplayList();
          var child1 = createArbitraryDisplayObject();
          var childToRemove = createArbitraryDisplayObject();
          var child3 = createArbitraryDisplayObject();

          displayList.add([child1, childToRemove, child3]);

          displayList.remove(childToRemove);
          expect(childToRemove.next).toBe(void 0);
        });
        it('sets the next property of the preceding sibling correctly', function() {
          var displayList = createDisplayList();
          var child1 = createArbitraryDisplayObject();
          var childToRemove = createArbitraryDisplayObject();
          var child3 = createArbitraryDisplayObject();

          displayList.add([child1, childToRemove, child3]);

          displayList.remove(childToRemove);
          expect(child1.next).toBe(child3);
        });
        it('should invoke the _deactivate method of the removed display object', function() {
          var owner = createArbitraryDisplayObject();
          owner.stage = createStage();
          var displayList = createDisplayList(owner);
          var child = createArbitraryDisplayObject();
          child._deactivate = jasmine.createSpy('_deactivate');
          displayList.add(child);

          displayList.remove(child);
          expect(child._deactivate).toHaveBeenCalled();
        });
        it('should not invoke the _deactivate method of the removed display ' +
          'object if it was not contained by the stage', function() {
          var displayList = createDisplayList();
          var child = createArbitraryDisplayObject();
          child._deactivate = jasmine.createSpy('_deactivate');
          displayList.add(child);

          displayList.remove(child);
          expect(child._deactivate).not.toHaveBeenCalled();
        });
      });

      describe('clear()', function() {
        var children, displayList;
        beforeEach(function() {
          displayList = createDisplayList();
          displayList.owner.stage = createStage();
          children = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];
          displayList.add(children);
        });

        it('should not replace its children property, but modify it in place', function() {
          var displayList = createDisplayList();
          var children = displayList.children;
          displayList.add(createArbitraryDisplayObject());

          displayList.clear();
          expect(displayList.children).toBe(children);
        });

        it('should remove all display objects', function() {
          displayList.clear();
          expect(displayList.children).toEqual([])
        });

        it('should call the _deactivate method of all children', function() {
          map(children, function(child) {
            child._deactivate = jasmine.createSpy('_deactivate');
          });

          displayList.clear();
          expect(children[0]._deactivate).toHaveBeenCalled();
          expect(children[1]._deactivate).toHaveBeenCalled();
          expect(children[2]._deactivate).toHaveBeenCalled();
        });

        it('should not call the _deactivate method of any child not contained by the stage', function() {
          map(children, function(child) {
            child._deactivate = jasmine.createSpy('_deactivate');
          });
          [displayList.owner].concat(children).forEach(function(displayObject) {
            displayObject.stage = undefined;
          });

          displayList.clear();
          expect(children[0]._deactivate).not.toHaveBeenCalled();
          expect(children[1]._deactivate).not.toHaveBeenCalled();
          expect(children[2]._deactivate).not.toHaveBeenCalled();
        });

        it('should set the next property of each child to undefined', function() {
          displayList.clear();

          expect(children[0].next).toBe(void 0);
          expect(children[1].next).toBe(void 0);
          expect(children[2].next).toBe(void 0);
        });

        it('should set the parent property of each child to undefined', function() {
          displayList.clear();

          expect(children[0].parent).toBe(void 0);
          expect(children[1].parent).toBe(void 0);
          expect(children[2].parent).toBe(void 0);
        });
      });

      describe('contains()', function() {
        var displayList, candidate;
        beforeEach(function() {
          displayList = createDisplayList();
          displayList.add([
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ]);
          candidate = createArbitraryDisplayObject();
        });
        it('should return false if a display object is not contained by the display list', function() {
          expect(displayList.contains(candidate)).toBe(false);
        });
        it('should return true if a display object is contained by the display list', function() {
          displayList.add(candidate, 1);
          expect(displayList.contains(candidate)).toBe(true);
        });
        it('should return false if the display list has child display list that don\'t contain the object', function() {
          var subList = createArbitraryGroup();
          subList.displayList.add([
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ]);
          displayList.add(subList);

          expect(displayList.contains(candidate)).toBe(false);
        });
        it('should return true if a display object is contained by a sub display list', function() {
          var subList = createArbitraryGroup();
          subList.displayList.add([
            createArbitraryDisplayObject(),
            candidate,
            createArbitraryDisplayObject()
          ]);
          displayList.add(subList);

          expect(displayList.contains(candidate)).toBe(true);
        });

      });
    });
  });
});
