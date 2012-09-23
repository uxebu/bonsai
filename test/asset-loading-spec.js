define([
  'bonsai/asset/asset_controller',
  'bonsai/asset/asset_loader',
  'bonsai/asset/asset_request'
], function(AssetController, AssetLoader, AssetRequest) {

  var assetLoader = new AssetLoader({}),
      assetController;

  AssetController.timeout = 2000;

  describe('AssetLoader', function() {

    it('Fires a request event when requests occur', function() {

      var args = null;
      assetLoader.once('request', function(id, url, type) {
        args = [id, url, type];
      });
      assetLoader.request({id:1}, 'foo.png', 'bitmap');
      expect(args).toEqual([1, 'foo.png', 'bitmap']);

    });

    it('Calls `notify` on requestor when request completes', function() {

      var eventType = null,
          requester = {
            id: 1,
            notify: function(_type) {
              eventType = _type;
            }
          };

      assetLoader.request(requester, 'f', 'bitmap');
      assetLoader.handleEvent('load', 1, {});

      expect(eventType).toBe('load');

    });

    it('On request completion passes data to `notify` method', function() {

      var eventType = null,
          eventData = null,
          requester = {
            id: 1,
            notify: function(type, data) {
              eventType = type;
              eventData = data;
            }
          };

      assetLoader.request(requester, 'f', 'bitmap');
      assetLoader.handleEvent('load', 1, 12340987);

      expect(eventType).toBe('load');
      expect(eventData).toBe(12340987);

    });

  });

  describe('AssetController', function() {

    describe('load', function() {

      describe('Images', function() {

        it('Loads image and fires assetLoadSuccess event', function() {

          assetController = new AssetController;

          async(function(next){
            assetController.on('assetLoadSuccess', function() {
              expect(true).toBe(true);
              next();
            }).on('assetLoadError', function() {
              expect(false).toBe(true);
              next();
            });
            assetController.load({
              request: new AssetRequest('asset/a.png'),
              type: 'Bitmap'
            });
          });

        });

        it('Loads image and fires custom event', function() {

          assetController = new AssetController;

          async(function(next){
            assetController.on('customSuccessEvent123', function() {
              expect(true).toBe(true);
              next();
            }).on('customFailureEvent123', function() {
              expect(false).toBe(true);
              next();
            });
            assetController.load({
              request: new AssetRequest('asset/a.png'),
              type: 'Bitmap'
            }, 'customSuccessEvent123', 'customFailureEvent123');
          });

        });

        xit('Fails when image doesn\'t exist', function() {

          assetController = new AssetController({});

          async(function(next){
            assetController.on('assetLoadSuccess', function() {
              // This shouldn't be called
              expect(false).toBe(true);
              next();
            }).on('assetLoadError', function() {
              expect(true).toBe(true);
              next();
            });
            assetController.load({
              request: new AssetRequest('does-not-exist-404.png'),
              type: 'Bitmap'
            });
          });

        });

      });

      describe('Videos', function() {

        xit('Loads video and fires assetLoadSuccess event', function() {

          assetController = new AssetController;

          async(function(next){
            assetController.on('assetLoadSuccess', function() {
              expect(true).toBe(true);
              next();
            }).on('assetLoadError', function() {
              expect(false).toBe(true);
              next();
            });
            assetController.load({
              request: new AssetRequest([
                {src: 'asset/sample.m4v', type: 'video/mp4'},
                {src: 'asset/sample.ogv', type: 'video/ogg'}
              ]),
              type: 'Video',
              id: 'test-id'
            });
          });

        });

        xit('Fails when video doesn\'t exist', function() {

          assetController = new AssetController;

          async(function(next){
            assetController.on('assetLoadSuccess', function() {
              // This shouldn't be called
              expect(false).toBe(true);
              next();
            }).on('assetLoadError', function() {
              expect(true).toBe(true);
              next();
            });
            assetController.load({
              request: new AssetRequest('does-not-exist-404.mp4'),
              type: 'Video',
              id: 'test-id'
            });
          });

        });

      });

    });

    describe('preload', function() {

      describe('Images', function() {

        xit('Loads multiple images', function() {

          assetController = new AssetController;

          var loaded = false;

          async(function(next){

            assetController.preload(['asset/a.png', 'asset/b.png', 'asset/c.png'], function() {
              loaded = true;
              expect(true).toBe(true);
              next();
            });

            setTimeout(function() {
              if (!loaded) {
                // Images aren't loaded: FAIL
                expect(false).toBe(true);
                next();
              }
            }, 2000);

          });

        });

      });

    });

  });

});
