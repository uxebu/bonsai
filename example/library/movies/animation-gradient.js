/**
 * Animated Color
 */
var rect = new Rect(10, 10, 500, 500).attr({
  fillGradient: bonsai.gradient.linear('45', [
    'green', 'yellow'
  ]),
  strokeWidth: 20,
  strokeGradient: gradient.linear(0, ['red', 'yellow', 'orange', 'red'], 2)
});

var rectOverlay = new Rect(20, 20, 500, 500).attr({
  fillGradient: gradient.radial([
    'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)'
  ], 10, 100, 0)
});

stage.addChild(rect);
stage.addChild(rectOverlay);

rect.animate('3s', {
  fillGradient: gradient.linear('-45', [
    color('red').darker(.2), 'orange'
  ]),
  strokeGradient: gradient.linear(0, ['blue', 'pink', 'purple', 'blue'], 2)
});

rectOverlay.animate('3s', {
  fillGradient: gradient.radial([
    'rgba(255,255,255,0.6)', 'rgba(255,255,255,0)'
  ], 80, 0, 100)
});
