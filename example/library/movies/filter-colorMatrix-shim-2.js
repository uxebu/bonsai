var testShape = Shape.rect(100,100,100,100)
  .addTo(stage)
  .attr({
    fillColor:"red"
  }); 
 
setTimeout(function(){
  testShape.attr({
    fillColor: 'green'
  });
},1000); 
  
setTimeout(function(){
  testShape.attr({
    filters: filter.colorMatrix([
        1, 1, 1, 0, 0,
        1, 0.7, -1, 0, 0,
        -1, -1, -1, 0, 0,
        0, 0, 0, 1, 0
      ]) 
  });
},2000);

setTimeout(function(){
  testShape.attr({
    fillColor: 'black'
  });
},3000); 

setTimeout(function(){
  testShape.attr({
    fillColor: 'white'
  });
},4000);