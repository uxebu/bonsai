require([
  'bonsai/asset/asset_handler',
  'bonsai/asset/asset_request',
  'bonsai/asset/asset_resource',
  './runner.js'
], function(AssetHandler, AssetRequest, AssetResource) {

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

      var called = 0;
      var request = new AssetRequest('b/i/k/e/s/h/e/d.txt');
      var handler = new AssetHandler(request, 1, 10 /* 10ms */);
      var errorHandler = jasmine.createSpy('errorHandler');

      handler.loadResource = function(resource) { /* do nothing */ };
      handler.on('error', errorHandler);
      handler.load();

      async(function(next) {
        setTimeout(function() {
          expect(errorHandler).toHaveBeenCalled();
        }, 20); // > 10ms timeout
        next();
      });

    });

  });

});
