var resources = [
  {src: 'assets/sample_iPod.m4v', type:'video/mp4'},
  {src: 'assets/sample.ogv', type:'video/ogg'}
];

var video = new Video(resources).attr({
  y: 150,
  x: 150,
  width:320,
  height:240
});

stage.addChild(video);
