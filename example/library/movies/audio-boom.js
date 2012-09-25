
new Rect(145, 290, 1000, 60).fill('black').addTo(stage);

var teamText = new Text('loading...').attr({
  textFillColor: 'white',
  scale:3,
  x: 150,
  y: 300
}).addTo(stage);

var movie = new Movie();

var booom = new Audio([
  { src: 'assets/cinematicBoomNorm.m4a' },
  { src: 'assets/cinematicBoomNorm.ogg' }
]).attr({
  volume: 1
}).addTo(stage).on('load', function() {

  var i = 0, teaser = ['A Path', 'a red panda', 'and an Audio', 'walked into a bar'];

  movie.frames({
    0: function() {
      booom.play();
      teamText.attr({
        text: teaser[i]
      });
    },
    '2s': function() {
      if (i === teaser.length) {
        movie.stop();
      }
      booom.stop();
      i++;
    }
  }).addTo(stage);

});


