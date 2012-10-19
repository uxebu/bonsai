define([
  'bonsai/runner/bitmap'
], function(Bitmap) {
  'use strict';

  describe('Bitmap', function() {
    describe('Callbacks', function() {
      it('Calls loader.request()', function() {
        var loader = { request: jasmine.createSpy('request') };
        new Bitmap(loader, 'img.png');
        expect(loader.request).toHaveBeenCalled();
      });
      it('Calls load event [and callback] upon load success', function() {
        var loader = {
          request: function(bitmapInstance, request, type) {
            bitmapInstance.notify('load', { width: 0, height: 0 });
          }
        };
        var eventHandler = jasmine.createSpy('eventHandler');
        var callbackCalled = false;
        var callback = function(err) {
          expect(err).toBe(null);
          expect(this).toBe(bitmap);
          callbackCalled = true;
        };
        var bitmap = new Bitmap(loader, 'img.jpg', callback).on('load', eventHandler);
        // Events will be triggered async, even with a mock loader,
        // This is forced by Bitmap, so as to make sure that post-instantiation events
        // still get fired.
        async(function(next) {
          setTimeout(function() {
            expect(eventHandler).toHaveBeenCalled();
            expect(callbackCalled).toBe(true);
            next();
          }, 10);
        });
      });
      it('Calls error event [and callback] upon load error', function() {
        var loader = {
          request: function(bitmapInstance, request, type) {
            bitmapInstance.notify('error', { error: 'errorMessage123' });
          }
        };
        var eventHandler = jasmine.createSpy('eventHandler');
        var callbackCalled = false;
        var callback = function(err) {
          expect(err instanceof Error).toBe(true);
          expect(err.message).toBe('errorMessage123');
          expect(this).toBe(bitmap);
          callbackCalled = true;
        };
        var bitmap = new Bitmap(loader, 'img.jpg', callback).on('error', eventHandler);
        // Events will be triggered async, even with a mock loader,
        // This is forced by Bitmap, so as to make sure that post-instantiation events
        // still get fired.
        async(function(next) {
          setTimeout(function() {
            expect(eventHandler).toHaveBeenCalled();
            expect(callbackCalled).toBe(true);
            next();
          }, 10);
        });
      });
    });
    describe('#getBoundingBox()', function() {
      it('should return the bitmap width if invoked with "width"', function() {
        var width = 123;
        var bitmap = new Bitmap().attr('width', width);

        expect(bitmap.getBoundingBox().width).toBe(width);
      });
      it('should return 0 for "width" if width is not set', function() {
        var bitmap = new Bitmap();

        expect(bitmap.getBoundingBox().width).toBe(0);
      });

      it('should return the bitmap width if invoked with "right"', function() {
        var width = 123;
        var bitmap = new Bitmap().attr('width', width);

        expect(bitmap.getBoundingBox().right).toBe(width);
      });
      it('should return 0 for "right" if width is not set', function() {
        var bitmap = new Bitmap();

        expect(bitmap.getBoundingBox().right).toBe(0);
      });

      it('should return the bitmap height if invoked with "height"', function() {
        var height = 123;
        var bitmap = new Bitmap().attr('height', height);

        expect(bitmap.getBoundingBox().height).toBe(height);
      });
      it('should return 0 for "height" if height is not set', function() {
        var bitmap = new Bitmap();

        expect(bitmap.getBoundingBox().height).toBe(0);
      });

      it('should return the bitmap height if invoked with "bottom"', function() {
        var height = 123;
        var bitmap = new Bitmap().attr('height', height);

        expect(bitmap.getBoundingBox().bottom).toBe(height);
      });
      it('should return 0 for "bottom" if height is not set', function() {
        var bitmap = new Bitmap();

        expect(bitmap.getBoundingBox().bottom).toBe(0);
      });

      it('should return 0 if invoked with "top"', function() {
        expect(new Bitmap().getBoundingBox().top).toBe(0);
      });

      it('should return 0 if invoked with "left"', function() {
        expect(new Bitmap().getBoundingBox().left).toBe(0);
      });

      it('Should calculate width from width/height ratio if not specified and vice-versa', function() {
        var b = new Bitmap();
        b._attributes._naturalWidth = 400;
        b._attributes._naturalHeight = 200;
        var bbox = b.getBoundingBox();
        expect(bbox.width).toBe(400);
        expect(bbox.height).toBe(200);
        b.attr('width', 500);
        bbox = b.getBoundingBox();
        expect(bbox.width).toBe(500);
        expect(bbox.height).toBe(250); // <- calculated from ratio
        b.attr('width', null);
        b.attr('height', 10);
        bbox = b.getBoundingBox();
        expect(bbox.width).toBe(20); // <- calculated from ratio
        expect(bbox.height).toBe(10);
      });

      it('should return an object with "top", "right", "bottom", "left", ' +
        '"width" and "height" properties of 0 when invoked with "size"', function() {
        var width = 123, height = 456;

        expect(
          new Bitmap()
            .attr({width: width, height: height})
            .getBoundingBox()
        ).toEqual({
            top: 0,
            right: width,
            bottom: height,
            left: 0,
            width: width,
            height: height
          });
      });

      it('should return an object with "top", "right", "bottom", "left", ' +
        '"width" and "height" properties of 0 when invoked with "size"', function() {
        expect(new Bitmap().getBoundingBox())
          .toEqual({
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            width: 0,
            height: 0
          });
      });
    });
  });
});
