/**
 * Animated attributes
 */
var rectPath = new Rect(50, 50, 100, 100).attr({
  fillColor: 'red',
  strokeColor: 'green',
  strokeWidth: 5
});

stage.addChild(rectPath);

rectPath.animate(
  '3s',
{
  x: 300,
  y: 300,
  opacity: 0
}, {
  easing: 'linear'
});
