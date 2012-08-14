var h = 400,
    w = 400;
for (var i = 0; i < 50; ++i) {
  var rectPath = bonsai.Path.rect(0, 0, 50, 50).attr({
    fillColor: 'random',
    strokeOpacity: 0,
    opacity: 0.5,
    x: Math.random() * w,
    y: Math.random() * h
  });
  stage.addChild(rectPath);
  rectPath.animate('30s', { x: w/2, y: h/2 }, { easing: 'linear' });
}
