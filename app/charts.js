exports.init = function(datafile) {

  // require the tree map module for dc.js
  //require('dcTreeMapChart');
  require('dc-tooltip-mixin');

  $("#my-charts").hide(); //hide the charts. They are displayed when the data finishes loading

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  timeBarChart = dc.barChart('#time-bar-chart');
  lawsBarChart = dc.barChart('#laws-bar-chart');
  expensesBarChart = dc.barChart('#expenses-bar-chart');

  legalCount = dc.dataCount('#data-count-legal');
  mediaCount = dc.dataCount('#data-count-media');

  legalTable = dc.dataTable('#legal-table');
  mediaTable = dc.dataTable("#media-table");
  
  //legalTreeMap = dc.treemapChart('#legal-tree-map');
  //mediaTreeMap = dc.treemapChart('#media-tree-map');

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    ndxLinks = crossfilter(links);
    binwidth = 1000;

    var filterOutEmpty = function(d) { return Math.abs(d.value)>1e-3 };
    var filterOutEmptyTotal = function(d) { return Math.abs(d.value.total)>1e-3 };

    legalDim = ndxLinks.dimension(function(d) {return +d.source});
    legalDim2 = ndxLinks.dimension(function(d) {return +d.source});
    mediaDim = ndxLinks.dimension(function(d) {return +d.target});
    mediaDim2 = ndxLinks.dimension(function(d) {return +d.target});
    lawsDim = ndxLinks.dimension(function(d) {return +d.law;});
    timeDim = ndxLinks.dimension(function(d) {return +d.year*10+d.quarter;})
    spendDim = ndxLinks.dimension(function(d) {return Math.floor(+d.euro/binwidth);})
    
    spendPerTime = remove_empty_bins(timeDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    spendPerLaw = remove_empty_bins(lawsDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    spendGroup = remove_empty_bins(spendDim.group().reduceCount(function(d) { return +d.euro; }),filterOutEmpty);

    groupedLegalDim = remove_empty_bins(legalDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
    groupedMediaDim = remove_empty_bins(mediaDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

    require('filterCharts');
    //require('treeMaps');
    require('chordChart');
    require('tables');

    dc.renderAll();
    dc.tooltipMixin(timeBarChart);
    dc.tooltipMixin(lawsBarChart);

    $('#dataLoading').hide();
    $("#my-charts").show();
    $('#legalSearchReset').hide();
    $('#mediaSearchReset').hide();

    $("#legalSearchForm").submit(function () {
      textFilter(legalDim2, $("#legalSearch").val(), legalTable);
      return false;
    });

    $("#mediaSearchForm").submit(function () {
      textFilter(mediaDim2, $("#mediaSearch").val(), mediaTable);
      return false;
    });

    function legalTableOnClickUpdate(table, orderId) {
      var glyph = orderId.children().first();
      glyph.removeClass();
      glyph.addClass( "glyphicon " + legalTableSortingStatus[legalTableSorting] );
      table
        .order(legalTableOrdering[legalTableSorting])
        .sortBy(tableSorting[legalTableSorting])
        .redraw();      
    }

    function mediaTableOnClickUpdate(table, orderId) {
      var glyph = orderId.children().first();
      glyph.removeClass();
      glyph.addClass( "glyphicon " + mediaTableSortingStatus[mediaTableSorting] );
      table
        .order(mediaTableOrdering[mediaTableSorting])
        .sortBy(tableSorting[mediaTableSorting])
        .redraw();      
    }    

    $('#legalAlphabetOrder').click( function () {
      legalTableSorting = "alphabeth";
      if(legalTableOrdering[legalTableSorting] == d3.descending)
      {
        legalTableOrdering[legalTableSorting] = d3.ascending;
        legalTableSortingStatus[legalTableSorting] = ordinalAscendingGlyph;
      }
      else
      {
        legalTableOrdering[legalTableSorting] = d3.descending;
        legalTableSortingStatus[legalTableSorting] = ordinalDescendingGlyph;          
      }
      legalTableOnClickUpdate(legalTable,$(this))
    });

    $('#legalRelationOrder').click( function () {
      legalTableSorting = "relation";
      if(legalTableOrdering[legalTableSorting] == d3.descending)
      {
        legalTableOrdering[legalTableSorting] = d3.ascending;
        legalTableSortingStatus[legalTableSorting] = numericAscendingGlyph;
      }
      else
      {
        legalTableOrdering[legalTableSorting] = d3.descending;
        legalTableSortingStatus[legalTableSorting] = numericDescendingGlyph;          
      }      
      legalTableOnClickUpdate(legalTable,$(this))
    });

    $('#legalSumOrder').click( function () {
      legalTableSorting = "sum";
      if(legalTableOrdering[legalTableSorting] == d3.descending)
      {
        legalTableOrdering[legalTableSorting] = d3.ascending;
        legalTableSortingStatus[legalTableSorting] = numericAscendingGlyph;
      }
      else
      {
        legalTableOrdering[legalTableSorting] = d3.descending;
        legalTableSortingStatus[legalTableSorting] = numericDescendingGlyph;          
      }      
      legalTableOnClickUpdate(legalTable,$(this))
    });

    $('#mediaAlphabetOrder').click( function () {
      mediaTableSorting = "alphabeth";
      if(mediaTableOrdering[mediaTableSorting] == d3.descending)
      {
        mediaTableOrdering[mediaTableSorting] = d3.ascending;
        mediaTableSortingStatus[mediaTableSorting] = ordinalAscendingGlyph;
      }
      else
      {
        mediaTableOrdering[mediaTableSorting] = d3.descending;
        mediaTableSortingStatus[mediaTableSorting] = ordinalDescendingGlyph;          
      }
      mediaTableOnClickUpdate(mediaTable,$(this))
    });

    $('#mediaRelationOrder').click( function () {
      mediaTableSorting = "relation";
      if(mediaTableOrdering[mediaTableSorting] == d3.descending)
      {
        mediaTableOrdering[mediaTableSorting] = d3.ascending;
        mediaTableSortingStatus[mediaTableSorting] = numericAscendingGlyph;
      }
      else
      {
        mediaTableOrdering[mediaTableSorting] = d3.descending;
        mediaTableSortingStatus[mediaTableSorting] = numericDescendingGlyph;          
      }      
      mediaTableOnClickUpdate(mediaTable,$(this))  
    });

    $('#mediaSumOrder').click( function () {
      mediaTableSorting = "sum";
      if(mediaTableOrdering[mediaTableSorting] == d3.descending)
      {
        mediaTableOrdering[mediaTableSorting] = d3.ascending;
        mediaTableSortingStatus[mediaTableSorting] = numericAscendingGlyph;
      }
      else
      {
        mediaTableOrdering[mediaTableSorting] = d3.descending;
        mediaTableSortingStatus[mediaTableSorting] = numericDescendingGlyph;          
      }      
      mediaTableOnClickUpdate(mediaTable,$(this))
    });    

    $(window).on('resize', function(){
      rescaleAll();
      updateAll();
    }); 
  }
}