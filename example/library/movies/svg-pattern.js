/*
 * fillImage
 */
var imagePattern = new Bitmap('assets/redpanda.jpg').attr({
  width: 100,
  height: 100
});
Path.rect(0, 0, 100, 100).attr({
  fillImage: imagePattern
}).addTo(stage);

/*
 * fillImage (repeat)
 */
var imagePatternRepeat = new Bitmap('assets/redpanda.jpg').attr({
  width: 100,
  height: 100
});
Path.rect(120, 0, 100, 100).attr({
  fillImage: imagePatternRepeat,
  fillRepeat:4
}).addTo(stage);

/*
 * fillGradient
 */
Path.rect(240, 0, 100, 100).attr({
  fillGradient: 'linear-gradient(-45deg, blue, yellow)'
}).addTo(stage);

/*
 * fillGradient (repeat)
 */
Path.rect(360, 0, 100, 100).attr({
  fillGradient: 'linear-gradient(-45deg, blue, yellow)',
  fillRepeat:4
}).addTo(stage);


/*
 * Text + fillGradient
 */
new Text('TEST').attr({
  x: 0,
  y: 170,
  fontSize: 100,
  textFillColor:'',
  textFillGradient: 'linear-gradient(-45deg, blue, yellow)',
  fillRepeat:[4,1]
}).addTo(stage);

/*
 * Text + fillGradient
 */
var textImagePatternRepeat = new Bitmap('assets/redpanda.jpg').attr({
  width: 100,
  height: 100
});
new Text('TEST').attr({
  x: 250,
  y: 170,
  fontSize: 100,
  textFillImage:textImagePatternRepeat
}).addTo(stage);

