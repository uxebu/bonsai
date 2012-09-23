define([
  'bonsai/asset/asset_request',
  'bonsai/asset/asset_resource'
], function(AssetRequest, AssetResource) {

  var url = 'http://simpleurl.org/file.txt';
  var falsyParams = [undefined, null, 0, ""];

  describe('AssetRequest', function() {

    it('throws an error when called w/o parameters.', function() {
      expect(function() {
        new AssetRequest();
      }).toThrow();
    });

    it('should return an AssetRequest instance', function() {
      expect(new AssetRequest(url)).toBeInstanceOf(AssetRequest);
    });

    it('has a resources property', function() {
      var resource = new AssetRequest(url);
      expect(resource.resources).toBeInstanceOf(Array);
      expect(resource.resources[0]).toBeInstanceOf(AssetResource);
    });

    it('has a loadLevel property', function() {
      var resource = new AssetRequest(url);
      expect(resource).toHaveProperties('loadLevel');
      expect(resource.loadLevel).toBe(null /* default */);
    });

    describe('1) parameter is a simple url (string)', function() {

      it('can handle a valid url', function() {
        var resource = new AssetRequest(url);

        expect(resource).toEqual({
          resources: [{src: url, type: 'txt'}],
          loadLevel: null
        });
      });

      it('throws an error when parameter is an empty string / null / undefined / 0 / [] / {}', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect(function() {
            new AssetResource(falsyParams[i]);
          }).toThrow();
        }
      });

    });

    describe('2) parameter is an array, like [{src:"", type:""}]', function() {

      it('throws an error when ´src´ is an empty string / null / undefined / 0 / [] / {}', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect(function() {
            new AssetRequest([{src: falsyParams[i]}]);
          }).toThrow();
        }
      });

      it('is valid when ´src´ is a simple url', function() {
        expect( new AssetRequest([{'src': url}]) ).toEqual({
          resources: [{'src': url, 'type': 'txt'}],
          loadLevel: null
        });
      });

      it('is valid even when ´type´ is invalid', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect( new AssetRequest([{src: url, type:falsyParams[i]}]) ).toEqual({
            resources: [{'src': url, 'type': 'txt'}],
            loadLevel: null
          });
        };
      });

    });

    describe('3) parameter is an object, like {resources:[], loadLevel:""}', function() {

      it('throws an error when ´resources´ is an empty string / null / undefined / 0 / [] / {}', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect(function() {
            new AssetRequest({resources: falsyParams[i]});
          }).toThrow();
        }
      });

      it('throws an error when ´resources.src´ is an empty string / null / undefined / 0 / [] / {}', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect(function() {
            new AssetRequest({resources: [{'src': falsyParams[i]}]});
          }).toThrow();
        }
      });


      window.AssetRequest = AssetRequest;

      it('is valid when ´resources.src´ is string (length>0)', function() {
        expect( new AssetRequest({
          resources: [{src: url}]
        })).toEqual({
          resources: [{'src': url, 'type': 'txt'}],
          loadLevel: null
        });
      });

      it('is valid when ´resources.loadLevel´ is a string', function() {
        expect( new AssetRequest({
          resources: [{'src': url}],
          loadLevel: 'test'
        })).toEqual({
          resources: [{'src' : url, 'type': 'txt'}],
          loadLevel: 'test'
        });
      });

      it('is valid even when ´resources.loadLevel´ is not valid', function() {
        for (var i = 0; i < falsyParams.length; i++) {
          expect( new AssetRequest({
            resources: [{'src': url}],
            loadLevel: falsyParams[i]
          })).toEqual({
            resources: [{'src': url, 'type': 'txt'}],
            loadLevel: null
          });
        };
      });

    });

  });

});
