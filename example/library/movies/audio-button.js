
var audio = new Audio([
  { src: 'assets/cinematicBoomNorm.m4a' },
  { src: 'assets/cinematicBoomNorm.ogg' }
]).attr({
  volume: 1
}).addTo(stage);

audio.prepareUserEvent(); // iOS devices

new Button('Boooom!', 50, 50).on('click', function() {
  audio.play(0);
});




// BUTTON IMPLEMENTATION
function Button(text, x, y) {

  var button = new Group().addTo(stage).attr({x: x, y: y});

  button.bg = new Rect(0, 0, 100, 40, 5).attr({
    fillGradient: gradient.radial(['#19D600', '#0F8000'], 100, 50, -20),
    strokeColor: '#CCC',
    strokeWidth: 0
  }).addTo(button);

  button
    .on('mouseover', function() {
      button.bg.animate('.2s', {
        fillGradient: gradient.radial(['#9CFF8F', '#0F8000'], 100, 50, -20),
        strokeWidth: 3
      });
    })
    .on('mouseout', function() {
      button.bg.animate('.2s', {
        fillGradient: gradient.radial(['#19D600', '#0F8000'], 100, 50, -20),
        strokeWidth: 0
      });
    });

  button.text = new Text(text).attr({
    x: 10,
    y: 13,
    fontFamily: 'Arial',
    fontSize: '20px',
    textFillColor: 'white'
  }).addTo(button);

  return button;

}
