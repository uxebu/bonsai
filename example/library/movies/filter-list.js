/**
 * filter list
 */

/* ============ ROW 1 ============ */

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 10,
    scale: 0.5,
    filters: new filter.Blur(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 150,
    scale: 0.5,
    filters: new filter.Sepia(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 10,
    x: 290,
    scale: 0.5,
    filters: new filter.Saturate(5)
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
    filters: new filter.Grayscale(1)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 150,
    x: 150,
    scale: 0.5,
    filters: new filter.HueRotate(90)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 150,
    x: 290,
    scale: 0.5,
    filters: new filter.Invert(1)
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
    filters: new filter.Brightness(2)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 290,
    x: 150,
    scale: 0.5,
    filters: new filter.Contrast(2)
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 290,
    x: 290,
    scale: 0.5,
    filters: new filter.Opacity(0.5)
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
    filters: new filter.DropShadow([0,0,5,'#000'])
  });
  stage.addChild(this);
});

new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  this.attr({
    y: 430,
    x: 150,
    scale: 0.5,
    filters: new filter.ColorMatrix([
      1, 1, 1, 0, 0,
      1, 0.7, -1, 0, 0,
      -1, -1, -1, 0, 0,
      0, 0, 0, 1, 0
    ])
  });
  stage.addChild(this);
});
