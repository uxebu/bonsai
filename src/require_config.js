define({
  config: (typeof require != 'undefined' && require.s && require.s.contexts &&
    require.s.contexts._ && require.s.contexts._.config) || {}, // hack recommended on mailing list
  url: function(scripts) {
    for (var i = 0, len = scripts.length; i < len; i += 1) {
      var src = scripts[i].src;
      if (/require(?:\..*)?\.js(?:\?|#|$)/.test(src)) {
        return src;
      }
    }
  }(typeof document != 'undefined' ? document.getElementsByTagName('script') : [])
});
