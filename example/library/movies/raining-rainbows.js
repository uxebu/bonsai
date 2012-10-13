function draw() {

  var color = bonsai.color('red').randomize('hue');

  var circle = new Circle(
    0,
    0,
    Math.random() * 20 + 20
  ).attr({
    opacity: 0,
    fillColor: color,
    fillGradient: gradient.linear(0, ['#000000AA', '#00000000']),
    strokeWidth: 7,
    strokeColor: color.lighter(.2),
    x: Math.random() * 500,
    y: Math.random() * 500
  }).addTo(stage);

  var k = new KeyframeAnimation('1s', {
    '50%': {
       scaleX: 4,
       scaleY: 4,
       opacity: 1
    },
    '100%': {
       scaleX: 8,
       scaleY: 8,
       opacity: 0
    }
  });

  k.on('end', function(){
    circle.destroy();
    draw();
  });

  circle.animate(k);

}

for (var i = 0; i < 6; ++i) {
  setTimeout(function(){
    draw();
  }, i * 650);
}
