var Pong, audioSprite;

/**
 * PONG
 */

Pong = (function() {

  /**
   * Setup default settings
   */
  var defaults = {
    width: 500,
    height: 350,
    ballSpeed: 7,
    paddleSpeed: 7,
    ball: {
      width: 20,
      height: 20,
      attr: {
        fillColor: 'rgb(255,255,255)'
      }
    },
    topPaddle: {
      width: 80,
      height: 20,
      left: "a",
      right: "s",
      attr: {
        fillColor: '#0077FF',
        fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
      }
    },
    bottomPaddle: {
      width: 80,
      height: 20,
      left: "left",
      right: "right",
      attr: {
        fillColor: '#FF9500',
        fillGradient: gradient.linear(0, ['rgba(0,0,0,.2)', 'rgba(0,0,0,0)'])
      }
    }
  };

  new Rect(0, 0, defaults.width, defaults.height).fill('black').addTo(stage);

  /**
   * Constructor for Pong, i.e. a new game of Pong
   */
  function Pong() {

    this.config = defaults;

    this.height = this.config.height;
    this.width = this.config.width;

    this.paddleSpeed = this.config.paddleSpeed;
    this.ballSpeed = this.config.ballSpeed;

    this.newGame();

  }

  /**
   * keyIsDown method, used in Paddle instances to determine
   * whether a key is down at any time
   */
  Pong.keyIsDown = (function(){

    var keys = {
      37: "left",
      39: "right",
      65: "a",
      83: "s"
    };

    var down = {};

    stage.on('keydown', function(e) {
      var key = e.keyCode;
      down[keys[key]] = true;
    });

    stage.on('keyup', function(e) {
      var key = e.keyCode;
      down[keys[key]] = false;
    });

    return function(key){
      return !!down[key];
    };

  })();

  /**
   * Paddle constructor, prepares Paddle instances, nothing special
   */
  function Paddle(pong, isAuto, config, position){

    this.isAuto = isAuto;
    this.config = config;
    this.width = config.width;
    this.height = config.height;
    this.bs = new Rect(0, 0, this.width, this.height, 5).attr(config.attr).addTo(stage);
    this.x = position.x;
    this.y = position.y;
    this.pong = pong;

  }

  /**
   * Ball constructor, prepares Ball instances,
   * determines initial deltaX and deltaY fields
   * dependent on specified ballSpeed. E.g. if we want
   * a speed of 5, then we must make sure that:
   * Math.abs(deltaX) + Math.abs(deltaY) === 5
   */
  function Ball(pong, config, position){

    this.config = config;
    this.width = config.width;
    this.height = config.height;

    this.bs = new Rect(0, 0, this.width, this.height, this.width/2).attr(config.attr);

    this.deltaY = Math.floor(Math.random() * pong.ballSpeed) + 1;
    this.deltaX = pong.ballSpeed - this.deltaY;

    // Half the time, we want to reverse deltaY
    // (making the ball begin in a random direction)
    if ( Math.random() > 0.5 ) {
      this.deltaY = -this.deltaY;
    }

    // Half the time, we want to reverse deltaX
    // (making the ball begin in a random direction)
    if ( Math.random() > 0.5 ) {
      this.deltaX = -this.deltaX;
    }

    this.x = position.x;
    this.y = position.y;
    this.pong = pong;
    this.isInitiated = false;

    this.setLocation(this.x, this.y);
    this.bs.addTo(stage);

  }

  /**
   * The setLocation method is the same for the Ball and
   * Paddle classes, for now, we're just drawing rectangles!
   */
  Paddle.prototype.setLocation = Ball.prototype.setLocation = function( x, y ) {

    this.bs.attr({
      x: x - this.width / 2,
      y: y - this.height / 2
    });

  };

  tools.mixin( Pong.prototype, {

    /**
     * A new game, initialises a top and bottom paddle, and
     * calls newRound
     */
    newGame: function() {

      this.topPaddle = new Paddle(this, true, this.config.topPaddle, {
        x: this.width /  2,
        y: this.config.ball.height + this.config.topPaddle.height/2
      });

      var userPaddle = this.bottomPaddle = new Paddle(this, false, this.config.bottomPaddle, {
        x: this.width /  2,
        y: this.height - this.config.ball.height - this.config.bottomPaddle.height/2
      });

      stage.on('pointermove', function(e) {
        if (e.target !== stage) return;
        userPaddle.x = e.stageX;
      });

      this.newRound();

    },

    /**
     * newRound initalises a new Ball!
     */
    newRound: function() {

      if (this.ball) {

        playSprite(6);

        var oldBall = this.ball;
        oldBall.bs.animate('.5s', {
          opacity: 0
        }, {
          onEnd: function() {
            oldBall.bs.remove(); // clear old ball
          }
        });
      }

      this.ball = new Ball(this, this.config.ball, {
        x: this.width /  2,
        y: this.height / 2
      });

      var ball = this.ball;
      ball.bs.attr({ opacity: 0 }).animate('.5s', {
        opacity: 1
      }, {
        onEnd: function() {
          setTimeout(function() {
            ball.start();
          }, 1000);
        }
      });

    },

    /**
     * Starting a new game involves initialising an
     * interval which will run every 20 milliseconds
     */
    start: function() {

      var pong = this;

      stage.on('tick', function() {
        pong.draw();
      });

      // Return this for chainability
      return this;

    },

    /**
     * draw, called every few milliseconds to draw each
     * object to the canvas
     */
    draw: function() {
      this.topPaddle.draw();
      this.bottomPaddle.draw();
      this.ball.draw();
    }

  });

  tools.mixin( Paddle.prototype, {

    /**
     * If this is the TOP paddle
     */
    isTop: function() {
      return this === this.pong.topPaddle;
    },

    /**
     * intersectsBall, determines whether a ball is currently
     * touching the paddle
     */
    intersectsBall: function() {

      var bX = this.pong.ball.x,
        bY = this.pong.ball.y,
        bW = this.pong.ball.width,
        bH = this.pong.ball.height;

      return (
            this.isTop() ?
              (bY - bH/2 <= this.y + this.height/2 && bY + bH/2 > this.y + this.height/2) :
              (bY + bH/2 >= this.y - this.height/2 && bY - bH/2 < this.y - this.height/2)
           ) &&
           bX + bW/2 >= this.x - this.width/2 &&
           bX - bW/2 <= this.x + this.width/2;

    },

    /**
     * Calculate AI movements
     */
    calculateAI: function() {

      var pong = this.pong,
          ball = this.pong.ball;

      if (ball.isMoving) {
        if (Math.abs(ball.x - this.x) < 30) {
          //console.log('Smal');
          //this.x += this.lastAutoDeltaX || 0;
          return; // prevent shaking
        }
        if (ball.x > this.x && !this.isAtRightWall()) {
          this.x += this.lastAutoDeltaX = pong.paddleSpeed;
        } else if (ball.x < this.x && !this.isAtLeftWall()) {
          this.x += this.lastAutoDeltaX = -pong.paddleSpeed;
        } else {
          this.lastAutoDeltaX = 0;
        }
      }

    },

    /**
     * Prepares a new frame, by taking into account the current
     * position of the paddle and the ball. setLocation is called
     * at the end to actually draw to the canvas!
     */
    draw: function() {

      var config = this.config,
        pong = this.pong,
        ball = pong.ball,
        ballSpeed = pong.ballSpeed,

        xFromPaddleCenter,
        newDeltaX,
        newDeltaY;

      if (this.isAuto) {

        this.calculateAI();

      } else {

        if ( Pong.keyIsDown(config.left) && !this.isAtLeftWall() ) {
          this.x -= pong.paddleSpeed;
        }

        if ( Pong.keyIsDown(config.right) && !this.isAtRightWall() ) {
          this.x += pong.paddleSpeed;
        }

      }

      if ( this.intersectsBall() ) {

        playSprite(0);

        xFromPaddleCenter = (ball.x - this.x) / (this.width / 2);
        xFromPaddleCenter = xFromPaddleCenter > 0 ? Math.min(1, xFromPaddleCenter) : Math.max(-1, xFromPaddleCenter);

        if ( Math.abs(xFromPaddleCenter) > 0.5 ) {
          ballSpeed += ballSpeed * Math.abs(xFromPaddleCenter);
        }

        newDeltaX = Math.min( ballSpeed - 2, xFromPaddleCenter * (ballSpeed - 2) );
        newDeltaY = ballSpeed - Math.abs(newDeltaX);

        ball.deltaY = this.isTop() ? Math.abs(newDeltaY) : -Math.abs(newDeltaY);
        ball.deltaX = newDeltaX;

      }

      this.setLocation( this.x , this.y );

    },

    /**
     * If the paddle is currently touching the right wall
     */
    isAtRightWall: function() {
      return this.x + this.width/2 >= this.pong.width;
    },

    /**
     * If the paddle is currently touching the left wall
     */
    isAtLeftWall: function() {
      return this.x - this.width/2 <= 0;
    }

  });

  tools.mixin( Ball.prototype, {

    start: function() {
      this.isInitiated = true;
    },

    /**
     * If the ball is currently touching a wall
     */
    isAtWall: function() {
      return this.x + this.width/2 >= this.pong.width || this.x - this.width/2 <= 0;
    },

    /**
     * If the ball is currently at the top
     */
    isAtTop: function() {
      return this.y + this.height/2 <= 0;
    },

    /**
     * If the paddle is currently at the bottom
     */
    isAtBottom: function() {
      return this.y - this.height/2 >= this.pong.height;
    },

    /**
     * Simply continues the progression of the ball, by
     * setting the location to the prepared x/y values
     */
    persist: function() {
      this.setLocation(
        this.x,
        this.y
      );
    },

    /**
     * Prepares the ball to be drawn to the canvas,
     * to bounce the ball off the walls, the deltaX
     * field is simply inverted (+5 becomes -5).
     */
    draw: function() {

      if (!this.isInitiated) {
        return;
      }

      if ( this.isAtWall() ) {
        playSprite(4);
        this.deltaX = -this.deltaX;
      }

      if ( this.isAtBottom() || this.isAtTop() ) {
        this.pong.newRound();
        return;
      }

      this.isMoving = true;
      this.x = this.x + this.deltaX;
      this.y = this.y + this.deltaY;

      this.persist();

    }

  });

  return Pong;

})();

// popup
var popup = new Group().addTo(stage).attr({ x: 140, y: 120});
new Rect(0, 0, 200, 100, 10)
  .fill(gradient.linear(0, ['red', 'yellow']))
  .stroke('green', 2)
  .addTo(popup);
new Text('Go!').attr({
  textFillColor: 'white', fontFamily: 'Arial', fontSize: 60, x: 50, y: 30
}).addTo(popup);

// sound
audioSprite = new Audio([
  { src: 'assets/pong.mp3' },
  { src: 'assets/pong.ogg' }
]).prepareUserEvent().addTo(stage).on('load', function() {
  popup.destroy();
  new Pong().start();
});

var timeoutId = null;
function playSprite(time) {
  audioSprite.play(time);
  clearTimeout(timeoutId);
  timeoutId = setTimeout(function() {
    audioSprite.pause();
  }, 500);
}




