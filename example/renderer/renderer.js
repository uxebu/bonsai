new Bitmap('/example/library/movies/assets/redpanda.jpg', function(err) {
  if (err) return;
  stage.addChild(this);
  new Rect(300, 300, 500, 500).addTo(stage);
new Star(200, 200, 50, 100, 4).addTo(stage);
});