var player = new bonsai.Path()
    .moveTo(0,-20)
    .lineBy(10,30)
    .lineBy(-20,0)
    .closePath()
    .attr({
        fillColor: 'transparent',
        strokeColor: 'blue',
        strokeWidth: 1,
        x: 100,
        y:500
    });
stage.addChild(player);

var direction = 270;
var speed = 1;
var turnSpeed = 7;
var bullets = [];
var bulletId = 0;

function move(object, speed, direction) {
    var x = object.attr('x');
    var y = object.attr('y');

    var rad = Math.PI * direction / 180;

    x += Math.cos(rad) * speed;
    y += Math.sin(rad) * speed;
    object.attr({
        x:x,
        y:y,
        rotation: rad + Math.PI / 2
    });
}

function fireBullet () {
    var rotation = Math.PI * direction / 180 + Math.PI / 2;
    var bulletPath = new bonsai.Path()
        .moveTo(0,0)
        .lineTo(0,10)
        .attr({
            strokeWidth: 1,
            strokeColor: 'black',
            rotation: rotation,
            x: player.attr('x'),
            y: player.attr('y')
        });
    var bullet = {
        direction: direction,
        shape: bulletPath,
        id: bulletId++
    };
    stage.addChild(bulletPath);
    bullets.push(bullet);
    setTimeout(function(){
        bullets = bullets.filter(function(_b){
            return _b.id !== bullet.id;
        });
        bullet.destroy();
    }, 3000);
}

stage.on('key', function(data){
    switch (data.keyCode) {
        case 37:
            direction -= turnSpeed;
            break;
        case 39:
            direction += turnSpeed;
            break;
        case 38:
            speed *= 1.1;
            break;
        case 40:
            speed *= 0.9;
            break;
        case 32:
            fireBullet();
            break;
    }
});

setInterval(function(){
    move(player,speed,direction);
    bullets.forEach(function(bullet){
        move(bullet.shape, 10, bullet.direction);
    });
}, 1000/stage.framerate);
