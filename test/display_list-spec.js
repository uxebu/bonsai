require([
  'bonsai/runner/display_list',
  'bonsai/runner/display_object',
  'bonsai/runner/stage',
  'bonsai/tools',
  'bonsai/event_emitter',
  './fake_messageproxy',
  './runner.js'
], function(DisplayList, DisplayObject, Stage, tools, EventEmitter, fakeMessageproxy) {

  function CustomDisplayList() {
    DisplayObject.call(this);
  }

  tools.mixin(
    CustomDisplayList.prototype = Object.create(DisplayObject.prototype),
    DisplayList
  );

  function createDisplayList() {
    return new CustomDisplayList();
  }

  var mockDisplayObjectIds = 0;
  function MockDisplayObject() {
    this.id = (mockDisplayObjectIds += 1);
    this._activate = jasmine.createSpy('_activate');
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
