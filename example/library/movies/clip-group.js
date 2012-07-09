var rainbow = Shape.rect(0, 0, 480, 480).attr({
  lineWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var mask = new Group();

Shape.circle(-50, -50, 50).addTo(mask);
Shape.circle(50, -50, 50).addTo(mask);
Shape.circle(-50, 50, 50).addTo(mask);
Shape.circle(50, 50, 50).addTo(mask);

stage.on('mouseover pointerdown', function() {
  rainbow.attr('clip', mask);
});

stage.on('mouseout pointerup', function() {
  rainbow.attr('clip', null);
});

stage.on('pointermove', function(e) {
  mask.attr({
    x: e.stageX,
    y: e.stageY
  })
});
