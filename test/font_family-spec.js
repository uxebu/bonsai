define([
  'bonsai/runner/font_family'
], function(FontFamily) {

  describe('FontFamily', function() {

    var assetLoaderRequest = jasmine.createSpy('assetLoaderRequest');
    var assetLoader = {
      request: assetLoaderRequest
    };

    it('Should load font via assetLoader', function() {
      new FontFamily(assetLoader, 'Foo', 'foo.ttf');
      expect(assetLoaderRequest).toHaveBeenCalled();
    });

    it('Should accept supported args without throwing', function() {
      new FontFamily(assetLoader, 'Foo', 'foo.ttf');
      new FontFamily(assetLoader, 'Foo', ['foo.eot', 'somethingElse.ttf']);
      new FontFamily(assetLoader, 'Foo', ['foo.eot', { src: 'someFont', type: 'opentype' }]);
      new FontFamily(assetLoader, 'Foo', {
        src: 'blah/foo/font.ttf#myFont'
      });
    });

    it('should contain an `id` property', function(){
      var f = new FontFamily(assetLoader, 'Foo', 'foo.ttf');
      expect(f.id).toBeDefined();
    });

    it('should ensure id properties are unique', function(){
      var f1 = new FontFamily(assetLoader, 'Foo1', 'foo1.ttf');
      var f2 = new FontFamily(assetLoader, 'Foo2', 'foo2.ttf');
      var f3 = new FontFamily(assetLoader, 'Foo3', 'foo3.ttf');
      expect(f1.id).not.toBe(f2.id);
      expect(f1.id).not.toBe(f3.id);
      expect(f2.id).not.toBe(f3.id);
      expect(f3.id).not.toBe(f2.id);
    });

  })

});
