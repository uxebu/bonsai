require([
  'bonsai/runner/display_object',
  'bonsai/runner/asset_display_object',
  'bonsai/tools',
  './runner.js'
], function(DisplayObject, AssetDisplayObject, tools) {

  describe('AssetDisplayObject', function() {

    it('Provides bindAssetCallback method which binds a single callback to load and error events', function() {
      var d = new DisplayObject;
      tools.mixin(d, AssetDisplayObject);
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

  });
});
