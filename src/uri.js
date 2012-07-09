define(function() {
  'use strict';

  function URI(scheme, authority, path, query, fragment) {
    var undefined;
    this.scheme = scheme || undefined;
    this.authority = authority || undefined;
    this.path = path || '';
    this.query = query || '';
    this.fragment = fragment || '';
  }

  function resolvePaths(base, path) {
    return path.charAt(0) === '/' ? path : base.replace(/[/]+[^/]*$/, '/') + path;
  }

  URI.parse = function(uri) {
    //           |scheme (opt.)            |authority (opt.) |path   |query (opt.)  |hash
    var match = /^(?:([a-z][a-z0-9+.-]*):)?(?:\/\/([^/#?]*))?([^?#]*)(?:[?]([^#]*))?(?:#(.*))?/.exec(uri);

    if (!match) {
      return match;
    }

    return new URI(match[1], match[2], match[3], match[4], match[5]);
  };

  URI.prototype = {
    isAbsolute: function() {
      return this.authority !== void 0 || this.path.charAt(0) === '/';
    },

    /**
     *
     * @param path
     */
    resolvePath: function(path) {
      path = resolvePaths(this.path, path);
      return new URI(this.scheme, this.authority, path).toString();
    },

    resolveUri: function(uri) {
      if (!(uri instanceof URI)) {
        uri = URI.parse(uri);
      }

      if (uri.scheme === 'data') {
        return new URI(uri.scheme, '', uri.path);
      }

      var scheme = uri.scheme || this.scheme;

      var authority = uri.authority || this.authority;

      var path = resolvePaths(this.path, uri.path);

      return new URI(scheme, authority, path, uri.query, uri.fragment);
    },

    toString: function() {
      var uri = this.path;

      if (this.authority) {
        uri = '//' + this.authority + uri;
      }
      if (this.scheme) {
        uri = this.scheme + ':' + uri;
      }
      if (this.query) {
        uri += '?' + this.query;
      }
      if (this.fragment) {
        uri += '#' + this.fragment;
      }

      return uri;
    }
  };

  return URI;
});
