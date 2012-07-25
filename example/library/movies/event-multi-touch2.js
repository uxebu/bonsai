stage.on('multi:pointerdown', function(e) {

  var id = e.touchId,
      removed = false,
      fadedIn = false;

  var s = Path.circle(e.stageX, e.stageY, Math.random() * 50 + 50).attr({
    scale: 0,
    opacity: 0
  });

  s.attr({
    fillColor: 'random'
  })
  .addTo(stage)
  .animate('.2s', {
    scaleX: 1,
    scaleY: 1,
    opacity: 1
  }, {
    onEnd: function() {
      fadedIn = true;
    }
  });

  stage.on('multi:pointermove', function(e) {
    if (!removed && e.touchId === id) s.attr({
      x: e.stageX,
      y: e.stageY
    });
  });

  stage.on('multi:pointerup', function(e) {
    if (e.touchId === id && !removed) {

      if (fadedIn) {
        s.animate('.2s', {
          scaleX: 0,
          scaleY: 0,
          opacity: 0
        }, {
          onEnd: function() {
            s.remove();
          }
        });
      } else s.remove();
      removed = true;
    }
  });

});
