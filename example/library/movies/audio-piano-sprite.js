var pianoSprite = [], changePianoSprite = 0;

function aSound(atTime) {
  // TODO: test multiple audio "confirmations" on iOS.
  var aPianoSprite = pianoSprite[0];
  changePianoSprite += 1;
  new Movie().addTo(stage).frames({
   0: function() {
     aPianoSprite.play(atTime);
   },
   '1s': function() {
     aPianoSprite.stop();
     this.stop();
     stage.removeChild(this);
   }
  });
}

// load indicator
var aTextField = new Text('loading...').addTo(stage);

function ready() {
  aTextField.attr({ text: 'Start typing: [1-8]', scale:0.5 }).animate('0.5s', {
    opacity: 1, scale: 1
  }, { easing: 'elasticOut' });

  aSound(0);

  stage.on('key', function(e) {
    var atTime = +String.fromCharCode(e.keyCode);
    if (['C', 'D', 'E', 'F', 'G', 'A', 'H', 'C2'][atTime]) {
      aSound(atTime-1);
    }
  });
}

pianoSprite.push(new Audio([
  { src: 'assets/piano-sprite.m4a' },
  { src: 'assets/piano-sprite.mp3' },
  { src: 'assets/piano-sprite.ogg' }
]).attr('prepareUserEvent', true));
pianoSprite[0].addTo(stage).on('load', function() {
  //pianoSprite[1] = pianoSprite[0].clone().addTo(stage);
  aTextField.animate('0.5s', { opacity:0 }, { onEnd: ready });
});
