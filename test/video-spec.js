define([
  'bonsai/runner/video',
  'bonsai/runner/group'
], function(Video, Group) {

  var mockLoader;

  describe('Video', function() {

    beforeEach(function() {
      mockLoader = {
        destroyAsset: jasmine.createSpy('destroyAsset'),
        request: function() {}
      };
    });

    describe('#getComputed()', function() {
      it('should return the bitmap width if invoked with "width"', function() {
        var width = 123;
        var bitmap = new Video().attr('width', width);

        expect(bitmap.getComputed('width')).toBe(width);
      });
      it('should return 0 for "width" if width is not set', function() {
        var videoInstance = new Video();

        expect(videoInstance.getComputed('width')).toBe(0);
      });

      it('should return the bitmap width if invoked with "right"', function() {
        var width = 123;
        var videoInstance = new Video().attr('width', width);

        expect(videoInstance.getComputed('right')).toBe(width);
      });
      it('should return 0 for "right" if width is not set', function() {
        var videoInstance = new Video();

        expect(videoInstance.getComputed('right')).toBe(0);
      });

      it('should return the bitmap height if invoked with "height"', function() {
        var height = 123;
        var videoInstance = new Video().attr('height', height);

        expect(videoInstance.getComputed('height')).toBe(height);
      });
      it('should return 0 for "height" if height is not set', function() {
        var videoInstance = new Video();

        expect(videoInstance.getComputed('height')).toBe(0);
      });

      it('should return the bitmap height if invoked with "bottom"', function() {
        var height = 123;
        var videoInstance = new Video().attr('height', height);

        expect(videoInstance.getComputed('bottom')).toBe(height);
      });
      it('should return 0 for "bottom" if height is not set', function() {
        var videoInstance = new Video();

        expect(videoInstance.getComputed('bottom')).toBe(0);
      });

      it('should return 0 if invoked with "top"', function() {
        expect(new Video().getComputed('top')).toBe(0);
      });

      it('should return 0 if invoked with "left"', function() {
        expect(new Video().getComputed('left')).toBe(0);
      });

      it('should return an object with "top", "right", "bottom", "left", ' +
        '"width" and "height" properties of 0 when invoked with "size"', function() {
        var width = 123, height = 456;

        expect(
          new Video()
            .attr({width: width, height: height})
            .getComputed('size')
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
        expect(new Video().getComputed('size'))
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

    it('Provides destroy method which will remove the item from stage and call destroyAsset on its loader', function() {
      var d = new Video(mockLoader, 'abc.mp4', null);
      var parent = new Group();
      parent.addChild(d);
      expect(parent.children()[0]).toBe(d);
      d.destroy();
      expect(mockLoader.destroyAsset).toHaveBeenCalled();
      expect(parent.children()[0]).toBe(void 0);
    });

    describe('has a clone method', function() {
      it('returns an Video instance', function() {
        var d = new Video(mockLoader, 'abc.mp4', null);
        expect(d.clone() instanceof Video).toBeTruthy();
      });
      it('returns a fresh/new Video instance', function() {
        var d = new Video(mockLoader, 'abc.mp4', null);
        expect(d.clone() !== d).toBeTruthy();
      });
      it('returns a clone with the same source', function() {
        var d = new Video(mockLoader, 'abc.mp4', null);
        var dc = d.clone();
        expect(d.attr('source') === dc.attr('source')).toBeTruthy();
      });
    });

  })
});
