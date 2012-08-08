// animate second filter only
new bonsai.Bitmap('assets/redpanda.jpg', function() {
  this.attr({
    y: 10,
    x: 10,
    scale: 0.5,
    filters: [filter.hueRotate(0), filter.invert(0)]
  });
  stage.addChild(this);
  this.animate('3s', {
    filters: [null, 1]
  });
});

// animate first filter only
new bonsai.Bitmap('assets/redpanda.jpg', function() {
  this.attr({
    y: 10,
    x: 150,
    scale: 0.5,
    filters: [filter.hueRotate(0), filter.invert(0)]
  });
  stage.addChild(this);
  this.animate('3s', {
    filters: [360]
  });
});

// animate both
new bonsai.Bitmap('assets/redpanda.jpg', function() {
  this.attr({
    y: 10,
    x: 290,
    scale: 0.5,
    filters: [filter.hueRotate(0), filter.invert(0)]
  });
  stage.addChild(this);
  this.animate('3s', {
    filters: [360, 1]
  });
});

Path.rect(200,200,100,100)
  .addTo(stage)
  .attr({fillColor:'green',
    filters:[
        new filter.DropShadow(1,1,1,'grey'),
        new filter.Blur(10)
  ]})
  .animate('2s', {
    filters: [
      new filter.DropShadow(10,10,10,'red'),
      new filter.Blur(0)
    ]
  }
);
