new bonsai.Bitmap('assets/redpanda.jpg', {
  onload: function() {
    this.attr({
      y: -256,
      x: -256
    });
    stage.addChild(this);
    this.animate('1s', {x: 0, y: 0, rotation: .2});
  }
});
