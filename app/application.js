"use strict";

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @global
 * @type {string}
 */
var sourceFileName = "data/data.csv";

/**
 * All final, unchangeable links (edges) between the nodes in the graph as D3 objects.
 * 
 * @type {array}
 * @alias links
 * @property {number} links.source the legal entity
 * @property {number} links.target the media owner
 * @property {number} links.quarter in the transaction has happened.
 * @property {number} links.year in the transaction has happened.
 * @property {number} links.law acted upon or paragraph, respectively. (§2,§4,§31)
 * @property {number} links.euro amount of money.
 */
var links;

/**
 * All final, unchangeable nodes in this graph.
 * 
 * @type {array}
 * @alias nodes
 * @property {string} the name of the id. this can be a legal entity or a media owner
 */
var nodes;

var timeBarChart, lawsBarChart, expensesBarChart;
var legalCount, mediaCount;
var legalTable, mediaTable;
//var legalTreeMap, mediaTreeMap;

var ndxLinks;

var legalDim, legalDim2, legalDim3, mediaDim, mediaDim2, lawsDim, timeDim, spendDim;
var groupedLegalDim, groupedMediaDim, groupedList;
var spendPerLegal, spendPerMedia, spendPerTime, spendPerLaw;
var binwidth;

var textFilter;
var resetSearchBox;

var drawChords;

var updateAll;
var rescaleAll;

var deleteData;

var combineLegalData;
var combineMediaData;

var locale;
var formatEuro;
var formatBigEuro;
var formatGuV;

var addTotal, removeTotal, initTotal;

var remove_empty_bins;

var numericAscendingGlyph;
var numericDescendingGlyph;
var ordinalAscendingGlyph;
var ordinalDescendingGlyph;

var legalTableSortingStatus;
var mediaTableSortingStatus;

var tableSorting;
var legalTableSorting;
var legalTableOrdering;
var mediaTableSorting;
var mediaTableOrdering;

require('globalFunctions');

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
