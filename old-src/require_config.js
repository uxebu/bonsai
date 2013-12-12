define({
  config: require.s.contexts._.config, // hack recommended on mailing list
  url: function(scripts) {
    for (var i = 0, len = scripts.length; i < len; i += 1) {
      var src = scripts[i].src;
      if (/require(?:\..*)?\.js(?:\?|#|$)/.test(src)) {
        return src;
      }
    }
  }(document.getElementsByTagName('script'))
});
