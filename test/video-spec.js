require([
  'bonsai/runner/video',
  './runner.js'
], function(Video) {
  describe('Video', function() {
    describe('#getComputed()', function() {
      it('should return the bitmap width if invoked with "width"', function() {
        var width = 123;
        var bitmap = new Video().attr('width', width);

        expect(bitmap.getComputed('width')).toBe(width);
      });
      it('should return 0 for "width" if width is not set', function() {
        var bitmap = new Video();

        expect(bitmap.getComputed('width')).toBe(0);
      });

      it('should return the bitmap width if invoked with "right"', function() {
        var width = 123;
        var bitmap = new Video().attr('width', width);

        expect(bitmap.getComputed('right')).toBe(width);
      });
      it('should return 0 for "right" if width is not set', function() {
        var bitmap = new Video();

        expect(bitmap.getComputed('right')).toBe(0);
      });

      it('should return the bitmap height if invoked with "height"', function() {
        var height = 123;
        var bitmap = new Video().attr('height', height);

        expect(bitmap.getComputed('height')).toBe(height);
      });
      it('should return 0 for "height" if height is not set', function() {
        var bitmap = new Video();

        expect(bitmap.getComputed('height')).toBe(0);
      });

      it('should return the bitmap height if invoked with "bottom"', function() {
        var height = 123;
        var bitmap = new Video().attr('height', height);

        expect(bitmap.getComputed('bottom')).toBe(height);
      });
      it('should return 0 for "bottom" if height is not set', function() {
        var bitmap = new Video();

        expect(bitmap.getComputed('bottom')).toBe(0);
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
  })
});
