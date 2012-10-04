var resources = [
  {src: 'assets/sample_iPod.m4v', type:'video/mp4'},
  {src: 'assets/sample.ogv', type:'video/ogg'}
];

new Video(resources, function() {
    this.attr({
      y: 150,
      x: 150,
      width:320,
      height:240
    }).addTo(stage);
});
