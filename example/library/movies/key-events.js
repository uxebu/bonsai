stage.on('key', function(e) {
  var t = new Text(String.fromCharCode(e.keyCode)).addTo(stage).attr({
    x: 10,
    y: 10,
    fontSize: 20,
    fontFamily: 'Arial, sans-serif',
    opacity: 1,
    textOrigin: 'top'
  }).animate('.5s', {
    opacity: 0,
    scale: 15
  }, {
    onEnd: function() {
      t.remove();
    }
  })
});