// linear gradients

new Rect(0, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(-45deg, blue, yellow)'
}).addTo(stage);

new Rect(100, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(yellow, blue 20%, #0f0)'
}).addTo(stage);

new Rect(200, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(to bottom, yellow 0%, blue 100%)'
}).addTo(stage);

new Rect(300, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(to top right, red, white, blue)'
}).addTo(stage);

new Rect(400, 0, 100, 250).attr({
  fillGradient: gradient.linear('left', [
    'rgb(255,25,5)',
    ['green', 20],
    'yellow'
  ])
}).addTo(stage);

new Rect(0, 250, 100, 250).attr({
  fillGradient: 'linear-gradient(0deg, blue, yellow, red, purple 30%, yellow, red)'
}).addTo(stage);

new Rect(100, 250, 100, 250).attr({
  fillGradient: 'linear-gradient(0deg, white, black 40%, red, black 60%, white)'
}).addTo(stage);

new Rect(200, 250, 100, 250).attr({
  fillGradient: 'linear-gradient(-20deg, white, black 40%, red, black 60%, white)'
}).addTo(stage);

new Rect(300, 250, 100, 250).attr({
  fillGradient: 'linear-gradient(20deg, white, black 40%, red, black 60%, white)'
}).addTo(stage);

new Rect(400, 250, 100, 250).attr({
  fillGradient: 'linear-gradient(90deg, blue, white 10%, blue, white 40%, blue)'
}).addTo(stage);
