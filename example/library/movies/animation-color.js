/**
 * Animated Color
 */
var rect = new Rect(150, 150, 150, 150).attr({
  fillColor: 'red',
  strokeColor: 'green'
}).addTo(stage);

rect.animate('3s', {
  fillColor: 'blue',
  strokeColor: 'yellow',
  strokeWidth: 70
});
