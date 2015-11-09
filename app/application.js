"use strict";

require('d3graph');

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @global
 * @type {string}
 * @memberof force
 */
var sourceFileName = "data/data.csv";

var yearsChart, quarterChart, lawsChart;
var legalCount, mediaCount;
var legalTable, mediaTable;

var ndxLinks;

var locale;
var formatEuro;
var legalNameDim, mediaNameDim, legalDim, mediaDim;
var groupedLegalDim, groupedMediaDim, groupedList;
var text_filter;

var App = {

  init: function init() {

    var nav = require('views/nav');
    $('body').prepend(nav);

	var content = require('views/charts');
    $('.starter-template').append(content);

    require('charts').init(sourceFileName);
  }
};

module.exports = App;
