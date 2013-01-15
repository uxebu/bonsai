var rect = new Rect(50, 50, 100, 100).addTo(stage);
rect.attr({
  strokeWidth: 1,
  strokeDash: [5, 4],
  strokeDashOffset: '5',
  strokeColor: 'black',
  fillColor: 'yellow'
});

rect.animate('0.5s', {
  strokeDashOffset: 14,
}, { repeat: Infinity });


var star = new Star(100, 97, 20, 5, 3).addTo(stage);
star.attr({
  strokeWidth: 1,
  strokeDash: [10, 5, 10, 3],
  strokeColor: 'orange',
  fillColor: 'white'
});

// animations of stroke dashes with a different length works, too!
star.animate(new KeyframeAnimation('4s', {
  '0%': { strokeDash: [ 10, 5, 10, 3 ]},
  '50%': { strokeDash: [ 20, 10 ]},
  '100%': { strokeDash: [ 10, 5, 10, 3 ]}
}, { repeat: Infinity }));


// Base morph from animation-morph.js
var a = Path.star(100, 100, 100, 5).attr({
  x: 400, y: 400,
  fillColor: 'red',
  opacity: 0.5,
  strokeDash: [20, 5, 10, 5],
  strokeColor: 'blue',
  strokeWidth: 5,
  rotation: Math.PI
});
var b = new Star(250, 250, 200, 10).attr({
  fillColor: 'blue',
  strokeDash: [10, 10, 10, 10],
  strokeColor: 'blue',
  strokeWidth: 5,
  rotation: 0
});

a.addTo(stage, 0);

a.morphTo(b, '3s');

