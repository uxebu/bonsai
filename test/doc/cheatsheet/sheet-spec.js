define([
  '../doc/cheatsheet/sheet.js'
], function (sheet) {

  describe('sheet', function () {
    describe('isInNode', function () {

      it('should return true for "" in any string', function () {
        expect(sheet.isInNode("", {dataset:{actualInnerHtml:"any string"}})).toBe(true);
      });

      it('should return false for "1" in "2"', function () {
        expect(sheet.isInNode('1', {dataset:{actualInnerHtml:'2'}})).toBe(false);
      });

      it('should return true for "1" in "23242321"', function () {
        expect(sheet.isInNode('1', {dataset:{actualInnerHtml:'23242321'}})).toBe(true);
      });

      it('should return true for "attr" in "movie.attr"', function () {
        expect(sheet.isInNode('attr', {dataset:{actualInnerHtml:'movie.attr'}})).toBe(true);
      });

      it('should return true for "mov" in "new Movie"', function () {
        expect(sheet.isInNode('mov', {dataset:{actualInnerHtml:'new Movie'}})).toBe(true);
      });

      it('should return true for "MOV" in "movie"', function () {
        expect(sheet.isInNode('MOV', {dataset:{actualInnerHtml:'movie'}})).toBe(true);
      });

    });

    describe('findCodeNodesWithString', function () {

      var container = document.createElement('div');
      container.innerHTML = '<div></div><pre>foo</pre><span></span>';
      var pre = container.querySelector('pre');
      sheet.container = container;

      it('should return array of match <pre>s', function () {
        container.getElementsByTagName('pre')[0].dataset.actualInnerHtml = 'foo';
        expect(sheet.findCodeNodesWithString('foo')).toEqual([pre]);
      });

    });

    describe('markSearchString', function () {

      it('should hightlight "attr"', function () {
        var actual = sheet.markSearchString('shape.attr()', 'attr');
        expect(actual).toEqual('shape.<mark>attr</mark>()');
      });

      it('should hightlight "Path" case-insensitive', function () {
        var actual = sheet.markSearchString('Path.rect(1,2,3,4)', 'shape');
        expect(actual).toEqual('<mark>Path</mark>.rect(1,2,3,4)');
      });

      it('should hightlight and escape "scr" in "<script>"', function () {
        var actual = sheet.markSearchString('<script>', 'scr');
        expect(actual).toEqual('&lt;<mark>scr</mark>ipt&gt;');
      });

      it('should not hightlight l in escaped text "<script>"', function () {
        var actual = sheet.markSearchString('<script lang>', 'l');
        expect(actual).toEqual('&lt;script <mark>l</mark>ang&gt;');
      });

      it('should mark multiple occurences', function() {
        var actual = sheet.markSearchString('filters:[filter.blur()]', 'filter');
        expect(actual).toBe('<mark>filter</mark>s:[<mark>filter</mark>.blur()]');
      });

      it('should return same string for empty search', function() {
        var actual = sheet.markSearchString('whatever', '');
        expect(actual).toBe('whatever');
      });

    });

    describe('markInNode', function () {

      var node;
      beforeEach(function () {
        node = document.createElement('pre');
      });

      it('should replace innerHTML with marked content', function () {
        node = {dataset:{actualInnerHtml:'space'}};
        sheet.markInNode(node, 'sp');
        expect(node.innerHTML).toBe('<mark>sp</mark>ace');
      });

    });

  });

});
