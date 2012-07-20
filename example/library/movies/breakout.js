function move(object, speed, direction) {
    var x = object.attr('x');
    var y = object.attr('y');

    var rad = Math.PI * direction / 180;

    x += Math.cos(rad) * speed;
    y += Math.sin(rad) * speed;
    object.attr({x:x,y:y});
}

var breakout = {

    paddle: null,

    paddlePosition: 100,

    paddleSpeed: 20,

    blocks: [],

    ball: null,

    ballX: 0,

    ballY: 0,

    direction: 0,

    speed: 0,

    init: function() {
        this.createPaddle();
        this.createBlocks();
        this.createBall();

        stage.on('advance', function() {
          breakout.loop()
        });
    },

    createBlocks: function (){
        var rowCount = 5,
            colCount = 10,
            blockCount = colCount * rowCount,
            blockHeight = 10,
            blockWidth = 50,
            blockPadding = 2;

        for (var i=0, m=blockCount; i<m; i++) {
            var col = i % colCount;
            var row = ~~(i / colCount);
            var x = col * (blockWidth + blockPadding);
            var y = row * (blockHeight + blockPadding);
            var block = bonsai.Path.rect(0,0,blockWidth,blockHeight)
                .attr({fillColor: 'green'});
            block.attr({x:x, y:y});
            stage.addChild(block);
            this.blocks.push(block);
        }
    },

    createPaddle: function() {
        this.paddle = bonsai.Path.rect(0,0,150,10).attr({fillColor: 'black'});
        this.paddle.attr({x: this.paddlePosition, y: 400 });
        stage.addChild(this.paddle);
        this.connectPaddle();
    },

    createBall: function() {
        this.ball = bonsai.Path.circle(0,0,5).attr({fillColor: 'red'});
        stage.addChild(this.ball);
    },

    connectPaddle: function() {
        stage.on('key', function(data){
            switch (data.keyCode) {
                case 37:
                    breakout.paddlePosition -= breakout.paddleSpeed;
                    breakout.paddle.attr({x: breakout.paddlePosition});
                    break;
                case 39:
                    breakout.paddlePosition += breakout.paddleSpeed;
                    breakout.paddle.attr({x: breakout.paddlePosition});
                    break;
            }
        });
    },

    loop: function() {
        var x = this.ballX,
            y = this.ballY,
            speed = this.speed,
            direction = this.direction;

        // calculate new position;
        var rad = Math.PI * direction / 180;
        x += Math.cos(rad) * speed;
        y += Math.sin(rad) * speed;

        // detect collisions
    }

};

breakout.init();
