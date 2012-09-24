define(function() {
  jasmine.getEnv().defaultTimeoutInterval = 10000;
  describe('Bonsai build', function(){
    it('should generate a shape which looks like a reference image', function() {
      var bsVariant = {
        content: function() {
          stage.addChild(Path.rect(0.5, 0.5, 100, 100).attr({fillColor:'red'}));
        },
        delay: 2000
      };

      var imageVariant = {
        content: 'asset/test_red_square.png',
        delay: 100
      };
      compare(bsVariant, imageVariant, {
        x: -1,
        y: -1,
        width: 120,
        height: 120
      }, waitForAsync(function(result) {
        expect(result.ae).toBe(0);
      }));
    });
  });
});
