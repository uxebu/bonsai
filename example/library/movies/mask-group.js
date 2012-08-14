var rainbow = Path.rect(0, 0, 480, 480).attr({
  strokeWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var mask = new Group();

Path.circle(-50, -50, 50).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
}).addTo(mask);

Path.circle(50, -50, 50).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
}).addTo(mask);

Path.circle(-50, 50, 50).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
}).addTo(mask);

Path.circle(50, 50, 50).attr({
  fillGradient: gradient.radial([['#FFF', 50],'#000'], 50)
}).addTo(mask);

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
