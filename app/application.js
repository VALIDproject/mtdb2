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
var legalCount;
var mediaCount;
var legalTable;
var mediaTable;
var ndxLinks;
var all;
var locale;
var formatEuro;
var legalNameDim;
var mediaNameDim;
var text_filter;

var App = {
  items: ['Home', 'About', 'Contact'],

  init: function init() {

    var nav = require('views/nav');
    var html = nav({ items: App.items });
    $('body').append(html);

    var content = require('views/charts');
    $('body').append(content);

    require('charts').init(sourceFileName);
  }
};

module.exports = App;
