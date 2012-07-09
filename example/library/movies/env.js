var offsetX = txt(100),
    offsetY = txt(130),
    windowHeight = txt(160),
    windowWidth = txt(190),
    windowScrollX = txt(220),
    windowScrollY = txt(250);

function txt(y) {
  return new Text('').attr({
    x: 200,
    y: y,
    fontFamily: 'Arial',
    fontSize: '20px'
  }).addTo(stage);
}

function output() {
  offsetX.attr('text', 'offsetX: ' + env.offsetX);
  offsetY.attr('text', 'offsetY: ' + env.offsetY);
  windowWidth.attr('text', 'windowWidth: ' + env.windowWidth);
  windowHeight.attr('text', 'windowHeight: ' + env.windowHeight);
  windowScrollX.attr('text', 'windowScrollX: ' + env.windowScrollX);
  windowScrollY.attr('text', 'windowScrollY: ' + env.windowScrollY);
}

output();

env.on('change', output);