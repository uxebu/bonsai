define([
  'bonsai/asset/asset_handler',
  'bonsai/asset/asset_request'
], function(AssetHandler, AssetRequest) {

  var toString = {}.toString;

  function makeAssetRequest() {
    return new AssetRequest('somefile.txt');
  }

  describe('AssetHandler', function() {

    it('Accepts valid arg signatures', function() {
      new AssetHandler(makeAssetRequest(), 1);
      new AssetHandler(makeAssetRequest(), 1, 30000);
    });

    it('Defaults to AssetHandler.DEFAULT_TIMEOUT', function() {
      expect(new AssetHandler(makeAssetRequest(), 1).timeoutDuration).toBe(AssetHandler.DEFAULT_TIMEOUT);
    });

    it('Will call loadResource on every passed resource', function() {
      var request = new AssetRequest([
        '1.foo',
        '2.bar',
        '3.txt'
      ]);
      var called = 0;
      var handler = new AssetHandler(request, 1);
      handler.loadResource = function(resource, doDone, doError) {
        expect(resource).toBe(request.resources[called]);
        expect(doDone).toBe(handler.resourceLoadSuccess);
        expect(doError).toBe(handler.resourceLoadError);
        called++;
      };
      handler.load();
      expect(called).toBe(3);
    });

    it('Timeout will trigger an error + custom timeout', function() {

      var request = new AssetRequest('b/o/n/s/a/i/j/s.txt');
      var handler = new AssetHandler(request, 1, 10 /* 10ms */);
      var errorHandler = jasmine.createSpy('errorHandler');

      handler.loadResource = function() { /* do nothing */ };
      handler.on('error', errorHandler);
      handler.load();

      async(function(next) {
        setTimeout(function() {
          expect(errorHandler).toHaveBeenCalled();
        }, 20); // > 10ms timeout
        next();
      });

    });

    describe('AssetHandler.MIME_TYPES', function() {
      it('returns an object', function() {
        expect(toString.call(AssetHandler.MIME_TYPES)).toBe('[object Object]');
      });
      it('has at least a `video` and `audio` key', function() {
        expect(toString.call(AssetHandler.MIME_TYPES.video)).toBe('[object Object]');
        expect(toString.call(AssetHandler.MIME_TYPES.audio)).toBe('[object Object]');
      });
    });

  });

});
