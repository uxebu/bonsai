var resources = [
  {src: 'assets/sample_iPod.m4v'},
  {src: 'assets/sample.ogv', type:'video/ogg'}
];

new Video(resources).attr({
  y: 50,
  x: 50,
  width:320,
  height:240
}).on('load', function() {
  // play immediately (iOS doesn't allow that)
  this.addTo(stage).play();
});
