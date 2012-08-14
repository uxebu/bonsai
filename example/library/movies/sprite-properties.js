// This reproduces what is done in Flash in
// assets/swf/with-actionscript/no-swf/Sprite-properties/
// and it tries to "fix" or adapt the values so that they work in bs
// this is basically the case study for understanding how to
// change values between flash and bonsai.

var stageWidth = 700;
var stageHeight = 600;
var gridDist = 100;

// Move the entire movie a bit down and right, so it is easier to read
stage = new Group().addTo(stage);
stage.attr({x:20, y:20});

// Draw a grid.
for (var i=0; i<stageWidth; i+=10){
  new Path().addTo(stage)
    .attr({strokeWidth:1, strokeColor:'black', opacity:i%gridDist==0 ? 0.5 : 0.2})
    .moveTo(0, i)
    .lineTo(stageHeight, i);
}
for (var i=0; i<stageHeight; i+=10){
  new Path().addTo(stage)
    .attr({strokeWidth:1, strokeColor:'black', opacity:i%gridDist==0 ? 0.5 : 0.2})
    .moveTo(i, 0)
    .lineTo(i, stageWidth);
}



function renderAndApplyProperties(props){
  renderAndApplyProperty(props);
}

var _x = 0;
var _y = 20;
var colors = [0x0000FF, 0x00FF00, 0xFF0000, 0xFF00FF, 0xFFFF00, 0x00F0F0];
var colorIndex = 0;
function renderAndApplyProperty(props){
	var color = colors[colorIndex++ % colors.length] * 256 + 0xFF;
	var sprite = drawExamplePath(color);
	var position = -10;
	var posOffset = 15;
	for (var i=0; i<props.length; i++) {
    var prop = props[i];
    var bsProp = fixPropertyForBonsai(sprite, prop[0], prop[1]);
    if (bsProp.value!='CANT DO'){
  		sprite.attr(bsProp.name, bsProp.value);
    	writeInfo(prop[0], _x, _y+position);
  		position = position + posOffset;
  		writeInfo(prop[1], _x, _y+position);
  		position = position + posOffset;
    } else {
      writeCantDo('NOT in bs', _x, _y+position);
      position = position + posOffset;
      writeCantDo(prop[0], _x, _y+position);
      position = position + posOffset;
      sprite.clear();
    }
	}
	_x += gridDist;
	if (_x+gridDist >= stageWidth){
		_y += gridDist;
		_x = 0;
	}
}

function fixPropertyForBonsai(sprite, name, value){
  var convertedProp = {name:name, value:value};
  var cantDo = [
    'rotationX', 'rotationY', 'blendMode',
    'opaqueBackground', 'z', 'scaleZ'
  ];
  if (cantDo.indexOf(name)!=-1){
    convertedProp.value = 'CANT DO';
  } else
  if (name=='rotation' || name=='rotationZ') {
    convertedProp.value = value / 360 * Math.PI*2;
    convertedProp.name = 'rotation';
  } else if (name=='width'){
//    convertedProp.name = 'scaleX';
// todo....we need to be able to read the width :(
//    convertedProp.value = sprite.attr();
  } else if (name=='alpha'){
    convertedProp.name = 'opacity';
  } else if (name=='visible'){
    convertedProp.name = 'opacity';
    convertedProp.value = value ? 1 : 0;
  }
  return convertedProp;
}


function drawExamplePath(color){
	var sprite = new Movie()
    .attr({x:_x, y:_y})
    .addTo(stage)
    .addChild(
      new Rect(0, 0, 50, 50)
        .attr({fillColor:color, lineWidth:2, lineColor:'black'})
    );
	return sprite;
}

function writeCantDo(textString, x, y){
  var text = new Text(textString)
    .attr({textFillColor:'red', fontWeight:'bold', x:x, y:y, opacity:0.7})
    .addTo(stage);
}
function writeInfo(textString, x, y){
  var text = new Text(textString)
    .attr({textFillColor:'black', x:x, y:y, opacity:0.7})
    .addTo(stage);
// the following properties dont exist in bs yet
//	text.backgroundColor = 0xFFFFFF;
//	text.background = true;
//	text.autoSize = flash.text.TextFieldAutoSize.LEFT;
}





var square = Path.rect(0, 0, 10, 10).attr({fillColor:'0x0000FF'});

[
  			[['blendMode', 'flash.display.BlendMode.SUBTRACT']],
				[['alpha', 0.1]],
				[['alpha', 0.5]],
[],//TODO				[['filters', [new flash.filters.BlurFilter(20)]]],
				[['rotation', 2]],
				[['rotation', 5], ['rotation', 0]],
				[['rotation', 5], ['rotation', -5]],
				[['rotation', -2]],
				[['rotationX', 20]],
				[['rotationX', -20]],
				[['rotationY', 20]],
				[['rotationY', -20]],
				[['rotationZ', 3]],
				[['rotationZ', -3]],
[],//TODO				[['mask', square]], // doenst render anything, somehow ?? :(
				[['scaleX', 2]],
				[['scaleX', 1.5], ['scaleX', 0.9]],
				[['scaleY', 0.5]],
				[['scaleZ', -10]],
				[['opaqueBackground', 0x0000FF]],
				[['height', -10]],
				[['visible', false], ['alpha', 0.5], ['visible', true]],
				[['visible', false]],
				[['width', 90]],
				[['width', 20]],
				[['width', 1]],
				[['width', 104]],
				[['x', 20]],
				[['x', -10]],
				[['y', 20]],
				[['y', -2]],
				[['z', -20]],
				[['z', 20]]//*/
//*/
].forEach(renderAndApplyProperties);
