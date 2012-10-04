var resources = [
  {src: 'assets/sample_iPod.m4v'},
  {src: 'assets/sample.ogv', type:'video/ogg'}
];

var video = new Video(resources, function() {
    this.attr({
      y: 150,
      x: 150,
      width:320,
      height:240
    }).addTo(stage).play();
});


// this would crash your browser
stage.on('tick', function() {
 // video.request(resources);
});
