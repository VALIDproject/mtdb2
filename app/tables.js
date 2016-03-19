"use strict";

/**
 * Initializes the tables and the functions for updating the tables
 */

var tableRank = function (p) { return "source"; }

var sparklineMouseover = function(d)
{
  var text = d3.select(this).attr("tooltip_title");
  sparklineTooltip.transition()  
    .duration(200)      
    .style("opacity", .9);      
    sparklineTooltip.html(text)  
      .style("left", (d3.event.x) + "px")     
      .style("top", (d3.event.y - 28) + "px");   
}

var hideSparklineTooltip = function()
{
  sparklineTooltip.transition()
    .duration(500)
    .style("opacity", 0);
}

var tableRenderlet = function(table,dim){
  var groupedDim;
  var tableFilter;
  var isLegalDim = dim == legalDim;
  if(isLegalDim)
  {
    groupedDim = groupedLegalDim;
    tableFilter = legalTableFilter;
  }
  else
  {
    groupedDim = groupedMediaDim;
    tableFilter = mediaTableFilter;
  }

  if(groupedDim.all().length == 0)
    return;

  var quarterSum = [];

  table.selectAll('td._1').each(function(d,i) {
    quarterSum[i] = {};
    for (var j = 0; j < quarterNames.length; j++) {
      quarterSum[i][quarterNames[j]] = 0;
    }
  });

  var xCount = d3.scale.linear()
    .domain([0, d3.max(groupedDim.all(), function(d) { return d.value.count; })])
    .range(["0%", "100%"]); 

 var countColumn = table.selectAll('td._2')
    .classed("text-right", true)
    .append("div")
      .classed("inlinebar",true)
      .style("width", "0%")
      .transition()
      .duration(1000)
        .style("width", function(d) { 
          return xCount(Math.abs(d.value.count));
        });

  var xTrend = d3.scale.linear()
      .domain([-1,1])
      .range(["-100%", "100%"]);

  var trendColumn = table.selectAll('td._3')
    .classed("percent text-center", true)
    .append("div")   
      .attr("class", function(d){
          return "inlinebar " + ((d.value.trend > 0) ? "positiv" : "negativ");
        })       
        .style("width", function(d) { 
          return xTrend(Math.abs(d.value.trend)/2);
        })
        .style("margin-left", function(d) {
          return d.value.trend < 0 ? 
            xTrend(0.5+d.value.trend/2) : "50%";
        });   

  var max = 0;
  dim.filterAll();
  table.selectAll('td._1')
    .each(function(d,i) {
      dim.filter(d.key);
      var thisQuarters = spendPerTime.all();
      for (var j = 0; j < thisQuarters.length; j++) {
        quarterSum[i][thisQuarters[j].key] = thisQuarters[j].value;
        max = thisQuarters[j].value > max ? thisQuarters[j].value : max;
      };
      dim.filterAll();
    });

  if(tableFilter.length > 0)
  {
    dim.filterFunction(function(x){return tableFilter.indexOf(x) > -1;});
  }
       
  var xSum = d3.scale.linear().domain([0, max]).range(["0%", "100%"]);
  var bQuartalSelectionOn = false;
  for (var i = quartalSelection.length - 1; i >= 0 && !bQuartalSelectionOn; i--) {
    bQuartalSelectionOn = quartalSelection[i] == 1;
  };

  table.selectAll('td._0').classed("text-left", true);
  var sparklines = table.selectAll('td._1')
    .classed("text-right", true)
    .append("div").attr("class", "inlinesparkline");
  var sparklineWidthStr = sparklines.style("width");
  var sparklineWidth = sparklineWidthStr.substr(0,sparklineWidthStr.length-2);
  for(var i = 0; i < quarterNames.length; i++) {
    sparklines.append("div")
      .attr("class", "sparklinecontainer")
      .style("width",(sparklineWidth/quarterNames.length-2)+"px")
      .attr("tooltip_title", function(x,j) { 
        var y = quarterNames[i];
        return Math.floor(y/10) +" Q"+ y%10 + " " + formatEuro(quarterSum[j][y]);
      })
      .on("mouseover", sparklineMouseover)
      .on("mouseout", hideSparklineTooltip)      
      .append("div")
        .transition()
        .duration(1000)      
        .style("height", function(x,j) { 
          var height = Math.abs(quarterSum[j][quarterNames[i]]);
          return xSum(height);
        })
        .attr("class", function(x,j) { 
          var str = Math.abs(quarterSum[j][quarterNames[i]]) == 0 ? "sparklinenull" : "";
          if(bQuartalSelectionOn)
            str = quartalSelection[i] ? str + " selected" : str + " deselected";
          return str;
        });
  }

  table.selectAll('.dc-table-row')
    .classed("dc-table-row-filtered", function(d) {
      return  tableFilter.indexOf(d.key) > -1 ? true : false;
    })
    .classed("dc-table-row-combined", function(d) {
      return nodes[d.key].comb;
    })
    .attr("title", function(d) {
      return nodes[d.key].comb ? "Dieser Eintrag ist kombiniert worden. Um zu sehen aus welchen Einträgen schaue dir das Tooltip über dem Tag unter dem Chord Diagramm an." : "";
    })    
    .on("click", function (d){
      var filterIndex = tableFilter.indexOf(d.key);
      if(filterIndex > -1) {
        if(tableFilter.length > 1) {
          tableFilter.splice(filterIndex, 1);
          dim.filterFunction(function(d){
            return tableFilter.indexOf(d) > -1;
          })
        }
        else{
          dim.filterAll();
          if(tableFilter == legalTableFilter)
            legalTableFilter = new Array();
          else
            mediaTableFilter = new Array();
        } 
      }
      else {
        tableFilter.push(d.key);
        dim.filterFunction(function(d){
          return tableFilter.indexOf(d) > -1;
        });
      }
      updateAll();
    })
    .on("mouseover", function (d){
      // if(tableFilter.length == 0) {
      //   legalDim.filter(d.key);
      //   mediaTable.redraw();
      //   mediaCount.redraw();
      // }
    })
    .on("mouseout", function (){
      // if(tableFilter.length == 0) {
      //   legalDim.filterAll();
      //   mediaTable.redraw();
      //   mediaCount.redraw();
      // }
    });
  }

