define([
  './mock',
  'bonsai/runner/matrix',
  'bonsai/runner/path/path'
],function(mock, Matrix, Path) {
  'use strict';

  return function(createOwner, skipDisplayObjectTests) {
    var displayList, owner;
    beforeEach(function() {
      displayList = mock.createDisplayList();
      owner = createOwner(displayList);
    });

    skipDisplayObjectTests || describe('lifecycle', function() {
      var child1, child2, child3;
      beforeEach(function() {
        child1 = mock.createDisplayObject();
        child2 = mock.createDisplayObject();
        child3 = mock.createDisplayObject();
        displayList.children = [child1, child2, child3];
        owner.parent = mock.createDisplayObject();
      });

      describe('_activate()', function() {
        it('should call activate on all children and forward the stage property', function() {
          var stage = mock.createStage();
          owner._activate(stage);
          expect(child1._activate).toHaveBeenCalledWith(stage);
          expect(child2._activate).toHaveBeenCalledWith(stage);
          expect(child3._activate).toHaveBeenCalledWith(stage);
        });
      });

      describe('_deactivate()', function() {
        it('should call _deactivate on all children', function() {
          owner._deactivate();

          expect(child1._deactivate).toHaveBeenCalled();
          expect(child2._deactivate).toHaveBeenCalled();
          expect(child3._deactivate).toHaveBeenCalled();
        });
      });
    });


    describe('addChild()', function() {

      it('forwards a single argument to this.displayList.add', function() {
        var child = mock.createDisplayObject();
        owner.addChild(child);
        expect(displayList.add).toHaveBeenCalledWith(child, void 0);
      });

      it('forwards both arguments to this.displayList.add', function() {
        var child = mock.createDisplayObject(), depth = 15;
        owner.addChild(child, depth);
        expect(displayList.add).toHaveBeenCalledWith(child, depth);
      });

      it('returns the instance', function() {
        expect(owner.addChild(mock.createDisplayObject())).toBe(owner);
      });
    });

    describe('children()', function() {
      describe('called without parameters', function() {
        it('should return the children of the display list', function() {
          var children = displayList.children = [
            mock.createDisplayObject(),
            mock.createDisplayObject(),
            mock.createDisplayObject()
          ];
          var expected = children.slice();

          expect(owner.children()).toEqual(expected);
        });
      });

      describe('called with an array of children', function() {
        it('calls clear() and add(newChildren) on the display list in that order', function() {
          var newChildren = [
            mock.createDisplayObject(),
            mock.createDisplayObject()
          ];
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

      describe('#getBoundingBox()', function() {
        function createChild(x, y, top, right, bottom, left) {
          return new Path()
            .moveTo(left, top)
            .lineTo(right, top)
            .lineTo(right, bottom)
            .lineTo(left, bottom)
            .attr({
              x: x,
              y: y
            });
        }

        var createDisplayList = createOwner;
        describe('without children', function() {
          var displayList = createDisplayList();

          it('computes the correct size object', function() {
            expect(displayList.getBoundingBox()).toEqual({
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

          it('computes the correct size object', function() {
            expect(displayList.getBoundingBox()).toEqual({
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

          it('computes the correct size object', function() {
            expect(displayList.getBoundingBox()).toEqual({
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

      describe('getIndexOfChild()', function() {
        var children;
        beforeEach(function() {
          children = displayList.children = [
            mock.createDisplayObject(),
            mock.createDisplayObject(),
            mock.createDisplayObject()
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
          expect(owner.getIndexOfChild(mock.createDisplayObject())).toBe(-1);
        });
      });

      describe('removeChild', function() {
        it('calls this.displayList.remove with the first argument', function() {

        });
        it('returns the instance', function() {
          expect(owner.removeChild(mock.createDisplayObject())).toBe(owner);
        });
      });
    });
  }
});
