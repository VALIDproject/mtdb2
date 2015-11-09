"use strict";

var tableRank = function (p) { return "source"; }

var all = ndxLinks.groupAll();

legalCount
  .dimension(groupedLegalDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
    all: 'All records selected. Please click on the graph to apply filters.'
  });

mediaCount
  .dimension(groupedMediaDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
    all: 'All records selected. Please click on the graph to apply filters.'
  });

legalTable
  .dimension(groupedLegalDim)
  .group(tableRank)
  .sortBy(function (d) { return d.value.total;})
  .order(d3.descending)  
  .showGroups(false)
  .size(Infinity)
  .columns([
    {
      label: 'Rechtsträger', 
      format: function(d){ 
        return nodes[d.key].name;
      }
    },
    {
      label: 'Anzahl an Relationen', 
      format: function(d){ return d.value.count;}
    },
    {
      label: 'Summe', 
      format: function(d){ return formatEuro(d.value.total);}
    }
    ])
  .on('renderlet', function (table) {
      table.selectAll('#legal-table').classed('info', true);
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
        return nodes[d.key].name;
      }
    },
    {
      label: 'Anzahl an Relationen', 
      format: function(d){ return d.value.count;}
    },
    {
      label: 'Summe', 
      format: function(d){ return formatEuro(d.value.total);}
    }
    ])
  .on('renderlet', function (table) {
      table.selectAll('#media-table').classed('info', true);
  });