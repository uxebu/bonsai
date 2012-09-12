require([
  'bonsai/runner/display_list',
  'bonsai/runner/display_object',
  'bonsai/runner/movie',
  'bonsai/runner/stage',
  'bonsai/tools',
  'bonsai/event_emitter',
  'common/mock',
  './fake_messageproxy',
  './runner.js'
], function(displayList, DisplayObject, Movie, Stage, tools, EventEmitter, mock, fakeMessageproxy) {
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
    return createArbitraryGroup();
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

        it('should remove a display object from its old parent before adding', function() {
          var oldParent = createArbitraryGroup();
          var newParent = createArbitraryGroup();
          var child = createArbitraryDisplayObject();

          oldParent.displayList.add(child);
          newParent.displayList.add(child);

          expect(oldParent.displayList.children).toEqual([]);
        });
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
          var displayList = createDisplayList();
          var child = createArbitraryDisplayObject();
          child._deactivate = jasmine.createSpy('_deactivate');
          displayList.add(child);

          displayList.remove(child);
          expect(child._deactivate).toHaveBeenCalled();
        });
      });

      describe('clear()', function() {
        var children, displayList;
        beforeEach(function() {
          displayList = createDisplayList();
          children = [
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject(),
            createArbitraryDisplayObject()
          ];
          displayList.add(children);
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
    });
  });

  return;
  function CustomDisplayList() {
    DisplayObject.call(this);
  }

  tools.mixin(
    CustomDisplayList.prototype = Object.create(DisplayObject.prototype),
    DisplayList
  );


  var mockDisplayObjectIds = 0;
  function MockDisplayObject() {
    this.id = (mockDisplayObjectIds += 1);
    this._activate = jasmine.createSpy('e');
    this._deactivate = jasmine.createSpy('_deactivate');
    this.markUpdate = jasmine.createSpy('markUpdate');
  }

  function createFakeStage() {
    return new Stage(fakeMessageproxy, function() {});
  }

  describe('DisplayList', function() {
    var stage = createFakeStage();
    beforeEach(function() {
      stage.clear();
    });

    describe('addChild', function() {

      it('add should return "this"', function(){
        var dl = createDisplayList();
        expect(dl.addChild(new DisplayObject)).toBe(dl);
      });

      it('Adds a child at the end of the list of display objects', function() {
        var dl = createDisplayList(),
            d = new DisplayObject;
        dl.addChild(d);
        expect(dl.children()).toEqual([d]);
      });

      it('Adds a child at a specified index', function() {

        var dl = createDisplayList(),
            a = new DisplayObject,
            b = new DisplayObject,
            c = new DisplayObject,
            children;

        dl.addChild(a, 0);
        dl.addChild(b, 1);
        dl.addChild(c, 1); // place c where b was (b should move along)
        children = dl.children();
        expect(children.length).toBe(3);
        expect(children[0]).toBe(a);
        expect(children[1]).toBe(c);
        expect(children[2]).toBe(b);
      });

      it('Adds multiple children', function() {
        var dl = createDisplayList(),
            a = new DisplayObject,
            b = new DisplayObject,
            c = new DisplayObject;
        dl.addChild([a, b, c]);
        expect(dl.children()).toEqual([a, b, c]);
      });

      it('Adds multiple children at specified index', function() {
        var dl = createDisplayList(),
            a1 = new DisplayObject,
            a2 = new DisplayObject,
            c1 = new DisplayObject,
            c2 = new DisplayObject,
            c3 = new DisplayObject;
        dl.addChild(a1);
        dl.addChild(a2);
        dl.addChild([c1, c2, c3], 1);
        expect(dl.children()).toEqual([a1, c1, c2, c3, a2]);
      });

      it('Avoid adding a displaylist to itself', function() {
        var dl = createDisplayList();
        dl.addChild(dl);
        expect(dl.children().length).toBe(0);
      });

      it('Adds child to registry::displayObjects', function() {

        var dl = createDisplayList(),
            child = new DisplayObject;

        stage.addChild(dl);
        dl.addChild(child);

        expect(stage.registry.displayObjects[child.id]).toBe(child);
      });

      describe('Sets the .next property on added display objects', function() {
        it('should set the property to undefined when no other child exist', function() {
          var dl = createDisplayList(),
            child = new DisplayObject;
          dl.addChild(child);
          expect(child.next).toBeUndefined();
        });

        it('should set the property to undefined when no other child exist when adding at an index', function() {
          var dl = createDisplayList(),
            child = new DisplayObject;
          dl.addChild(child, 3);
          expect(child.next).toBeUndefined();
        });
        it('should set the property to undefined when no other child follows', function() {
          var dl = createDisplayList(),
            child = new DisplayObject;

          dl.addChild(new DisplayObject);

          dl.addChild(child);
          expect(child.next).toBeUndefined();
        });

        it('should set the property to undefined when no other child follows when adding at an index', function() {
          var dl = createDisplayList(),
            child = new DisplayObject;

          dl.addChild(new DisplayObject, 2);

          dl.addChild(child, 3);
          expect(child.next).toBeUndefined();
        });

        it('should set the property to the next existing display object', function() {
          var dl = createDisplayList(),
            child = new DisplayObject,
            next = new DisplayObject;

          dl.addChild(next, 3);
          dl.addChild(child, 2);
          expect(child.next).toBe(next);
        });

        it('should set the property to the next existing display object when gaps exist', function() {
          var dl = createDisplayList(),
            child = new DisplayObject,
            next = new DisplayObject;

          dl.addChild(next, 5);
          dl.addChild(child, 2);
          expect(child.next).toBe(next);
        });

        it('should set the property on the preceding object when adding', function() {
          var dl = createDisplayList(),
              child = new DisplayObject,
              previous = new DisplayObject;

          dl.addChild(previous);
          dl.addChild(child);

          expect(previous.next).toBe(child);
        });

        it('should set the property on the preceding object when adding with a gap', function() {
          var dl = createDisplayList(),
            child = new DisplayObject,
            previous = new DisplayObject;

          dl.addChild(previous, 2);
          dl.addChild(child, 4);

          expect(previous.next).toBe(child);
        });
      });

      describe('Resets the .next property correctly', function() {
        it('resets the property correctly when removing the last element', function() {
          var dl = createDisplayList(),
            child = new DisplayObject,
            toRemove = new DisplayObject;

          dl.addChild(child);
          dl.addChild(toRemove);

          dl.removeChild(toRemove);

          expect(child.next).toBeUndefined();
        });

        it('resets the property correctly when removing an element in the middle', function() {
          var dl = createDisplayList(),
            first = new DisplayObject,
            toRemove = new DisplayObject,
            last = new DisplayObject;

          dl.addChild(first);
          dl.addChild(toRemove);
          dl.addChild(last);

          dl.removeChild(toRemove);

          expect(first.next).toBe(last);
        });

        it('does not reset other .next properties incorrectly', function() {
          var dl = createDisplayList(),
              first = new DisplayObject,
              second = new DisplayObject,
              third = new DisplayObject,
              fourth = new DisplayObject,
              fifth = new DisplayObject;

          dl.addChild(first);
          dl.addChild(second);
          dl.addChild(third);
          dl.addChild(fourth);
          dl.addChild(fifth);

          dl.removeChild(third);
          expect(first.next).toBe(second);
          expect(fourth.next).toBe(fifth);
          expect(fifth.next).toBeUndefined();
        });
      });

    });

    describe('getIndexOfChild', function() {

      it('Gets the child at ths specified index', function() {

        var dl = createDisplayList(),
            a = new DisplayObject,
            b = new DisplayObject;

        dl.addChild(a);
        dl.addChild(b);
        expect(dl.getIndexOfChild(b)).toBe(1);
        expect(dl.getIndexOfChild(a)).toBe(0);
      });
    });

    describe('removeChild', function() {

      it('Removes child from registry::displayObjects', function() {

        var dl = createDisplayList(),
            child = new DisplayObject;

        stage.addChild(dl);
        dl.addChild(child);
        expect(stage.registry.displayObjects[child.id]).toBe(child);
        dl.removeChild(child);
        expect(stage.registry.displayObjects[child.id]).toBe(void 0);
      });

      it('Removes a child from the children array of the display list', function() {
        var childToRemove = new MockDisplayObject();
        var child1 = new MockDisplayObject();
        var child3 = new MockDisplayObject();
        var child4 = new MockDisplayObject();
        var children = [child1, childToRemove, child3, child4];
        var displayList = createDisplayList();
        displayList.children(children);

        displayList.removeChild(childToRemove);
        expect(displayList.children()).toEqual([child1, child3, child4]);
      });

      it('Deletes a child from the children array of the display list', function() {
        var childToRemove = new MockDisplayObject();
        var child1 = new MockDisplayObject();
        var child3 = new MockDisplayObject();
        var child4 = new MockDisplayObject();
        var children = [child1, childToRemove, child3, child4];
        var displayList = createDisplayList();
        displayList.children(children);

        displayList.removeChild(childToRemove, 'keepIndexes');
        expect(displayList.children()).toEqual([child1, , child3, child4]);
      });
    });

    describe('#getComputed()', function() {
      function createChild(x, y, top, right, bottom, left) {
        return tools.mixin(
          new MockDisplayObject(),
          {
            getComputed: function(key) {
              var size = {
                top: top,
                right: right,
                bottom: bottom,
                left: left,
                height: bottom - top,
                width: right - left
              };

              return key === 'size' ? size : size[key];
            },

            attr: function(key) {
              return key === 'x' ? x : y;
            }
          }
        );
      }

      describe('without children', function() {
        var displayList = createDisplayList();

        it('computes the correct value for "top"', function() {
          expect(displayList.getComputed('top')).toBe(0);
        });

        it('computes the correct value for "right"', function() {
          expect(displayList.getComputed('right')).toBe(0);
        });

        it('computes the correct value for "bottom"', function() {
          expect(displayList.getComputed('bottom')).toBe(0);
        });

        it('computes the correct value for "left"', function() {
          expect(displayList.getComputed('left')).toBe(0);
        });

        it('computes the correct value for "width"', function() {
          expect(displayList.getComputed('width')).toBe(0);
        });

        it('computes the correct value for "height"', function() {
          expect(displayList.getComputed('height')).toBe(0);
        });

        it('computes the correct size object', function() {
          expect(displayList.getComputed('size')).toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            height: 0,
            width: 0
          });
        });
      });

      describe('with one child', function() {
        var displayList = createDisplayList();
        var x = 7, y = 9, top = 11, right = 113, bottom = 127, left = 13;
        displayList.addChild(createChild(x, y, top, right, bottom, left));

        var expectedTop = top + y,
            expectedRight = right + x,
            expectedBottom = bottom + y,
            expectedLeft = left + x,
            expectedWidth = expectedRight - expectedLeft,
            expectedHeight = expectedBottom - expectedTop;

        it('computes the correct value for "top"', function() {
          expect(displayList.getComputed('top')).toBe(expectedTop);
        });

        it('computes the correct value for "right"', function() {
          expect(displayList.getComputed('right')).toBe(expectedRight);
        });

        it('computes the correct value for "bottom"', function() {
          expect(displayList.getComputed('bottom')).toBe(expectedBottom);
        });

        it('computes the correct value for "left"', function() {
          expect(displayList.getComputed('left')).toBe(expectedLeft);
        });

        it('computes the correct value for "width"', function() {
          expect(displayList.getComputed('width')).toBe(expectedWidth);
        });

        it('computes the correct value for "height"', function() {
          expect(displayList.getComputed('height')).toBe(expectedHeight);
        });

        it('computes the correct size object', function() {
          expect(displayList.getComputed('size')).toEqual({
            top: expectedTop,
            right: expectedRight,
            bottom: expectedBottom,
            left: expectedLeft,
            height: expectedHeight,
            width: expectedWidth
          });
        });
      });

      describe('with two children', function() {
        var displayList = createDisplayList();
        var x1 = 7, y1 = 9, top1 = 11, right1 = 113, bottom1 = 127, left1 = 13;
        var x2 = 53, y2 = 59, top2 = 17, right2 = 251, bottom2 = 257, left2 = 19;


        displayList.addChild(createChild(x1, y1, top1, right1, bottom1, left1), 1);
        displayList.addChild(createChild(x2, y2, top2, right2, bottom2, left2), 3);

        var expectedTop = Math.min(top1 + y1, top2 + y2),
            expectedRight = Math.max(right1 + x1, right2 + x2),
            expectedBottom = Math.max(bottom1 + y1, bottom2 + y2),
            expectedLeft = Math.min(left1 + x1, left2 + x2),
            expectedWidth = expectedRight - expectedLeft,
            expectedHeight = expectedBottom - expectedTop;

        it('computes the correct value for "top"', function() {
          expect(displayList.getComputed('top')).toBe(expectedTop);
        });

        it('computes the correct value for "right"', function() {
          expect(displayList.getComputed('right')).toBe(expectedRight);
        });

        it('computes the correct value for "bottom"', function() {
          expect(displayList.getComputed('bottom')).toBe(expectedBottom);
        });

        it('computes the correct value for "left"', function() {
          expect(displayList.getComputed('left')).toBe(expectedLeft);
        });

        it('computes the correct value for "width"', function() {
          expect(displayList.getComputed('width')).toBe(expectedWidth);
        });

        it('computes the correct value for "height"', function() {
          expect(displayList.getComputed('height')).toBe(expectedHeight);
        });

        it('computes the correct size object', function() {
          expect(displayList.getComputed('size')).toEqual({
            top: expectedTop,
            right: expectedRight,
            bottom: expectedBottom,
            left: expectedLeft,
            height: expectedHeight,
            width: expectedWidth
          });
        });
      });
    });
  });
});
