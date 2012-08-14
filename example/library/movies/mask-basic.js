var rainbow = Path.rect(0, 0, 480, 480).attr({
  strokeWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var mask = Path.circle(240, 240, 100).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
});

stage.on('mouseover pointerdown', function() {
  rainbow.attr('mask', mask);
});

stage.on('mouseout pointerup', function() {
  rainbow.attr('mask', null);
});

stage.on('pointermove', function(e) {
  mask.attr({
    x: e.stageX,
    y: e.stageY
  })
});
