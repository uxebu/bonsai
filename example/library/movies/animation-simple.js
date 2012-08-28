var aRect1 = new Rect(0, 0, 150, 150).fill('red').addTo(stage);
var aRect2 = new Rect(0, 200, 150, 150).fill('green').addTo(stage);
var aRect3 = new Rect(0, 400, 150, 150).fill('blue').addTo(stage);

// How to animate a DisplayObject? Three different ways:

// pass properties to animate
aRect1.animate('1s', { x: 150 });

// pass Animation instance to animate
var aAnim = new Animation('1s', { x: 150 });
aRect2.animate(aAnim);

// pass Animation instance to animate
var aAnim = new Animation('1s', { x: 150 });
aAnim.addSubject(aRect3).play();
