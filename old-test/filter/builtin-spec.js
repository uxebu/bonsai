define([
  'bonsai/runner/filter/builtin',
  'bonsai/color'
], function(filter, color) {

  ['Blur', 'Grayscale', 'Sepia', 'Invert', 'Saturate', 'Brightness', 'Contrast', 'HueRotate', 'Opacity', 'DropShadow'].forEach(function(filterType) {

    describe('filter.' + filterType + ' as constructor', function() {

      it('new filter.' + filterType + '() returns instance of filter.BaseFilter', function() {
        expect(new filter[filterType]()).toBeInstanceOf(filter.BaseFilter);
      });

    });

  });

  ['grayscale', 'sepia', 'saturate', 'hueRotate', 'invert', 'opacity', 'brightness', 'contrast', 'blur', 'dropShadow'].forEach(function(filterName){

    describe('filter.' + filterName + ' as factory', function(){

      it('should exist', function(){
        expect(filter[filterName]).toBeDefined();
      });

      it('should be a function', function(){
        expect(filter[filterName]).toBeOfType('function');
      });

      it('should have filter.BaseFilter as a parent class', function(){
        expect(filter[filterName]()).toBeInstanceOf(filter.BaseFilter);
      });

    });

  });

  describe('filter.DropShadow', function() {

    it('should return array with four values (r,g,b,a)', function() {
      expect((new filter.DropShadow()).value.length).toEqual(4);
    });

    it('should call color.parse', function() {
      spyOn(color, 'parse');
      new filter.DropShadow();
      expect(color.parse).wasCalled();
    });

    it('should write the result of color.parse to value[3]', function(){
      var oldColorParse = color.parse;
      color.parse = function(){
        return '255';
      };
      expect(new filter.DropShadow().value[3]).toEqual('255');
      color.parse = oldColorParse;
    });

  });

  describe('filter.ColorMatrix', function() {
    it('returns "colorMatrix" as `type`', function() {
      expect((new filter.ColorMatrix()).type).toEqual('colorMatrix');
    });
    it('returns an array (5×5 identity matrix) as `value` by default', function() {
      var identityMatrix = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
      ];
      expect((new filter.ColorMatrix()).value).toEqual(identityMatrix);
    });
    it('returns the passed matrix as `value`', function() {
      var aMatrix = [
        1, 1, 1, 0, 0,
        1, 1, 1, 1, 0,
        1, 1, 1, 0, 0,
        1, 0, 0, 1, 0
      ];
      expect((new filter.ColorMatrix(aMatrix)).value).toEqual(aMatrix);
    });
  });

});
