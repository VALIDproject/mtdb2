"use strict";

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @global
 * @type {string}
 * @memberof force
 */
var sourceFileName = "data/data20144.csv";

var App = {
  init: function init() {
    require('charts').init(sourceFileName);
    //dc.renderAll();
  }
};

module.exports = App;
