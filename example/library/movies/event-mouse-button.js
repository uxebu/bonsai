var text = new Text().addTo(stage).attr({x: 10, y: 10});

stage.disableContextMenu();

stage.on('pointerup', function(e) {
  switch (true) {
    case e.isRight: text.attr('text', 'Right button'); break;
    case e.isMiddle: text.attr('text', 'Middle button'); break;
    case e.isLeft: text.attr('text', 'Left button'); break;
  }
});