/**
 * Animated Color
 */
var rect = bonsai.Shape.rect(10, 10, 500, 500).attr({
  fillGradient: bonsai.gradient.linear('45', [
    'green', 'yellow'
  ]),
  lineWidth: 20,
  lineGradient: gradient.linear(0, ['red', 'yellow', 'orange', 'red'], 2)
});

var rectOverlay = bonsai.Shape.rect(20, 20, 500, 500).attr({
  fillGradient: bonsai.gradient.radial([
    'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)'
  ], 10, 100, 0)
});

stage.addChild(rect);
stage.addChild(rectOverlay);

rect.animate('3s', {
  fillGradient: bonsai.gradient.linear('-45', [
    bonsai.color('red').darker(.2), 'orange'
  ]),
  lineGradient: gradient.linear(0, ['blue', 'pink', 'purple', 'blue'], 2)
});

rectOverlay.animate('3s', {
  fillGradient: bonsai.gradient.radial([
    'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)'
  ], 80, 0, 100)
});
