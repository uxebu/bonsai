define([], function() {
  'use strict';

  function DisplayElement(dom, parentGroup, parentLayer) {
    this.dom = this.appendee = dom;
    this.parentDisplayGroup = parentGroup;
    this.parentDisplayLayer = parentLayer;
  }

  return DisplayElement;

});