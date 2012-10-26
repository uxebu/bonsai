/**
 * filter color matrix shim 2
 */

var testPath = new Rect(100,100,100,100)
  .addTo(stage)
  .attr({
    fillColor:"red"
  });

setTimeout(function(){
  testPath.attr({
    fillColor: 'green'
  });
},1000);

setTimeout(function(){
  testPath.attr({
    filters: new filter.ColorMatrix([
        1, 1, 1, 0, 0,
        1, 0.7, -1, 0, 0,
        -1, -1, -1, 0, 0,
        0, 0, 0, 1, 0
      ])
  });
},2000);

setTimeout(function(){
  testPath.attr({
    fillColor: 'black'
  });
},3000);

setTimeout(function(){
  testPath.attr({
    fillColor: 'white'
  });
},4000);
