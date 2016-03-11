exports.init = function(datafile) {

  $("#my-charts").hide(); //hide the charts. They are displayed when the data finishes loading

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  timeBarChart = dc.barChart('#time-bar-chart');
  lawsBarChart = dc.barChart('#laws-bar-chart');
  expensesBarChart = dc.barChart('#expenses-bar-chart');
  trendBarChart = dc.barChart('#trend-bar-chart');

  legalCount = dc.dataCount('#data-count-legal');
  mediaCount = dc.dataCount('#data-count-media');

  legalTable = dc.dataTable('#legal-table');
  mediaTable = dc.dataTable("#media-table");

  legalTablePaging = new TablePaging(legalTable,0,10,"#legal-paging");
  mediaTablePaging = new TablePaging(mediaTable,0,10,"#media-paging");

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    ndxLinks = crossfilter(links);
    binwidth = 1000;
    trendBinwidth = 20;

    var filterOutEmpty = function(d) { return Math.abs(d.value)>1e-3 };
    var filterOutEmptyTotal = function(d) { 
      return Math.abs(d.value.total)>1e-3;
    };

    legalDim = ndxLinks.dimension(function(d) {return +d.source});
    legalDim2 = ndxLinks.dimension(function(d) {return +d.source});
    mediaDim = ndxLinks.dimension(function(d) {return +d.target});
    mediaDim2 = ndxLinks.dimension(function(d) {return +d.target});
    lawsDim = ndxLinks.dimension(function(d) {return +d.law;});
    timeDim = ndxLinks.dimension(function(d) {return +d.year*10+d.quarter;})
    spendDim = ndxLinks.dimension(function(d) {return Math.floor(+d.euro/binwidth);})

    spendPerTime = removeEmptyBins(timeDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    spendPerLaw = removeEmptyBins(lawsDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
    //spendGroup = removeEmptyBins(spendDim.group().reduceCount(function(d) { return +d.euro; }),filterOutEmpty);
    spendGroup = removeEmptyBins(spendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
    //trendGroup = removeEmptyBins(trendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

    quarterNames = spendPerTime.all().map(function(d){return d.key});
    halfQuarter = quarterNames[Math.floor(quarterNames.length/2)];
    // initialize quarter selection to not selected
    quartalSelection = [];
    for (var i = quarterNames.length - 1; i >= 0; i--) {
      quartalSelection[i] = 0;
    }

    groupedLegalDim = removeEmptyBins(legalDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
    groupedMediaDim = removeEmptyBins(mediaDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

    sourceToValue = {};
    groupedLegalDim.all().forEach(function(v){sourceToValue[v.key] = v.value;});

    trendDim = ndxLinks.dimension(function(d) {return sourceToValue[+d.source].trend;});
    trendGroup = removeEmptyBins(trendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

    tagTooltip = $("#tag-tooltip");
    sparklineTooltip = d3.select("#sparkline-tooltip");
    filterTooltip = d3.select("#filter-tooltip");
    chordTooltip = d3.select("#chord-tooltip");

    require('filterCharts');
    require('chordChart');
    require('tables');

    dc.renderAll();

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

    function lastGlyphUpdate(table)
    {
      var lastglyph = $(table + " .sorted");
      lastglyph.removeClass("sorted");
    }

    function legalTableOnClickUpdate(table, orderId) {
      lastGlyphUpdate("#legal-table");
      var glyph = orderId.children().first();
      glyph.removeClass();
      glyph.addClass( "sorted glyphicon " + legalTableSortingStatus[legalTableSorting] );
      table
        .order(legalTableOrdering[legalTableSorting])
        .sortBy(tableSorting[legalTableSorting])
        .redraw();      
    }

    function mediaTableOnClickUpdate(table, orderId) {
      lastGlyphUpdate("#media-table");
      var glyph = orderId.children().first();
      glyph.removeClass();
      glyph.addClass( "sorted glyphicon " + mediaTableSortingStatus[mediaTableSorting] );
      table
        .order(mediaTableOrdering[mediaTableSorting])
        .sortBy(tableSorting[mediaTableSorting])
        .redraw();      
    }

    function changeOrderingState(legal, ordinal, orderId)
    {
      if(legal)
      {
        if(legalTableOrdering[legalTableSorting] == d3.descending)
            {
              legalTableOrdering[legalTableSorting] = d3.ascending;
              legalTableSortingStatus[legalTableSorting] = ordinal ? ordinalAscendingGlyph : numericAscendingGlyph;;
            }
            else
            {
              legalTableOrdering[legalTableSorting] = d3.descending;
              legalTableSortingStatus[legalTableSorting] = ordinal ? ordinalDescendingGlyph : numericDescendingGlyph;;          
            }      
            legalTableOnClickUpdate(legalTable,orderId)
      }
      else
      {
        if(mediaTableOrdering[mediaTableSorting] == d3.descending)
        {
          mediaTableOrdering[mediaTableSorting] = d3.ascending;
          mediaTableSortingStatus[mediaTableSorting] = ordinal ? ordinalAscendingGlyph : numericAscendingGlyph;
        }
        else
        {
          mediaTableOrdering[mediaTableSorting] = d3.descending;
          mediaTableSortingStatus[mediaTableSorting] = ordinal ? ordinalDescendingGlyph : numericDescendingGlyph;
        }
        mediaTableOnClickUpdate(mediaTable,orderId)
      }
    }

    $('#legalAlphabetOrder').click( function () {
      legalTableSorting = "alphabet";
      changeOrderingState(true,true,$(this));
    });    

    $('#legalRelationOrder').click( function () {
      legalTableSorting = "relation";
      changeOrderingState(true,false,$(this));
    });

    $('#legalSumOrder').click( function () {
      legalTableSorting = "sum";
      changeOrderingState(true,false,$(this));
    });

    $('#legalTrendOrder').click( function () {
      legalTableSorting = "trend";
      changeOrderingState(true,false,$(this));
    });

    $('#mediaAlphabetOrder').click( function () {
      mediaTableSorting = "alphabet";
      changeOrderingState(false,true,$(this));
    });

    $('#mediaRelationOrder').click( function () {
      mediaTableSorting = "relation";
      changeOrderingState(false,false,$(this));
    });

    $('#mediaSumOrder').click( function () {
      mediaTableSorting = "sum";
      changeOrderingState(false,false,$(this));
    });

    $('#mediaTrendOrder').click( function () {
      mediaTableSorting = "trend";
      changeOrderingState(false,false,$(this));
    });        

    $(window).on('resize', function(){
      rescaleAll();
      updateAll();
    }); 
  }
}