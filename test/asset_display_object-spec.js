require([
  'bonsai/runner/display_object',
  'bonsai/runner/group',
  'bonsai/runner/asset_display_object',
  'bonsai/tools',
  './runner.js'
], function(DisplayObject, Group, AssetDisplayObject, tools) {

  describe('AssetDisplayObject', function() {

    it('Provides bindAssetCallback method which binds a single callback to load and error events', function() {
      var d = new AssetDisplayObject(null, '', null);
      var callback = jasmine.createSpy('callback');
      d.bindAssetCallback(callback);
      d.emit('load');
      expect(callback).toHaveBeenCalledWith(null, d);
      // Both events should have been unbound
      expect(d._events[':load']).toEqual([]);
      expect(d._events[':error']).toEqual([]);
      d.bindAssetCallback(callback);
      d.emit('error', 'foo123');
      expect(callback).toHaveBeenCalledWith('foo123', d);
      // Both events should have been unbound
      expect(d._events[':load']).toEqual([]);
      expect(d._events[':error']).toEqual([]);
    });

    it('Provides destroy method which will remove the item from stage and call destroyAsset on its loader', function() {
      var loader = {
        destroyAsset: jasmine.createSpy('destroyAsset')
      };
      var d = new AssetDisplayObject(loader, '', null);
      var parent = new Group();
      parent.addChild(d);
      expect(parent.children()[0]).toBe(d);
      d.destroy();
      expect(loader.destroyAsset).toHaveBeenCalled();
      expect(parent.children()[0]).toBe(void 0);
    });

  });
});
