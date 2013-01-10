var rect = new Rect(50, 50, 100, 100).addTo(stage);
rect.attr({
  strokeWidth: 1,
  strokeDash: [5, 4],
  strokeDashOffset: '5',
  strokeColor: 'black',
  fillColor: 'yellow'
});

var i = 0;
var offset = false;
setInterval(function () {
  i++;

  rect.attr('strokeDashOffset', i);

  if (i === 9) i = 0;
}, 100);

var star = new Star(100, 97, 20, 5, 3).addTo(stage);
star.attr({
  strokeWidth: 1,
  strokeDash: [10, 5, 10, 3],
  strokeDashOffset: 5,
  strokeColor: 'orange',
  fillColor: 'white'
});


star.animate('1s', {
  strokeDashOffset: 28
}, { repeat: Infinity });


