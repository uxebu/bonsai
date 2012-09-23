define([
  'bonsai/renderer/svg/svg',
  'bonsai/renderer/svg/svg_helper'
], function(SvgRenderer, svgHelper) {

  var svgInstance, aDomElement;

  describe('Svg Submodule of SvgRenderer', function() {

    describe('submodule', function() {
      it('is a submodule of SvgRenderer', function() {
        expect('Svg' in SvgRenderer).toBeTruthy();
      });
    });

    describe('the constructor', function() {
      it('creates an svg container element and appends it to a given dom element', function() {
        var el = document.createDocumentFragment();
        var svg = new SvgRenderer.Svg(el);
        expect(el.firstChild).toBeInstanceOf(HTMLElement);
        expect(el.firstChild.firstChild).toBeInstanceOf(SVGSVGElement)
      });
    });

    beforeEach(function () {
        svgInstance = new SvgRenderer.Svg(document.createDocumentFragment());
        aDomElement = document.createElement('div');
    });

    afterEach(function () {
        svgInstance = null;
        aDomElement = null;
    });

    describe('has a `attr` method', function() {

      describe('basicAttributeMap', function() {
        it('sets an attribute that is contained in `basicAttributeMap` to the given dom element', function() {
          // TODO: mock `basicAttributeMap`. It is private atm.
          svgInstance.attr(aDomElement, {cursor:1});
          expect(aDomElement.getAttribute('cursor')).toEqual('1');
        });
      });

      describe('has some special handlers for certain attributes', function() {

        describe('has a special handler for `strokeWidth`', function() {

          it('sets `stroke-width` attribute to given element when `strokeWidth` > 0', function() {
            svgInstance.attr(aDomElement, {strokeWidth: 5});
            expect(aDomElement.getAttribute('stroke-width')).toEqual('5');
          });

          it('sets `stroke-width` attribute to given element when `strokeWidth` is equals 0', function() {
            svgInstance.attr(aDomElement, {strokeWidth: 0});
            expect(aDomElement.getAttribute('stroke-width')).toEqual('0');
          });

          xit('sets `stroke-width` and `data-stroke` when `strokeWidth` equals 0 and `stroke` was already set', function() {
            svgInstance.attr(aDomElement, {strokeColor: 'black', strokeWidth:0});
            expect(aDomElement.getAttribute('stroke-width')).toEqual('0');
            expect(aDomElement.hasAttribute('data-stroke')).toBeTruthy();
          });

          xit('sets `stroke-width` and `stroke` when `stroke-width` > 0 and ' + 
             '`data-stroke` was already set and `strokeColor` is not passed as parameter', function() {
            svgInstance.attr(aDomElement, {strokeColor: 'aColor'});
            svgInstance.attr(aDomElement, {strokeWidth: 0});
            svgInstance.attr(aDomElement, {strokeWidth:10});
            expect(aDomElement.getAttribute('stroke-width')).toEqual('10');
            expect(aDomElement.hasAttribute('stroke')).toBeTruthy();
          });

        });

        /*describe('has a special handler for `strokeColor`', function() {

          it('sets a `data-stroke` attribute to given element when `strokeColor` is set ' +
             'and `stroke-width` is not available', function() {
            svgInstance.attr(aDomElement, {strokeColor: 'fakeColor'});
            expect(aDomElement.hasAttribute('data-stroke')).toBeTruthy();
          });

          it('sets a `data-stroke` attribute to given element when `strokeWidth` was previously set to 0', function() {
            svgInstance.attr(aDomElement, {strokeWidth:0, strokeColor: 'fakeColor'});
            expect(aDomElement.hasAttribute('data-stroke')).toBeTruthy();
          });

          it('sets a `stroke` attribute to given element when `strokeWidth` was previously set', function() {
            svgInstance.attr(aDomElement, {strokeWidth:2, strokeColor: 'fakeColor'});
            expect(aDomElement.hasAttribute('stroke')).toBeTruthy();
          });

          it('removes `stroke` from given element when `strokeColor` equals null', function() {
            svgInstance.attr(aDomElement, {strokeColor: null});
            expect(aDomElement.hasAttribute('stroke')).toBeFalsy();
          });

          it('removes `data-stroke` from given element when `ineColor` equals null', function() {
            svgInstance.attr(aDomElement, {strokeColor: null});
            expect(aDomElement.hasAttribute('data-stroke')).toBeFalsy();
          });

        });
        */

      });

    });

  });

});
