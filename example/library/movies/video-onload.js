var resources = [
  {src: 'assets/sample_iPod.m4v', type:'video/mp4'},
  {src: 'assets/sample.ogv', type:'video/ogg'}
];

new bonsai.Video(resources, {
  // set loadLevel, see asset_resource.js
  loadLevel: 'can-play',
  // when onload is fired depends on the loadLevel
  onload: function() {
    this.attr({
      y: 150,
      x: 150,
      width:320,
      height:240
    }).addTo(stage);
  }
});
