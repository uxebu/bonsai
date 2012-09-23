define(function() {
  var MAE_N_PASS_THRESHOLD = 0.001;
  jasmine.getEnv().defaultTimeoutInterval = 10000;

  describe('Compare bonsai shapes', function(){
    var bsVariant = {
      content: function() {
        stage.addChild(Path.rect(0.5, 0.5, 100, 100).attr({fillColor:'red'}));
      },
      delay: 2000
    };

    it('should create two different bonsai shapes and compare their visual result', function() {
      var bsVariantAlt = {
        content: function() {
          stage.addChild(bonsai.Path.rect(0.5, 0.5, 110, 110).attr({fillColor:'blue'}));
        },
        delay: 2000
      };
      compare(bsVariant, bsVariantAlt, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae).toBe(27533.8);
      }));
    });

    it('compares an image and a bonsai shape', function() {
      var imageVariant = {
        content: 'asset/test_red_square.png',
        delay: 100
      };
      compare(bsVariant, imageVariant, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae).toBe(0);
      }));
    });

    it('compares a canvas and a bonsai shape', function() {
      var canvasVariant = {
        content: function() {
          canvas.fillStyle = 'red';
          canvas.fillRect(0.5, 0.5, 100, 100);
        },
        delay: 100
      };
      compare(bsVariant, canvasVariant, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae_n).toBeLessThan(0.02);
      }));
    });

    it('compares a svg file and a bonsai shape', function() {
      var svgVariant = {
        content: 'asset/test_red_square.svg',
        delay: 100
      }
      compare(bsVariant, svgVariant, {
        x: -1,
        y: -1,
        width: 120,
        height: 120
        }, waitForAsync(function(result) {
          expect(result.mae_n).toBeLessThan(0.02);
        }));
    });

    it('compares a svg string and a bonsai shape', function() {
      var svgVariantStr = {
        content: '<svg xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" version="1.0" width="100" height="100"><rect width="100" height="100" x="1" y="1" style="fill:red;"/></svg>',
        delay: 100
      }
      compare(bsVariant, svgVariantStr, {
        width: 120,
        height: 120
        }, waitForAsync(function(result) {
          expect(result.mae_n).toBeLessThan(0.02);
        }));
    });


    it('compares a bonsai movie with a flash movie', function() {
      var flashVariant = {
        content: "asset/test_1px_black_square.swf",
        wmode: "opaque",
        delay: 500
      };
      compare(bsVariant, flashVariant, {
        width: 550,
        height: 400
      }, waitForAsync(function(result) {
        expect(result.ae).toBe(220000);
      }));
    });

    it('compares blending of a bikshed movie and svg', function() {
      var blendBs = {
        content: function(stage) {
          stage.addChild(Path.rect(10, 10, 60, 60).attr({
            fillColor: '#00ff00',
            opacity: 0.5,
            strokeColor: 0x00000000
          }));

          stage.addChild(Path.rect(30, 30, 60, 60).attr({
            fillColor: '#ff0000',
            opacity: 0.5,
            strokeColor: 0x00000000
          }));

          stage.addChild(Path.rect(50, 50, 60, 60).attr({
            fillColor: '#0000ff',
            opacity: 0.5,
            strokeColor: 0x00000000
          }));
        },
        delay: 2000
      };
      var blendSvg = {
        content: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="120" height="120" viewBox="-0.5 -0.5 120 120">' +
          '<rect x="10" y="10" width="60" height="60" fill="#00ff00" opacity="0.5" />' +
          '<rect x="30" y="30" width="60" height="60" fill="#ff0000" opacity="0.5" />' +
          '<rect x="50" y="50" width="60" height="60" fill="#0000ff" opacity="0.5" />' +
          '</svg>'
      };
      compare(blendBs, blendSvg, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae_n).toBeLessThan(MAE_N_PASS_THRESHOLD);
      }));
    });

    it('compares circles of a bikshed movie and svg', function() {
      var circleBs = {
        content: function(stage) {
          var nyanColors = [
            '#ff0000',
            '#ffa500',
            '#ffff00',
            '#008000',
            '#0000ff',
            '#480082',
            '#ee82ee'
          ];

          nyanColors.map(function(color, i) {
            var l = nyanColors.length,
                r = Math.round(((l-i)/l) * 60);
            return bonsai.Path
              .circle(60, 60, r)
              .attr({fillColor: color, strokeColor: 0x00000000});
          }).forEach(function(circle) {
            stage.addChild(circle);
          });
        },
        delay: 2000
      };
      var circleSvg = {
        content: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="120" height="120" viewBox="-0.5 -0.5 120 120">' +
          '<circle cx="60" cy="60" r="60" fill="#ff0000" />' +
          '<circle cx="60" cy="60" r="51" fill="#ffa500" />' +
          '<circle cx="60" cy="60" r="43" fill="#ffff00" />' +
          '<circle cx="60" cy="60" r="34" fill="#008000" />' +
          '<circle cx="60" cy="60" r="26" fill="#0000ff" />' +
          '<circle cx="60" cy="60" r="17" fill="#480082" />' +
          '<circle cx="60" cy="60" r="9" fill="#ee82ee" />' +
          '</svg>'
      };
      compare(circleBs, circleSvg, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae_n).toBeLessThan(MAE_N_PASS_THRESHOLD);
      }));
    });

    it('compares bikshed movie and svg (using relToAbs)', function() {
      var relToAbsBs = {
        content: function(stage) {
          var s = new Path('M27.751,17.887C27.805,17.453,27.832,17.011,27.832,16.563C27.832,14.818999999999999,27.419,13.169999999999998,26.686,11.709C27.819,8.824,27.841,6.34,26.485,4.9319999999999995C24.729,3.1099999999999994,21.094,3.526,17.052,5.653C16.983,5.651999999999999,16.913999999999998,5.6499999999999995,16.846,5.6499999999999995C10.777000000000001,5.6499999999999995,5.8580000000000005,10.538,5.8580000000000005,16.567C5.8580000000000005,16.75,5.863,16.921,5.872000000000001,17.096C3.1840000000000006,21.167,2.3810000000000007,25.063,4.184000000000001,26.933999999999997C5.741000000000001,28.546999999999997,8.875,28.278,12.384,26.541999999999998C13.747,27.145999999999997,15.257000000000001,27.479999999999997,16.846,27.479999999999997C21.639,27.479999999999997,25.713,24.430999999999997,27.215,20.180999999999997H21.26C20.446,21.663999999999998,18.822000000000003,22.685,16.953000000000003,22.685C14.265000000000002,22.685,12.086000000000002,20.581,12.086000000000002,17.997C12.086000000000002,17.961,12.088000000000003,17.926,12.089000000000002,17.891H27.751000000000005V17.887ZM26.337,6.099C27.24,7.0360000000000005,27.143,8.783000000000001,26.25,10.917C24.98,8.834,23.029,7.207,20.704,6.341C23.244,5.217,25.324,5.047,26.337,6.099ZM16.917,10.372C19.439,10.372,21.502000000000002,12.363,21.665000000000003,14.881H12.169000000000002C12.333,12.363,14.396,10.372,16.917,10.372ZM5.687,26.501C4.5840000000000005,25.355,4.9750000000000005,22.999000000000002,6.486000000000001,20.203000000000003C7.393000000000001,22.749000000000002,9.222000000000001,24.861000000000004,11.576,26.141000000000002C8.92,27.368,6.733,27.587,5.687,26.501Z');
          s.segments(Path.toAbsolute(s.segments()));

          stage.addChild(s.attr({
            fillColor: '#00ff00',
            strokeColor: 0x00000000
          }));
        },
        delay: 2000
      };
      var relToAbsSvg = {
        content: '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="120" height="120" viewBox="-0.5 -0.5 120 120">' +
          '<path d="M27.751,17.887C27.805,17.453,27.832,17.011,27.832,16.563C27.832,14.818999999999999,27.419,13.169999999999998,26.686,11.709C27.819,8.824,27.841,6.34,26.485,4.9319999999999995C24.729,3.1099999999999994,21.094,3.526,17.052,5.653C16.983,5.651999999999999,16.913999999999998,5.6499999999999995,16.846,5.6499999999999995C10.777000000000001,5.6499999999999995,5.8580000000000005,10.538,5.8580000000000005,16.567C5.8580000000000005,16.75,5.863,16.921,5.872000000000001,17.096C3.1840000000000006,21.167,2.3810000000000007,25.063,4.184000000000001,26.933999999999997C5.741000000000001,28.546999999999997,8.875,28.278,12.384,26.541999999999998C13.747,27.145999999999997,15.257000000000001,27.479999999999997,16.846,27.479999999999997C21.639,27.479999999999997,25.713,24.430999999999997,27.215,20.180999999999997H21.26C20.446,21.663999999999998,18.822000000000003,22.685,16.953000000000003,22.685C14.265000000000002,22.685,12.086000000000002,20.581,12.086000000000002,17.997C12.086000000000002,17.961,12.088000000000003,17.926,12.089000000000002,17.891H27.751000000000005V17.887ZM26.337,6.099C27.24,7.0360000000000005,27.143,8.783000000000001,26.25,10.917C24.98,8.834,23.029,7.207,20.704,6.341C23.244,5.217,25.324,5.047,26.337,6.099ZM16.917,10.372C19.439,10.372,21.502000000000002,12.363,21.665000000000003,14.881H12.169000000000002C12.333,12.363,14.396,10.372,16.917,10.372ZM5.687,26.501C4.5840000000000005,25.355,4.9750000000000005,22.999000000000002,6.486000000000001,20.203000000000003C7.393000000000001,22.749000000000002,9.222000000000001,24.861000000000004,11.576,26.141000000000002C8.92,27.368,6.733,27.587,5.687,26.501Z" fill="#00ff00" />' +
          '</svg>'
      };
      compare(relToAbsBs, relToAbsSvg, {
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.mae_n).toBeLessThan(MAE_N_PASS_THRESHOLD);
      }));
    });

  });
});
