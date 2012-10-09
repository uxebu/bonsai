new Bitmap('assets/redpanda.jpg', function(err) {
  if (err) return;
  new Rect(0, 0, 400, 400).attr({
    fillImage: this.attr({
      width: 100,
      height: 100
    }),
    fillRepeat: 4
  }).addTo(stage);
});
