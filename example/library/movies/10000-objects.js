stage.addChild(new Rect(500, 0, 100, 100).attr('fillColor', 'random'));
setTimeout(function() {
  for (var i = 0; i < 10000; i++) {
    var factor = i % 500, add = i / 50 | 0;
    stage.addChild(new Rect(10*factor+add,10*factor, 100, 100).attr('fillColor', 'random'));
  }
}, 100);
