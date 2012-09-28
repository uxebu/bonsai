require([
  'bonsai/asset/audio_handler',
  'bonsai/asset/asset_request'
], function(AudioHandler, AssetRequest) {

  function makeAssetRequest(suffix) {
    return new AssetRequest('somefile.' + suffix);
  }

  describe('AudioAssetHandler', function() {

    it('Accepts valid arg signatures', function() {
      new AudioHandler(makeAssetRequest('mp3'), 1);
      new AudioHandler(makeAssetRequest('ogg'), 1, 30000);
    });

    describe('AudioHandler.getPlayableMimeType', function() {
      it('is a function', function() {
        expect(typeof AudioHandler.getPlayableMimeType).toBe('function');
      });
      /*it('mimetype for unknown is ""', function() {
        expect(AudioHandler.playableMimeType('unknown')).toBe('');
      });*/
    });

  });

});
