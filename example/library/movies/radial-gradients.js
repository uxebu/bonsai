new Rect(0, 0, 250, 250).attr({
  fillGradient: gradient.radial(['red', 'black'], 100)
}).addTo(stage);

new Rect(250, 0, 250, 250).attr({
  fillGradient: gradient.radial(['pink', '#FFF'], 100, 50, 50, 10)
}).addTo(stage);

new Rect(0, 250, 250, 250).attr({
  fillGradient: gradient.radial({
    0: 'white',
    50: 'green'
  }, 50, 0, 0, 5)
}).addTo(stage);

new Rect(250, 250, 250, 250).attr({
  fillGradient: gradient.radial({
    0: 'white',
    50: 'blue'
  }, 50, 100, 100, 5)
}).addTo(stage);
