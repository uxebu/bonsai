({ define: typeof define === 'function' ? define : function(A,F) { module.exports = F.apply(null, A.map(require)) } }).define([], function(){
  
  jasmine.Matchers.prototype.toBeBetween = function(a, b) {
    return this.actual < b && this.actual > a;
  };

  var jasmineEnv = jasmine.getEnv();
  var isNode = typeof module !== 'undefined' && module.exports;
  var http, fs, url;
  if(isNode) {
    fs = require('fs');
    http = require('http');
    url = require('url');
  }

  var config = {
    runCompareTests: true,
    compareServer: 'http://jenkins.ux:33334'
  };
  
  var async = function async(fn) {
    // Little wrapper for async tests
    jasmineEnv.currentSpec.queue.add({
      execute: function(next) {
        fn(next);
      }
    });
  };
  
  var waitForAsync = function waitForAsync(func) {
    var done = false;
    waitsFor(function() { return done; });
    return function() {
      done = true;
      if (func) func.apply(func, arguments);
    }
  };

  var getBinary = function getBinary(file) {
    var ret;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file, false);
    xhr.overrideMimeType('text/plain; charset=x-user-defined');
    xhr.send(null);
    if(xhr.status === 200) {
      ret = xhr.responseText;
    } else {
      throw new Error('xhr.status for ' + file + ' is ' + xhr.status);
    }
    return ret;
  };

  var getText = function getText(file) {
    var ret;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', file, false);
    xhr.send(null);
    if(xhr.status === 200) {
      ret = xhr.responseText;
    } else {
      throw new Error('xhr.status for ' + file + ' is ' + xhr.status);
    }
    return ret;
  };

  var sendToServer = function sendToServer(variant1, variant2, opts, expectCompare) {
    var basePath = '/create_compare';
    var handleResult = function handleResult(data) {
      data = JSON.parse(data);
      jasmineEnv.compareResults[jasmineEnv.currentSpec.id] = data;
      expectCompare(data);
    };
    var postData = JSON.stringify({
      variants: [
        prepareVariant(variant1),
        prepareVariant(variant2)
      ],
      width: opts.width,
      height: opts.height,
      top: opts.top,
      left: opts.left,
      delay: opts.delay
    });
    var retData = "";
    if(isNode) {
      var parsedUrl = url.parse(config.compareServer);
      var client = http.createClient(parsedUrl.port, parsedUrl.hostname);
      client.addListener('error', function(error){
        throw new Error(config.compareServer + basePath + ' was not reachable: ' + error.stack);
      });
      var request = client.request('POST', basePath, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData, 'utf8')
      });
      request.on('response', function(response) {
        response.on('data', function(chunk) {
          retData += chunk;
        });
        response.on('end', function() {
          handleResult(retData);
        });
      });
      request.write(postData);
      request.end();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', config.compareServer + basePath);
      xhr.onreadystatechange = function(response) {
        if(xhr.readyState != 4) return;
        if(xhr.status !== 200) {
          throw new Error('xhr.status for POSTing to ' + config.compareServer + basePath + ' was ' + xhr.status);
        }
        handleResult(xhr.response);
      };
      xhr.onerror = function(err) {
        throw new Error(config.compareServer + basePath + ' was not reachable');
      };
      xhr.send(postData);
    }
  };

  var base64Encode = function base64Encode(str) {
    var CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var out = '', i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
      c1 = str.charCodeAt(i++) & 0xff;
      if (i == len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt((c1 & 0x3) << 4);
        out += '==';
        break;
      }
      c2 = str.charCodeAt(i++);
      if (i == len) {
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3)<< 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt((c2 & 0xF) << 2);
        out += '=';
        break;
      }
      c3 = str.charCodeAt(i++);
      out += CHARS.charAt(c1 >> 2);
      out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
      out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
      out += CHARS.charAt(c3 & 0x3F);
    }
    return out;
  };

  jasmineEnv.compareResults = {};
  var prepareVariant = function prepareVariant(variant) {
    var canvas, ctx, image, match, xhr;
    var innerFuncMatch = /^[^{]*\{([\s\S]*)\}\s*$/;
    if(typeof(variant.content) === 'function') {
      variant.content = variant.content.toString().match(innerFuncMatch)[1];
    }
    if(! variant.type && variant.content) {
      // determine the type by content
      match = variant.content.match(/\.(png|jpg|gif|swf)$/);
      if(match) {
        variant.type = match[1];
        if(variant.type === 'swf') variant.type = 'flash';
        if(isNode) {
          variant.content = fs.readFileSync(variant.content, 'base64');
        } else {
          variant.content = base64Encode(getBinary(variant.content));
        }
      }
      if(variant.content.match(/\.(svg)$/)) {
        variant.type = 'svg';
        if(isNode) {
          variant.content = fs.readFileSync(variant.content);
        } else {
          variant.content = getText(variant.content);
        }
      }
      if(variant.content.indexOf('stage.') > -1) {
        variant.type = 'bonsai';
      }
      if(variant.content.indexOf('canvas.') > -1) {
        variant.type = 'canvas';
      }
      if(variant.content.match(/^(\<svg)/)) {
        variant.type = 'svg';
      }
    }
    return variant;
  };

  var compare = function compare(variant1, variant2, opts, expectCompare) {
    if(! config.runCompareTests) return true;
    var data;
    var xhr;
    opts = opts || {};
    sendToServer.call(this, variant1, variant2, opts, expectCompare);
  };

  return {
    async: async,
    compare: function(conf) {
      config = conf || config;
      return compare;
    },
    waitForAsync: waitForAsync
  };

});
