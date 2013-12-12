define([
  'bonsai/uri'
], function(URI) {
  'use strict';
  describe('URI.parse', function() {
    var parse = URI.parse;

    it('parses an absolute path correctly', function() {
      var parsed = parse('/a/b/c');
      expect(parsed.path).toBe('/a/b/c');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('');
    });

    it('parses a relative path correctly', function() {
      var parsed = parse('a/b/c');
      expect(parsed.path).toBe('a/b/c');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('');
    });

    it('parses a path with query correctly', function() {
      var parsed = parse('/a/b/c?query=is&right=here');
      expect(parsed.path).toBe('/a/b/c');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('query=is&right=here');
      expect(parsed.fragment).toBe('');
    });

    it('parses a path with fragment correctly', function() {
      var parsed = parse('/a/b/c#fragment');
      expect(parsed.path).toBe('/a/b/c');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('fragment');
    });

    it('parses a path with query and hash correctly', function() {
      var parsed = parse('/a/b/c?query=is&right=here#fragment');
      expect(parsed.path).toBe('/a/b/c');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('query=is&right=here');
      expect(parsed.fragment).toBe('fragment');
    });

    it('parses an uri with authority', function() {
      var parsed = parse('//arbitrary-authority');
      expect(parsed.path).toBe('');
      expect(parsed.scheme).toBeUndefined();
      expect(parsed.authority).toBe('arbitrary-authority');
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('');
    });

    it('parses an uri with scheme authority', function() {
      var parsed = parse('scheme://arbitrary-authority');
      expect(parsed.path).toBe('');
      expect(parsed.scheme).toBe('scheme');
      expect(parsed.authority).toBe('arbitrary-authority');
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('');
    });

    it('parses an uri with scheme and path', function() {
      var parsed = parse('scheme:/an/absolute/path');
      expect(parsed.path).toBe('/an/absolute/path');
      expect(parsed.scheme).toBe('scheme');
      expect(parsed.authority).toBeUndefined();
      expect(parsed.query).toBe('');
      expect(parsed.fragment).toBe('');
    });

    it('parses a complete uri', function() {
      var parsed = parse('http://user:password@www.example.org/path/to/file?with=query&#fragment');
      expect(parsed.path).toBe('/path/to/file');
      expect(parsed.scheme).toBe('http');
      expect(parsed.authority).toBe('user:password@www.example.org');
      expect(parsed.query).toBe('with=query&');
      expect(parsed.fragment).toBe('fragment');
    });
  });

  describe('#isAbsolute', function() {
    var parse = URI.parse;
    it('is true for an absolute path', function() {
      expect(parse('/a/b/c').isAbsolute()).toBe(true);
    });
    it('is false for a relative path', function() {
      expect(parse('a/b/c').isAbsolute()).toBe(false);
    });
    it('is false for an empty path', function() {
      expect(parse('').isAbsolute()).toBe(false);
    });
    it('is false for an empty path with query', function() {
      expect(parse('?query').isAbsolute()).toBe(false);
    });
    it('is true if an authority is given', function() {
      expect(parse('//example.org').isAbsolute()).toBe(true);
    });
  });

  describe('#toString', function() {
    it('suffixes the protocol with a colon', function() {
      expect(new URI('gopher').toString()).toBe('gopher:');
    });
    it('prefixes the authority with a double slash', function() {
      expect(new URI(undefined, 'example.com:80').toString()).toBe('//example.com:80');
    });
    it('puts out the path', function() {
      expect(new URI(undefined, undefined, 'an/arbitrary/path').toString()).toBe('an/arbitrary/path');
    });
    it('prefixes the query with a question mark', function() {
      expect(new URI(undefined, undefined, '', 'the-query-string').toString()).toBe('?the-query-string')
    });
    it('prefixes the fragment with a hash sign', function() {
      expect(new URI(undefined, undefined, '', undefined, 'a-fragment').toString()).toBe('#a-fragment')
    });
    it('stringifies a complete URI correctly', function() {
      expect(new URI(
          'ssh',
          'user:password@example.org',
          '/a/path/to/a.file',
          'show=true',
          'L30-35'
        ).toString()
      ).toBe('ssh://user:password@example.org/a/path/to/a.file?show=true#L30-35');
    })
  });

  describe('#resolvePath', function() {
    it('returns a string', function() {
      expect(URI.parse('/a/b/c').resolvePath('')).toBeOfType('string');
    });

    it('resolves a relative path to a path-only URI', function() {
      expect(URI.parse('/ab/cd/ef').resolvePath('gh/ij')).toBe('/ab/cd/gh/ij');
    });

    it('resolves an absolute path to a path-only URI', function() {
      expect(URI.parse('/ab/cd/ef').resolvePath('/gh/ij')).toBe('/gh/ij');
    });

    it('resolves a relative path to a path-only URI ending with a slash', function() {
      expect(URI.parse('/ab/cd/ef/').resolvePath('gh/ij')).toBe('/ab/cd/ef/gh/ij');
    });

    it('resolves an absolute path to a path-only URI ending with a slash', function() {
      expect(URI.parse('/ab/cd/ef/').resolvePath('/gh/ij')).toBe('/gh/ij');
    });

    it('dismisses query and fragment of the original URI', function() {
      expect(URI.parse('/ab/cd?query#fragment').resolvePath('ef')).toBe('/ab/ef');
    });

    it('resolves a relative path to an URI containing authority and path', function() {
      expect(URI.parse('//example.org/ab/cd/ef').resolvePath('gh/ij')).toBe('//example.org/ab/cd/gh/ij');
    });

    it('resolves an absolute path to an URI containing authority and path', function() {
      expect(URI.parse('//example.org/ab/cd/ef').resolvePath('/gh/ij')).toBe('//example.org/gh/ij');
    });

    it('resolves a relative path to an URI containing scheme and path', function() {
      expect(URI.parse('file:/ab/cd/ef').resolvePath('gh/ij')).toBe('file:/ab/cd/gh/ij');
    });

    it('resolves an absolute path to an URI containing scheme and path', function() {
      expect(URI.parse('file:/ab/cd/ef').resolvePath('/gh/ij')).toBe('file:/gh/ij');
    });

    it('resolves a relative path to an URI containing scheme, authority and path', function() {
      expect(URI.parse('http://example.org/ab/cd/ef').resolvePath('gh/ij')).toBe('http://example.org/ab/cd/gh/ij');
    });

    it('resolves an absolute path to an URI containing scheme, authority and path', function() {
      expect(URI.parse('http://example.org/ab/cd/ef').resolvePath('/gh/ij')).toBe('http://example.org/gh/ij');
    });
  });

  describe('#resolveUrl', function() {
    var parse = URI.parse;

    it('returns an instance of URI', function() {
      expect(new URI().resolveUri('')).toBeInstanceOf(URI);
      expect(new URI().resolveUri(new URI())).toBeInstanceOf(URI);
    });

    describe('base uri has path', function() {
      var baseUri = parse('/a/b/c');

      it('resolves an uri with relative path', function() {
        expect(baseUri.resolveUri('d/e').toString()).toBe('/a/b/d/e');
      });

      it('resolves an uri with absolute path', function() {
        expect(baseUri.resolveUri('/d/e').toString()).toBe('/d/e');
      });

      it('resolves an uri with authority and path', function() {
        expect(baseUri.resolveUri('//example.org/').toString()).toBe('//example.org/');
      });

      it('resolves an uri with scheme and relative path', function() {
        expect(baseUri.resolveUri('file:d/e').toString()).toBe('file:/a/b/d/e');
      });

      it('resolves an uri with scheme and absolute path', function() {
        expect(baseUri.resolveUri('file:/d/e').toString()).toBe('file:/d/e');
      });

      it('resolves an uri with scheme, authority and path', function() {
        expect(baseUri.resolveUri('ftp+ssh://example.org/arbitrary/path').toString()).toBe('ftp+ssh://example.org/arbitrary/path');
      });
    });

    describe('base uri has authority and path', function() {
      var baseUri = parse('//uxebu.com/a/b/c');

      it('resolves an uri with relative path', function() {
        expect(baseUri.resolveUri('d/e').toString()).toBe('//uxebu.com/a/b/d/e');
      });

      it('resolves an uri with absolute path', function() {
        expect(baseUri.resolveUri('/d/e').toString()).toBe('//uxebu.com/d/e');
      });

      it('resolves an uri with authority and path', function() {
        expect(baseUri.resolveUri('//example.org/').toString()).toBe('//example.org/');
      });

      it('resolves an uri with scheme and relative path', function() {
        expect(baseUri.resolveUri('file:d/e').toString()).toBe('file://uxebu.com/a/b/d/e');
      });

      it('resolves an uri with scheme and absolute path', function() {
        expect(baseUri.resolveUri('file:/d/e').toString()).toBe('file://uxebu.com/d/e');
      });

      it('resolves an uri with scheme, authority and path', function() {
        expect(baseUri.resolveUri('ftp+ssh://example.org/arbitrary/path').toString()).toBe('ftp+ssh://example.org/arbitrary/path');
      });
    });

    describe('base uri has scheme and path', function() {
      var baseUri = parse('cloud:/a/b/c');

      it('resolves an uri with relative path', function() {
        expect(baseUri.resolveUri('d/e').toString()).toBe('cloud:/a/b/d/e');
      });

      it('resolves an uri with absolute path', function() {
        expect(baseUri.resolveUri('/d/e').toString()).toBe('cloud:/d/e');
      });

      it('resolves an uri with authority and path', function() {
        expect(baseUri.resolveUri('//example.org/').toString()).toBe('cloud://example.org/');
      });

      it('resolves an uri with scheme and absolute path', function() {
        expect(baseUri.resolveUri('file:/d/e').toString()).toBe('file:/d/e');
      });

      it('resolves an uri with scheme and relative path', function() {
        expect(baseUri.resolveUri('file:d/e').toString()).toBe('file:/a/b/d/e');
      });

      it('resolves an uri with scheme, authority and path', function() {
        expect(baseUri.resolveUri('ftp+ssh://example.org/arbitrary/path').toString()).toBe('ftp+ssh://example.org/arbitrary/path');
      });
    });

    describe('base uri has scheme, authority and path', function() {
      var baseUri = parse('cloud://user@raincloud/a/b/c');

      it('resolves an uri with relative path', function() {
        expect(baseUri.resolveUri('d/e').toString()).toBe('cloud://user@raincloud/a/b/d/e');
      });

      it('resolves an uri with absolute path', function() {
        expect(baseUri.resolveUri('/d/e').toString()).toBe('cloud://user@raincloud/d/e');
      });

      it('resolves an uri with authority and path', function() {
        expect(baseUri.resolveUri('//example.org/').toString()).toBe('cloud://example.org/');
      });

      it('resolves an uri with scheme and absolute path', function() {
        expect(baseUri.resolveUri('file:/d/e').toString()).toBe('file://user@raincloud/d/e');
      });

      it('resolves an uri with scheme and relative path', function() {
        expect(baseUri.resolveUri('file:d/e').toString()).toBe('file://user@raincloud/a/b/d/e');
      });

      it('resolves an uri with scheme, authority and path', function() {
        expect(baseUri.resolveUri('ftp+ssh://example.org/arbitrary/path').toString()).toBe('ftp+ssh://example.org/arbitrary/path');
      });

      it('resolves a relative path to an empty path', function() {
        expect(URI.parse('').resolveUri('ab/cd').toString()).toBe('ab/cd');
      });

      it('resolves an absolute path to an empty path', function() {
        expect(URI.parse('').resolveUri('/ab/cd').toString()).toBe('/ab/cd');
      });

      it('resolves an empty path to an empty path', function() {
        expect(URI.parse('').resolveUri('').toString()).toBe('');
      });

      it('resolves the root path to an empty path', function() {
        expect(URI.parse('').resolveUri('/').toString()).toBe('/');
      });

      it('resolves a relative path to the root path', function() {
        expect(URI.parse('/').resolveUri('ab/cd').toString()).toBe('/ab/cd');
      });

      it('resolves an absolute path to the root path', function() {
        expect(URI.parse('/').resolveUri('/ab/cd').toString()).toBe('/ab/cd');
      });

      it('resolves an empty path to the root path', function() {
        expect(URI.parse('/').resolveUri('').toString()).toBe('/');
      });

      it('resolves the root path to the root path', function() {
        expect(URI.parse('/').resolveUri('/').toString()).toBe('/');
      });
    });

    it('dismisses fragment and query of the base url', function() {
      expect(URI.parse('/a/b?query#fragment').resolveUri('d/c').toString()).toBe('/a/d/c');
    });

    it('uses fragment and query of the uri being resolved', function() {
      expect(URI.parse('/a/b').resolveUri('d/c?query#fragment').toString()).toBe('/a/d/c?query#fragment');
    });
  });

});
