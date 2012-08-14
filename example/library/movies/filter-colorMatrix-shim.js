Path.rect(50, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(yellow, blue 20%, #0f0)'
}).addTo(stage);

Path.rect(150, 0, 100, 250).attr({
  fillGradient: 'linear-gradient(yellow, blue 20%, #0f0)',
  filters:[filter.colorMatrix([
      1, 0, 0, 0, -0.26953125,
      0, 1, 0, 0, 0.39453125,
      0, 0, 1, 0, 0.46484375,
      0, 0, 0, 1, 0])]
}).addTo(stage);

Path.rect(300, 5, 100, 250).attr({
  fillColor: 'blue',
  strokeColor: 'red',
  strokeWidth: 10
}).addTo(stage);
Path.rect(410, 5, 100, 250).attr({
  fillColor: 'blue',
  strokeColor: 'red',
  strokeWidth: 10,
  filters:[filter.colorMatrix([
      1, 0, 0, 0, -0.26953125,
      0, 1, 0, 0, 0.39453125,
      0, 0, 1, 0, 0.46484375,
      0, 0, 0, 1, 0])]
}).addTo(stage);

new Text('Hello World').attr({
  x:200,
  y:400,
  fontSize:30,
  textFillColor: 'red'
}).addTo(stage);
new Text('Hello World').attr({
  x:200,
  y:430,
  fontSize:30,
  textFillColor: 'red',
  filters:[filter.colorMatrix([
      1, 0, 0, 0, -0.26953125,
      0, 1, 0, 0, 0.39453125,
      0, 0, 1, 0, 0.46484375,
      0, 0, 0, 1, 0])]
}).addTo(stage)


