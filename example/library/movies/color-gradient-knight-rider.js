// background
bonsai.Path.rect(0, 0, 800, 1900).attr({fillColor:'black'}).addTo(stage);

// knight rider v1
var shape = bonsai.Path.rect(10, 200, 700, 50).addTo(stage);
var abs = Math.abs, step = 1.5, i = 1, end = 99 / step;

(function loop() {
  setTimeout(loop, 20);
  shape.attr({
    fillGradient:'linear-gradient('+ [
      '90deg',
      0x000,
      'red '+ (abs (step * i++) + 0.1) + '%',
      0x000
    ]+')'
  });
  i >= end && (i = -end);
})();
