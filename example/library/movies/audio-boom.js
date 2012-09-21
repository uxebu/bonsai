
var booom = new Audio('assets/cinematicBoomNorm.m4a').attr({
  volume: 1
}).addTo(stage);

var i = 0, teaser = ['A Path', 'a red panda', 'and a Audio', 'walked into a bar'];

new Rect(145, 290, 1000, 60).fill('black').addTo(stage);
var teamText = new Text('').attr({
  textFillColor: 'white',
  scale:3,
  x: 150,
  y: 300
}).addTo(stage);

stage.frames({
  0: function() {
    booom.play();
    teamText.attr({
      'scale': [2, 2],
      text: teaser[i]
    }).animate('2s', {
      scale:[1, 5]
    });
  },
  '2s': function() {
    if (i === teaser.length) {
      stage.stop();
    }
    booom.stop();
    i++;
  }
});


