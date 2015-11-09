"use strict";

var legalDim = ndxLinks.dimension(function(d) {return +d.source});
var mediaDim = ndxLinks.dimension(function(d) {return +d.target});

var addTotal = function(p,v) {
  ++p.count;
  p.total += +v.euro;
  return p;  
};

var removeTotal = function (p, v) {
  --p.count;
  p.total -= +v.euro;
  return p;
};

var initTotal = function(){return {count: 0, total: 0};}

function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
                return d.value.count != 0;
            });
        },
        top:function (x) {
            return source_group.top(x).filter(function(d) {
                return d.value.count != 0;
            });
        },
        size:function () { 
            var s = source_group.all().filter(function(d) {
                return d.value.count != 0;
            });
            return s.length;
        }
    };
}



var groupedLegalDim = remove_empty_bins(legalDim.group().reduce(addTotal,removeTotal,initTotal));
var groupedMediaDim = remove_empty_bins(mediaDim.group().reduce(addTotal,removeTotal,initTotal));

var tableRank = function (p) { return "source"; }

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