/**
 * Creates the listeners for different objects of the dashboard.
 */
exports.create = function() {

  tagTooltip = $("#tag-tooltip");
  sparklineTooltip = d3.select("#sparkline-tooltip");
  filterTooltip = d3.select("#filter-tooltip");
  chordTooltip = d3.select("#chord-tooltip");

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
};