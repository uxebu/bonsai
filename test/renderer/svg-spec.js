require([
  'bonsai/renderer/svg/svg',
  './runner.js'
], function(SvgRenderer) {
  describe('SvgRenderer', function() {
    function createFakeDomNode() {
      return {
        ownerSVGElement: {},
        appendChild: function() {},
        setAttribute: function() {}
      };
    }
    function createSvgRenderer() {
      return new SvgRenderer(createFakeDomNode(), 1, 1);
    }

    describe('allowEventDefaults', function() {
      it('should assign the constructor value as property', function() {
        expect(new SvgRenderer(createFakeDomNode(), 1, 1, true).allowEventDefaults).toBe(true);
      });

      it('should not call .preventDefault() on events when allowEventDefaults is set to true', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = true;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is set to false', function() {
        var renderer = createSvgRenderer();
        renderer.allowEventDefaults = false;

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });

      it('should call .preventDefault() on events when allowEventDefaults is not set', function() {
        var renderer = createSvgRenderer();

        var event = {
          target: createFakeDomNode(),
          preventDefault: jasmine.createSpy('preventDefault')
        };
        renderer.handleEvent(event);
        expect(event.preventDefault).toHaveBeenCalled();
      });
    });

    describe('#render', function() {
      it('should emit a "canRender" event after rendering', function() {
        var onCanRender = jasmine.createSpy('onCanRender');
        var renderer = createSvgRenderer();
        renderer.on('canRender', onCanRender);

        renderer.render([]);

        expect(onCanRender).toHaveBeenCalled();
      });
    });

    describe('applyFilter', function() {
      it('is a function', function() {
        expect(typeof createSvgRenderer().applyFilters).toBe('function');
      });
      it('adds a `_filterSignature` attribute to the node', function() {
        var node = createFakeDomNode();
        createSvgRenderer().applyFilters(node, []);
        expect(node._filterSignature).toBe('filter:');
      });
      it('adds a filter:colorMatrix() signature when a `colorMatrix` filter is applied', function() {
        var node = createFakeDomNode(), filter = { type: 'colorMatrix', value: [] };
        createSvgRenderer().applyFilters(node, [filter]);
        expect(node._filterSignature).toBe('filter:colorMatrix()');
      });
    });
  });
});
