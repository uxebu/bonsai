define([
  'bonsai/asset/asset_resource'
], function(AssetResource) {

  var url = 'http://simpleurl.org/file.txt';

  describe('AssetResource', function() {

    it('throws an error when called w/o parameters.', function() {
      expect( function() { new AssetResource() } ).toThrow();
    });

    it('throws an error when parameter is an empty string / null / undefined / 0.', function() {
      var param = [undefined, null, 0, ""];
      for (var i = 0; i < param.length; i++) {
        expect( function() { new AssetResource(param[i]) } ).toThrow();
      }
    });

    it('throws an error when parameter is an object and property ´src´ is an empty string / null / undefined / 0.', function() {
      var param = [undefined, null, 0, ""];
      for (var i = 0; i < param.length; i++) {
        expect( function() { new AssetResource({src:param[i]}) } ).toThrow();
      }
    });

    it('can handle a simple url (string)', function() {
      var resource = new AssetResource(url);

      expect( resource ).toBeInstanceOf(AssetResource);
      expect( resource ).toEqual({
        src : url,
        type : 'txt'// extracted txt extension correctly
      });
    });

    it('can extract extensions for sources [if not specified]', function() {
      expect(new AssetResource('data:image/jpg,aaa').type).toBe('image/jpg');
      expect(new AssetResource('data:image/svg+xml,aaa').type).toBe('image/svg+xml');
      expect(new AssetResource('foo/bar/txt.eot').type).toBe('eot');
      expect(new AssetResource('foo/bar/txt.eot').type).toBe('eot');
      expect(new AssetResource('foo/bar/txt.eot#hashy').type).toBe('eot');
      expect(new AssetResource('/foo/bar/txt.eot#hashy').type).toBe('eot');
      expect(new AssetResource('/txt.eot#hashy').type).toBe('eot');
      expect(new AssetResource('//foo/bar/___123___.txt').type).toBe('txt');
      expect(new AssetResource('http://someDomain.com/123.jpeg').type).toBe('jpeg');
      expect(new AssetResource('http://someDomain.com/123.jpeg#hashy').type).toBe('jpeg');
      expect(function() {
        new AssetResource('http://blah.com/somethingInHere')
      }).toThrow(/* It can't find the type */);
      expect(function() {
        new AssetResource('https://myStrangeFontHere.domain.com')
      }).toThrow(/* It can't find the type */);
    });

    it('can handle objects like { src: "'+url+'" }', function() {
      var param = { src: url };
      var resource = new AssetResource(param);

      expect( resource ).toBeInstanceOf(AssetResource);
      expect( resource ).toEqual({ src : url, type : 'txt' });
    });

    it('can handle objects like { src: "'+url+'", type:\'myMimeType\' }', function() {
      var param = { src: url, type:'myMimeType' };
      var resource = new AssetResource(param);

      expect( resource ).toBeInstanceOf(AssetResource);
      expect( resource ).toEqual({ src : url, type : 'myMimeType' });
    });

  });

});
