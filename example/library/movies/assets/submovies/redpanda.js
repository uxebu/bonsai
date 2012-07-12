new bonsai.Bitmap('../redpanda.jpg', function(err) {
  this.attr({
    y: -256,
    x: -256
  });
  stage.addChild(this);
  this.animate('1s', {x: 0, y: 0, rotation: .2});
});
