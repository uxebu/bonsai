require([
  'bonsai/runner/group',
  'bonsai/runner/display_object',
  'bonsai/runner/display_list',
  'bonsai/runner/stage',
  'bonsai/tools',
  './fake_messageproxy',
  './runner.js'
], function(Group, DisplayObject, DisplayList, Stage, tools, fakeMessageproxy) {

  describe('Group', function() {

    it('should have DisplayList\'s addChild method', function() {
      expect(new Group().addChild).toBe(DisplayList.addChild);
      expect(new Group().addChild).toBeOfType('function');
    });

    it('addChild() should allow an array with multiple objects to add', function() {
      var group = new Group();
      group.addChild([new DisplayObject, new DisplayObject]);
      expect(group.children().length).toBe(2);
      group.addChild([new DisplayObject, new DisplayObject, new DisplayObject]);
      expect(group.children().length).toBe(5);
    });

    it('Can be added as a child of another group', function() {
      var parent = new Group(),
          child = new Group();
      parent.addChild(child);
      expect(child.parent).toBe(parent);
      expect(parent._children.indexOf(child)).toBe(0);
    });

    describe('markUpdate', function() {
      it('Marks self and children for update', function() {
        var stage = new Stage(fakeMessageproxy), // to simulate that `parent` is "hooked up"
            parent = new Group(),
            a = new Group(),
            b = new Group(),
            c = new Group();
        stage.addChild(parent);
        parent.addChild(a);
        parent.addChild(b);
        parent.addChild(c);
        parent.markUpdate();
        expect(stage.registry.needsDraw[parent.id]).toBe(parent);
        expect(stage.registry.needsDraw[a.id]).toBe(a);
        expect(stage.registry.needsDraw[b.id]).toBe(b);
        expect(stage.registry.needsDraw[c.id]).toBe(c);
      });
    });
  });
});
