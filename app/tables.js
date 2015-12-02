"use strict";

var tableRank = function (p) { return "source"; }

var all = ndxLinks.groupAll();

legalCount
  .dimension(groupedLegalDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' <span id=\'legalSearchReset\'>| <a href=\"javascript:resetSearchBox(\$(\'#legalSearch\'));\">reset</a></span> | <a href=\'javascript:combineLegalData();\'>Combine data</a> | <a href=\'javascript:deleteData(legalDim);\'>Remove data</a>'
  });

mediaCount
  .dimension(groupedMediaDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' <span id=\'mediaSearchReset\'>| <a href=\"javascript:resetSearchBox(\$(\'#mediaSearch\'));updateAll();\">reset</a></span> | <a href=\'javascript:combineMediaData();\'>Combine data</a> | <a href=\'javascript:deleteData(mediaDim);\'>Remove data</a>'
  });

legalTable
  .dimension(groupedLegalDim)
  .group(tableRank)
  .sortBy(tableSorting[legalTableSorting])
  .order(legalTableOrdering[legalTableSorting])  
  .showGroups(false)
  .size(Infinity)
  .columns([
    {
      format: function(d){ return nodes[d.key]; }
    },
    {
      format: function(d){ return d.value.count; }
    },
    {
      format: function(d){ return formatEuro(d.value.total);}
    }
    ])
  .on('renderlet.t', function (table) {
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
        table
          .sortBy(tableSorting[legalTableSorting])
          .order(legalTableOrdering[legalTableSorting])
          .redraw();
      });

    $('#legalRelationOrder').click( function () {
      legalTableSorting = "relation";
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
      table
        .sortBy(tableSorting[legalTableSorting])
        .order(legalTableOrdering[legalTableSorting])
        .redraw();  
    });

    $('#legalSumOrder').click( function () {
      legalTableSorting = "sum";
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
      table
        .sortBy(tableSorting[legalTableSorting])
        .order(legalTableOrdering[legalTableSorting])
        .redraw();
    });  
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAll();
  });

mediaTable
  .dimension(groupedMediaDim)
  .group(tableRank)
  .showGroups(false)
  .sortBy(function (d) { return d.value.total;})
  .order(d3.descending)  
  .size(Infinity)
  .columns([
    {
      label: 'Media', 
      format: function(d){ 
        return nodes[d.key];
      }
    },
    {
      label: 'Relationen', 
      format: function(d){ return d.value.count;}
    },
    {
      label: 'Summe', 
      format: function(d){ return formatEuro(d.value.total);}
    }
    ])
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAll();
  });