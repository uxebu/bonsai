/**
 * clip group
 */

var rainbow = new Rect(0, 0, 480, 480).attr({
  strokeWidth: 1,
  fillGradient: gradient.linear(90,
    ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']
  )
}).addTo(stage);

var mask = new Group();

new Circle(-50, -50, 50).addTo(mask);
new Circle(50, -50, 50).addTo(mask);
new Circle(-50, 50, 50).addTo(mask);
new Circle(50, 50, 50).addTo(mask);

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
