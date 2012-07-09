var rainbow = Shape.rect(0, 0, 480, 480).attr({
  lineWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var clip = Shape.circle(0, 0, 100);

stage.on('mouseover pointerdown', function() {
  rainbow.attr('clip', clip);
});

stage.on('mouseout pointerup', function() {
  rainbow.attr('clip', null);
});

stage.on('pointermove', function(e) {
  clip.attr({
    x: e.stageX,
    y: e.stageY
  })
});
