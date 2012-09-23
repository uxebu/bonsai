define([
  'bonsai/runner/filter/base_filter'
], function(filter) {

  describe('filter.BaseFilter', function() {

    it('should be a constructor', function() {
      expect(filter.BaseFilter).toBeOfType('function');
    });

    it('should have own property value', function() {
      expect(new filter.BaseFilter('test')).toHaveOwnProperties('value');
    });

    it('should have own property type when passed', function() {
      expect(new filter.BaseFilter('typeValue')).toHaveOwnProperties('type');
    });

    it('should have undefined type property if no type is passed', function() {
      expect(new filter.BaseFilter().type).toBe(undefined);
    });

    describe('invoked as constructor', function() {

      it('should be instanceof Filter', function() {
        expect(new filter.BaseFilter('test')).toBeInstanceOf(filter.BaseFilter);
      });

      describe('value', function() {

        it('0 => 0', function() {
          expect(new filter.BaseFilter('test', 0).value).toBe(0);
        });

        it('-3 => -3', function() {
          expect(new filter.BaseFilter('test', -3).value).toBe(-3);
        });

        it('10000000 => 10000000', function() {
          expect(new filter.BaseFilter('test', 10000000).value).toBe(10000000);
        });

      });

      describe('defaultValue', function() {

        it('0', function() {
          expect(new filter.BaseFilter('test', undefined, 0).value).toBe(0);
        });

        it('4', function() {
          expect(new filter.BaseFilter('test', undefined, 4).value).toBe(4);
        });

        it('100000000', function() {
          expect(new filter.BaseFilter('test', undefined, 100000000).value).toBe(100000000);
        });

        it('-100000000', function() {
          expect(new filter.BaseFilter('test', undefined, -100000000).value).toBe(-100000000);
        });

      });

    });

  });

});
