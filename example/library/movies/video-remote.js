var resources = [
  {src: 'http://content.bitsontherun.com/videos/bkaovAYt-27m5HpIu.webm'},
  {src: 'http://content.bitsontherun.com/videos/bkaovAYt-injeKYZS.mp4'}
];

var video = new Video(resources).attr({
  y: 50,
  x: 50,
  width:480,
  height:270
});

stage.addChild(video.play());
