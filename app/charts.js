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

    var filterOutEmpty = function(d) { return Math.abs(d.value)>1e-6 };
    var filterOutEmptyTotal = function(d) { return Math.abs(d.value.total)>1e-6 };

    legalDim = ndxLinks.dimension(function(d) {return +d.source});
    legalDim2 = ndxLinks.dimension(function(d) {return +d.source});
    legalDim3 = ndxLinks.dimension(function(d) {return +d.source});
    mediaDim = ndxLinks.dimension(function(d) {return +d.target});
    mediaDim2 = ndxLinks.dimension(function(d) {return +d.target});
    lawsDim = ndxLinks.dimension(function(d) {return +d.law;});
    timeDim = ndxLinks.dimension(function(d) {return +d.year*10+d.quarter;})
    spendDim = ndxLinks.dimension(function(d) {return +d.euro;})
    
    spendPerTime = remove_empty_bins(timeDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    spendPerLaw = remove_empty_bins(lawsDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    
    spendGroup = remove_empty_bins(spendDim.group(function(d) { return Math.floor(d/binwidth); }),filterOutEmpty);

    groupedSpendDim = remove_empty_bins(spendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
    groupedLegalDim = remove_empty_bins(legalDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
    groupedMediaDim = remove_empty_bins(mediaDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

    require('filterCharts');
    //require('treeMaps');
    //require('chordChart');
    require('tables');

    dc.renderAll();
    dc.tooltipMixin(timeBarChart);
    dc.tooltipMixin(lawsBarChart);

    $('#dataLoading').hide();
    $("#my-charts").show();
    $('#legalSearchReset').hide();
    $('#mediaSearchReset').hide();

    $("#legalSearch").on('change', function () {
      textFilter(legalDim2, this.value, legalTable);
    })

    $("#legalSearchForm").submit(function () {
      textFilter(legalDim2, $("#legalSearch").val(), legalTable);
      return false;
    });

    $('#legalSearch').on('change' , function() {
      if(this.value != '')
      {
        $('#legalSearchReset').show();
      }
      else
      {
        $('#legalSearchReset').hide();
      }
    }); 

    $("#mediaSearch").on('change', function () {
      textFilter(mediaDim2, this.value, mediaTable);  
    });

    $("#mediaSearchForm").submit(function () {
      textFilter(mediaDim2, $("#mediaSearch").val(), mediaTable);
      return false;
    });

    $('#mediaSearch').on('change' , function() {
      if( this.value != ''){
        $('#mediaSearchReset').show(); 
      }
      else{
        $('#mediaSearchReset').hide();
      }
    });    

    $(window).on('resize', function(){
      rescaleAll();
      updateAll();
    }); 
  }
}