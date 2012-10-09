new Sprite(['assets/redpanda.jpg'], function(err){
  if (err) return;
  this.attr({
    y: -256,
    x: -256
  });
  stage.addChild(this);
  this.animate('1s', {x: 0, y: 0, rotation: .2});
});
