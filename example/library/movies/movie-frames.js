/*

  This movie shows a simple test case, where we jump straight from
  frame 3 to frame 0, which means frames 4 and 5 will never be played.

 */

stage.root.setFramerate(1);

var text = new Text('nix')
  .addTo(stage)
  .attr({x:10, y:10});

var frames = {
  0:function(){text.attr('text', '0')},
  1:function(){text.attr('text', '01')},
  2:function(){text.attr('text', '012')},
  3:function(){
    text.attr('text', '0123');
    this.play(0); // jump back to frame 0, 4 and 5 should never be rendered.
  },
  4:function(){text.attr('text', '01234')},
  5:function(){text.attr('text', '012345 END')}
};

new Movie().frames(frames).addTo(stage);
