var text = new Text().addTo(stage).attr({x: 10, y: 10});

// NOTE:
// We will only receive a pointerup (with isRight:true) if the context-menu
// is disabled. To disable it, go to index.html and set `disableContextMenu: true`
// in the `bonsai.run()` configuration.

stage.on('pointerdown', function(e) {
  switch (true) {
    case e.isRight: text.attr('text', 'Down: Right button'); break;
    case e.isMiddle: text.attr('text', 'Down: Middle button'); break;
    case e.isLeft: text.attr('text', 'Down: Left button'); break;
  }
});

stage.on('pointerup', function(e) {
  switch (true) {
    case e.isRight: text.attr('text', 'Up: Right button'); break;
    case e.isMiddle: text.attr('text', 'Up: Middle button'); break;
    case e.isLeft: text.attr('text', 'Up: Left button'); break;
  }
});