var rect = new Rect(50, 50, 100, 100).addTo(stage);
rect.attr({
  strokeWidth: 1,
  strokeDashArray: '5,4',
  strokeOffset: '5',
  strokeColor: 'black',
  fillColor: 'yellow'
});

var i = 0;
var offset = false;
setInterval(function () {
  i++;

  rect.attr('strokeOffset', i);

  if (i === 9) i = 0;
}, 100);

}, 1000);

