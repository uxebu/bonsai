// one
var _red = Path.rect(30,30,50,50).attr({
  fillColor:'red'
}).addTo(stage);

// two
var _orange = Path.rect(130,30,50,50).attr({
  fillColor:'orange'
}).addTo(stage);


stage.frames({
 '1s': function() {
    _red.attr('filters', new filter.Blur(2));
  },
  '2s' : function() {
    _orange.attr('filters', new filter.Blur(2));
  },
  '3s' : function() {
    _red.attr('filters', null);
  },
  '4s' : function() {
    _orange.attr('filters', null);
  }
});
