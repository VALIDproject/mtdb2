"use strict";

var tableRank = function (p) { return "source"; }

var all = ndxLinks.groupAll();

legalCount
  .dimension(groupedLegalDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' <span id=\'legalSearchReset\'>| <a href=\"javascript:resetSearchBox(\$(\'#legalSearch\'),\'legal\');\">reset</a></span> | <a href=\'javascript:combineLegalData();\'>Combine data</a> | <a href=\'javascript:deleteData(legalDim);\'>Remove data</a>'
  });

mediaCount
  .dimension(groupedMediaDim)
  .group(all)
  .html({
    some: '<strong>%total-count</strong> entries' +
        ' <span id=\'mediaSearchReset\'>| <a href=\"javascript:resetSearchBox(\$(\'#mediaSearch\'),\'media\');\">reset</a></span> | <a href=\'javascript:combineMediaData();\'>Combine data</a> | <a href=\'javascript:deleteData(mediaDim);\'>Remove data</a>'
  });

legalTable
  .dimension(groupedLegalDim)
  .group(tableRank)
  .sortBy(tableSorting[legalTableSorting])
  .order(legalTableOrdering[legalTableSorting]) 
  .showGroups(false)
  .size(Infinity)
  .columns([
    function(d){ return nodes[d.key]; },
    function(d){ return d.value.count; },
    function(d){ return formatEuro(d.value.total);}
    ])
  .on("renderlet.d", function(table){

    var x = d3.scale.linear()
          .domain([0, d3.max(groupedLegalDim.all(), function(d) { return d.value.total; })])
          .range(["0%", "100%"]);


    table.selectAll('td._0').classed("text-left", true);
    table.selectAll('td._1').classed("text-right", true);    
    table.selectAll('td._2')
      .classed("text-right", true)
      .append("div")
        .attr("class", "inlinebar")
        .style("width", "0%")
        .transition()
        .duration(1000)
          .style("width", function(d) { 
            return x(Math.abs(d.value.total));
          });

    table.selectAll('.dc-table-row')
      .classed("dc-table-row-filtered", function(d) {
        return  legalTableFilter.indexOf(d.key) > -1 ? true : false;
      })    
      .on("click", function (d){
        var filterIndex = legalTableFilter.indexOf(d.key);
        if(filterIndex > -1) {
          if(legalTableFilter.length > 1) {
            legalTableFilter.pop(filterIndex);
            legalDim.filterFunction(function(d){
              return legalTableFilter.indexOf(d) > -1;
            })
          }
          else{
            legalDim.filterAll();
            legalTableFilter = new Array();
          } 
        }
        else {
          legalTableFilter.push(d.key);
          legalDim.filterFunction(function(d){
            return legalTableFilter.indexOf(d) > -1;
          });
        }
        updateAll();
      })
      .on("mouseover", function (d){
        if(legalTableFilter.length == 0) {
          legalDim.filter(d.key);
          mediaTable.redraw();
          mediaCount.redraw();
        }
      })
      .on("mouseout", function (){
        if(legalTableFilter.length == 0) {
          legalDim.filterAll();
          mediaTable.redraw();
          mediaCount.redraw();
        }
      });
  });

mediaTable
  .dimension(groupedMediaDim)
  .group(tableRank)
  .showGroups(false)
  .sortBy(tableSorting[mediaTableSorting])
  .order(mediaTableOrdering[mediaTableSorting])  
  .size(Infinity)
  .columns([
    function(d){ return nodes[d.key]; },
    function(d){ return d.value.count;},
    function(d){ return formatEuro(d.value.total);}
    ])
  .on("renderlet.d", function(table){
    var x = d3.scale.linear()
          .domain([0, d3.max(groupedMediaDim.all(), function(d) { return d.value.total; })])
          .range(["0%", "100%"]);    

    table.selectAll('td._0').classed("text-left", true);
    table.selectAll('td._1').classed("text-right", true);
    table.selectAll('td._2')
      .classed("text-right", true)
      .append("div")
        .attr("class", "inlinebar")
        .style("width", "0%")
        .transition()
        .duration(1000)
          .style("width", function(d) { 
            return x(Math.abs(d.value.total));
          });
    table.selectAll('.dc-table-row')
      .classed("dc-table-row-filtered", function(d) {
        return mediaTableFilter.indexOf(d.key) > -1 ? true : false;
      })
      .on("click", function (d){
        var filterIndex = mediaTableFilter.indexOf(d.key);
        if(filterIndex > -1) {
          if(mediaTableFilter.length > 1) {
            mediaTableFilter.pop(filterIndex);
            mediaDim.filterFunction(function(d){
              return mediaTableFilter.indexOf(d) > -1;
            })
          }
          else{
            mediaDim.filterAll();
            mediaTableFilter = new Array();
          } 
        }
        else {
          mediaTableFilter.push(d.key);
          mediaDim.filterFunction(function(d){
            return mediaTableFilter.indexOf(d) > -1;
          });
        }
        updateAll();
      })
      .on("mouseover", function (d){
        if(mediaTableFilter.length == 0) {
          mediaDim.filter(d.key);
          legalTable.redraw();
          legalCount.redraw();
        }
      })
      .on("mouseout", function (){
       if(mediaTableFilter.length == 0) {
          mediaDim.filterAll();
          legalTable.redraw();
          legalCount.redraw();
        }
      });    
  });  