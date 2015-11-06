"use strict";

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @global
 * @type {string}
 * @memberof force
 */
var sourceFileName = "data/data.csv";

var yearsChart;
var quarterChart;
var lawsChart;

var App = {
  init: function init() {
    require('charts').init(sourceFileName);
  }
};



module.exports = App;