exports.initCount = function()
{
  var all = ndxLinks.groupAll();
  legalCount
    .dimension(groupedLegalDim)
    .group(all)
    .html({
      some: '<strong>%total-count</strong> Einträge'
    });

  mediaCount
    .dimension(groupedMediaDim)
    .group(all)
    .html({
      some: '<strong>%total-count</strong> Einträge'
    });
};

exports.initTables = function()
{
  legalTable
    .dimension(groupedLegalDim)
    .group(tableRank)
    .sortBy(tableSorting[legalTableSorting])
    .order(legalTableOrdering[legalTableSorting]) 
    .showGroups(false)
    .size(Infinity)
    .columns([
      function(d){ return nodes[d.key].name; },
      function(d){ return formatEuro(d.value.total);},
      function(d){ return d.value.count; },
      function(d){ return formatPercent(d.value.trend); }
      ])
    .on("renderlet.a", function(chart){tableRenderlet(chart,legalDim);});

  legalTablePaging.update();

  mediaTable
    .dimension(groupedMediaDim)
    .group(tableRank)
    .showGroups(false)
    .sortBy(tableSorting[mediaTableSorting])
    .order(mediaTableOrdering[mediaTableSorting])  
    .size(Infinity)
    .columns([
      function(d){ return nodes[d.key].name; },
      function(d){ return formatEuro(d.value.total);},
      function(d){ return d.value.count;},
      function(d){ return formatPercent(d.value.trend); }
      ])
    .on("renderlet.b", function(chart){tableRenderlet(chart,mediaDim);});

  mediaTablePaging.update();
};