/**
 * Tests a simple image creation.
 */

var attributes = {x:20, y:20, width:200, height:200};

// as data uri
var imageDataUri = new Bitmap('').attr(attributes);
stage.addChild(imageDataUri);

// as local source
var imageLocal = new Bitmap('').attr(attributes);
stage.addChild(imageLocal);

// as external source
var imageExternal = new Bitmap('').attr(attributes);
stage.addChild(imageExternal);
