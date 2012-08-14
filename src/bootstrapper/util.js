define([
  '../version'
], function(version) {
  'use strict';

  function reEscape(string) {
    return string.replace(/[\\^$*+?.()|{}[\]]/g, '\\$1');
  }

  function filter(sequence, callback, context) {
    var element, filtered = [];
    for (var i = 0, length = sequence.length; i < length; i += 1) {
      element = sequence[i];
      if (callback.call(context, element, i, sequence)) {
        filtered.push(element);
      }
    }

    return filtered;
  }

  var reVersion = RegExp('\\b' + reEscape(version) + '\\b');
  var reTest = RegExp.prototype.test;

  return {
    /**
     * Chooses a runner url from a list of candidate filenames.
     *
     * @private
     * @param {Array} filenames All filenames to choose from.
     * @param {RegExp} [additionalCheck] An additional regular expression to
     *    test the filenames with.
     * @return {*}
     */
    chooseRunnerUrl: function(filenames, additionalCheck) {
      var f = filenames;
      filenames = filter(filenames, reTest, /(?:^|\/)bonsai.*\.js(?:$|\?|#)/i);
      var filenamesHavingCheck = 0, filenamesHavingVersionAndCheck = 0; // 0 to be subscriptable
      var filenamesHavingVersion = filter(filenames, reTest, reVersion);

      if (additionalCheck) {
        filenamesHavingCheck = filter(filenames, reTest, additionalCheck);
        filenamesHavingVersionAndCheck =
          filter(filenamesHavingVersion, reTest, additionalCheck);
      }

      return filenamesHavingVersionAndCheck[0] || filenamesHavingCheck[0] ||
        filenamesHavingVersion[0] || filenames[0];
    }
  }
});
