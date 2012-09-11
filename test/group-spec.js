require([
  'bonsai/runner/group',
  'bonsai/runner/display_object',
  'bonsai/runner/display_list',
  'bonsai/runner/stage',
  'bonsai/tools',
  './displaylist-owner-common',
  './fake_messageproxy',
  './runner.js'
], function(Group, DisplayObject, DisplayList, Stage, tools, testDisplayList, fakeMessageproxy) {

  describe('Group', function() {

    testDisplayList(function(displayList) {
      return new Group(displayList);
    });

  });
});
