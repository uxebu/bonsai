require([
  'bonsai/asset/audio_handler',
  'bonsai/asset/asset_request',
  './runner.js'
], function(AudioHandler, AssetRequest) {

  function makeAssetRequest(suffix) {
    return new AssetRequest('somefile.' + suffix);
  }

  describe('AudioAssetHandler', function() {

    it('Accepts valid arg signatures', function() {
      new AudioHandler(makeAssetRequest('mp3'), 1);
      new AudioHandler(makeAssetRequest('ogg'), 1, 30000);
    });

    describe('AudioHandler.playableMimeType', function() {
      it('detects mp3 mimeType', function() {
        expect(AudioHandler.playableMimeType('mp3')).toContain('audio/');
      });
      it('mimetype for unknown is ""', function() {
        expect(AudioHandler.playableMimeType('unknown')).toBe('');
      });
    });

  });

});
