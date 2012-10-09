new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    origin: {x: 128, y: 128},
    y: -256,
    x: -256
  });
  stage.addChild(this);
  stage.addChild(new Circle(250, 250, 128).attr({fillColor: 'rgba(255, 0, 0, .5)'}));
  this.animate('5s', {
    rotation: Math.PI * 10 + .2,
    x: 149.61,
    y: 98.41
  });
});
