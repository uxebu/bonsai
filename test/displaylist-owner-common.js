define(function() {
  'use strict';

  function createMockDisplayList() {
    return {
      children: [],
      add: jasmine.createSpy('add'),
      clear: jasmine.createSpy('clear'),
      remove: jasmine.createSpy('remove')
    }
  }

  var id = 0;
  function createMockDisplayObject() {
    return {
      id: id += 1,
      markUpdate: jasmine.createSpy('markUpdate')
    };
  }

  return function(createOwner) {
    var displayList, owner;
    beforeEach(function() {
      displayList = createMockDisplayList();
      owner = createOwner(displayList);
    });
    describe('addChild()', function() {

      it('forwards a single argument to this.displayList.add', function() {
        var child = createMockDisplayObject();
        owner.addChild(child);
        expect(displayList.add).toHaveBeenCalledWith(child);
      });

      it('forwards both arguments to this.displayList.add', function() {
        var child = createMockDisplayObject(), depth = 15;
        owner.addChild(child, depth);
        expect(displayList.add).toHaveBeenCalledWith(child, depth);
      });

      it('returns the instance', function() {
        expect(owner.addChild(createMockDisplayObject())).toBe(owner);
      });
    });

    describe('children()', function() {
      describe('called without parameters', function() {
        it('should return the children of the display list', function() {
          var children = displayList.children = [
            createMockDisplayObject(),
            createMockDisplayObject(),
            createMockDisplayObject()
          ];
          var expected = children.slice();

          expect(owner.children()).toEqual(expected);
        });
      });

      describe('called with an array of children', function() {
        it('calls clear() and add(newChildren) on the display list in that order', function() {
          var newChildren = [createMockDisplayObject(), createMockDisplayObject()];
          var calls = [];
          displayList.add.andCallFake(function() {
            calls.push('add');
          });
          displayList.clear.andCallFake(function() {
            calls.push('clear');
          });

          owner.children(newChildren);
          expect(calls).toEqual(['clear', 'add']);
          expect(displayList.clear).toHaveBeenCalled();
          expect(displayList.add).toHaveBeenCalledWith(newChildren);
        });

        it('returns the instance', function() {
          expect(owner.children([])).toBe(owner);
        });
      });

      describe('clear()', function() {
        it('calls this.displayList.clear', function() {
          owner.clear();
          expect(displayList.clear).toHaveBeenCalled();
        });

        it('returns the instance', function() {
          expect(owner.clear()).toBe(owner);
        });
      });

      describe('getIndexOfChild()', function() {
        var children;
        beforeEach(function() {
          children = displayList.children = [
            createMockDisplayObject(),
            createMockDisplayObject(),
            createMockDisplayObject()
          ];
        });
        it('returns the position of the first child', function() {
          expect(owner.getIndexOfChild(children[0])).toBe(0);
        });
        it('returns the position of the last child', function() {
          var position = children.length - 1;
          expect(owner.getIndexOfChild(children[position])).toBe(position);
        });
        it('returns the position of a child in the middle', function() {
          expect(owner.getIndexOfChild(children[1])).toBe(1);
        });
        it('returns -1 for objects not contained by the display list', function() {
          expect(owner.getIndexOfChild(createMockDisplayObject())).toBe(-1);
        });
      });

      describe('markUpdate', function() {
        it('should call markUpdate on all children', function() {
          var children = displayList.children = [
            createMockDisplayObject(),
            createMockDisplayObject(),
            createMockDisplayObject()
          ];

          owner.markUpdate();
          expect(children[0].markUpdate).toHaveBeenCalled();
          expect(children[1].markUpdate).toHaveBeenCalled();
          expect(children[2].markUpdate).toHaveBeenCalled();
        });

        it('returns the instance', function() {
          expect(owner.markUpdate()).toBe(owner);
        });
      });

      describe('removeChild', function() {
        it('calls this.displayList.remove with the first argument', function() {

        });
        it('returns the instance', function() {
          expect(owner.removeChild(createMockDisplayObject())).toBe(owner);
        });
      });
    });
  }
});


//describe('getIndexOfChild()', function() {
//  var displayList, children;
//  beforeEach(function() {
//    displayList = createDisplayList();
//    children = [
//      createArbitraryDisplayObject(),
//      createArbitraryDisplayObject(),
//      createArbitraryDisplayObject()
//    ];
//    displayList.add(children);
//  });
//
//  it('should return the correct index for a child at the beginning of the list', function() {
//    expect(displayList.getIndexOfChild(children[0])).toBe(0);
//  });
//});
