new Audio([
  { src: 'assets/cinematicBoomNorm.m4a' },
  { src: 'assets/cinematicBoomNorm.ogg' }
]).addTo(stage).on('load', function() {
  this.play();
});


