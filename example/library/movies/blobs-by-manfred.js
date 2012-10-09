var groups = [];
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );
groups.push( new Group().addTo(stage) );

var currentState;
var blobs = [];
var setup = {
  stageWidth:env.windowWidth/2, //ide
  stageHeight:env.windowHeight,
  stageCenter:{x:env.windowWidth/2/2,y:env.windowHeight/2.5}
};
var dynamic = {
    scale:true,
    opacity:true,
    blur:false,
    speed:1
};
/* tools */
var fps = {
  strength:20,
  frameTime:0,
  lastLoop:new Date(),
  thisLoop:null,
  measure:function(){
    fps.frameTime += ((fps.thisLoop=new Date())-fps.lastLoop-fps.frameTime)/fps.strength;
    fps.lastLoop = fps.thisLoop;
    return this;
  },
  toString:function(){
    return (1000/this.frameTime).toFixed(1) + " fps";
  }
};
function newColor(){
  return color('white').randomize();
}
function newBlob(){
  var blob = {
    width:Math.random()*40,
    height:Math.random()*40,
    scale:0.2,
    opacity:1,
    x:setup.stageCenter.x,
    y:setup.stageCenter.y,
    xSpeed:Math.random()*10-5,
    ySpeed:Math.random()*10-5
  };
  blob.shape = Path.circle(blob.x,blob.y,blob.width).attr({fillColor:newColor(),opacity:blob.opacity});
  return blob;
}
function stats(){
  var statsStr = blobs.length+" blobs at "+fps.measure().toString();
  groups[5].children()[0].attr('text',statsStr);
}

/* states */
function stateInit(){
  var clip = new Rect(0,0,setup.stageWidth,setup.stageHeight).attr({fillColor:'#333333'}).addTo(groups[0]);
  groups[1].attr('clip',clip.clone());
  new Rect(setup.stageCenter.x-70,setup.stageHeight-120, 140, 40, 5).attr({fillColor:'#666666',strokeColor:'#999999',strokeWidth:2}).addTo(groups[2]);
  new Text('Pause').attr({x:setup.stageCenter.x-24,y:setup.stageHeight-108,fontSize: '20px',textFillColor: 'white'}).addTo(groups[2]);
  groups[2].on('click', pauseHandler);
  new Rect(setup.stageCenter.x-120,setup.stageHeight-120, 40, 40, 5).attr({fillColor:'#666666',strokeColor:'#999999',strokeWidth:2}).addTo(groups[3]);
  new Text('-').attr({x:setup.stageCenter.x-103,y:setup.stageHeight-108,fontSize: '20px',textFillColor: 'white'}).addTo(groups[3]);
  groups[3].on('click', minusHandler);
  new Rect(setup.stageCenter.x+80,setup.stageHeight-120, 40, 40, 5).attr({fillColor:'#666666',strokeColor:'#999999',strokeWidth:2}).addTo(groups[4]);
  new Text('+').attr({x:setup.stageCenter.x+94,y:setup.stageHeight-108,fontSize: '20px',textFillColor: 'white'}).addTo(groups[4]);
  groups[4].on('click', plusHandler);
  new Text("Calculating...").attr({x:10,y:10,fontFamily: 'Arial',fontSize: '12px',textFillColor: 'white'}).addTo(groups[5]);
  new Rect(setup.stageWidth-100,10, 80, 20, 0).attr({fillColor:'#666666'}).addTo(groups[6]);
  new Text('Scale').attr({x:setup.stageWidth-74,y:14,textFillColor: '#ffffff'}).addTo(groups[6]);
  groups[6].on('click', scaleHandler);
  new Rect(setup.stageWidth-100,30, 80, 20, 0).attr({fillColor:'#666666'}).addTo(groups[7]);
  new Text('Blur').attr({x:setup.stageWidth-70,y:34,textFillColor: '#333333'}).addTo(groups[7]);
  groups[7].on('click', blurHandler);
  new Rect(setup.stageWidth-100,50, 80, 20, 0).attr({fillColor:'#666666'}).addTo(groups[8]);
  new Text('Opacity').attr({x:setup.stageWidth-80,y:54,textFillColor: '#ffffff'}).addTo(groups[8]);
  groups[8].on('click', opacityHandler);
  setInterval(stats,1000);
  currentState = stateRun;
}
function stateRun(){
  stats();
  var i=0;
  for(;i<dynamic.speed;i++){
    var blob = newBlob();
    blob.shape.addTo(groups[1],0);

    blobs.push(blob);
  }
  // filters are now on groups
  if(dynamic.blur){ groups[1].attr("filters", [new filter.Blur(2)]); }
  else { groups[1].attr("filters", []); }
  for(i=0;i<blobs.length;i++){
    if(blobs[i].opacity<=0||blobs[i].x>setup.stageWidth||blobs[i].x<0||blobs[i].y>setup.stageHeight||blobs[i].y<0){
      blobs[i].shape.remove();
      blobs.splice(i,1);
    }
    blobs[i].x += blobs[i].xSpeed;
    blobs[i].y += blobs[i].ySpeed;
    blobs[i].scale *= 1.04;
    blobs[i].opacity -= 0.015;
    if(dynamic.scale){ blobs[i].shape.attr("scale", blobs[i].scale); }
    if(dynamic.opacity){ blobs[i].shape.attr("opacity", blobs[i].opacity); }
    //if(dynamic.blur){ blobs[i].shape.attr("filters", [new filter.Blur(1)]); }
    blobs[i].shape.attr("x", blobs[i].x);
    blobs[i].shape.attr("y", blobs[i].y);
  }
}
function statePause(){ stats(); }
function stateDispose(){ /* implement */ }

/* events */
function pauseHandler(target){
  if(currentState==stateRun){
    currentState = statePause;
    this.children()[1].attr('text',"Play");
  } else {
    currentState = stateRun;
    this.children()[1].attr('text',"Pause");
  }
}
function minusHandler(target){ dynamic.speed -= dynamic.speed<=0 ? 0 : 1; }
function plusHandler(target){ dynamic.speed += 1; }
function scaleHandler(){
  dynamic.scale = !dynamic.scale;
  groups[6].children()[1].attr('fillColor',dynamic.scale?'#ffffff':'#333333');
}
function blurHandler(){
  dynamic.blur = !dynamic.blur;
  groups[7].children()[1].attr('fillColor',dynamic.blur?'#ffffff':'#333333');
}
function opacityHandler(){
  dynamic.opacity = !dynamic.opacity;
  groups[8].children()[1].attr('fillColor',dynamic.opacity?'#ffffff':'#333333');
}

/* init */
currentState = stateInit;
stage.on("tick",function(){ currentState(); });
