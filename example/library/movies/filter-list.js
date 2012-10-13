
/* ============ ROW 1 ============ */

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 10,
    scale: 0.5,
    filters: filter.blur(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 150,
    scale: 0.5,
    filters: filter.sepia(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 290,
    scale: 0.5,
    filters: filter.saturate(5)
  });
  stage.addChild(this);
});

/* ============ ROW 2 ============ */

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 150,
    x: 10,
    scale: 0.5,
    filters: filter.grayscale(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 150,
    x: 150,
    scale: 0.5,
    filters: filter.hueRotate(90)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 150,
    x: 290,
    scale: 0.5,
    filters: filter.invert(1)
  });
  stage.addChild(this);
});

/* ============ ROW 3 ============ */

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 290,
    x: 10,
    scale: 0.5,
    filters: filter.brightness(2)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 290,
    x: 150,
    scale: 0.5,
    filters: filter.contrast(2)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 290,
    x: 290,
    scale: 0.5,
    filters: filter.opacity(0.5)
  });
  stage.addChild(this);
});

/* ============ ROW 4 ============ */

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 430,
    x: 10,
    scale: 0.5,
    filters: filter.dropShadow([0,0,5,'#000'])
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 430,
    x: 150,
    scale: 0.5,
    filters: filter.colorMatrix([
      1, 1, 1, 0, 0,
      1, 0.7, -1, 0, 0,
      -1, -1, -1, 0, 0,
      0, 0, 0, 1, 0
    ])
  });
  stage.addChild(this);
});
