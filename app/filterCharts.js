"use strict";
exports.initTimeBar = function(initTimeBar)
{
  var showTimeBarTooltip = function(d){
    var text = timeBarChart.title()(d.data);
    filterTooltip
      .transition()
      .duration(400)      
      .style("opacity", .9)
      .style("left", (d3.event.x + 5) + "px")     
      .style("top", (d3.event.y - 35) + "px");
    filterTooltip.html(text);
  }

  var hideBarTooltip = function(d){
      filterTooltip.transition()
      .duration(500)
      .style("opacity", 0);
  }

  timeBarChart
    .width(function(){return $("#time-bar-chart").width();})
    .height(200)
    .margins({top: 10, right: 10, bottom: 60, left: 80})
    .gap(6)
    .dimension(timeDim)
    .group(spendPerTime)
    .renderHorizontalGridLines(true)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    //.elasticX(true)
    .elasticY(true)
    // .colorAccessor(function(d, i){
    //   return Math.floor(d.key/10);
    // })
    .title(function (d) {
      return Math.floor(d.key/10) +" Q"+d.key%10 +": "+ formatEuro(d.value);
    })
    .on("filtered", function (chart, filter) {
      if(filter !== null)
        quartalSelection[quarterNames.indexOf(filter)] ^= 1;
      else {
        for (var i = quarterNames.length - 1; i >= 0; i--) {
          quartalSelection[i] = 0;
        }
      }
      // update function for d3
      updateAllNonDC();
    })
    .on("renderlet.d", function(chart){
      chart.selectAll('rect.bar')
        .on('mouseover', showTimeBarTooltip)
        .on('mouseleave', hideBarTooltip);
      chart.selectAll("g.x text")
        .attr('dx', '-28')
        .attr('dy', '-6')
        .attr('transform', "rotate(-90)");
      // remove standard tooltip
      chart.selectAll('title').remove();    
    });

  timeBarChart.yAxis().ticks(4);
  timeBarChart.yAxis().tickFormat(function (v) {
    return formatGuV(v,spendPerTime.top(1)[0].value);
  });    
  timeBarChart.xAxis().tickFormat(function (v) {
    return Math.floor(v/10) +" Q"+v%10;
  });
};

exports.initLawBar = function(lawsBarChart)
{
  var showLawsBarTooltip = function(d){
    var text = lawsBarChart.title()(d.data);
    filterTooltip
      .transition()
      .duration(400)      
      .style("opacity", .9)
      .style("left", (d3.event.x + 5) + "px")     
      .style("top", (d3.event.y - 35) + "px");
    filterTooltip.html(text);
  };

  var hideBarTooltip = function(d){
      filterTooltip.transition()
      .duration(500)
      .style("opacity", 0);  
  }

  lawsBarChart
    .width(function(){return $("#laws-bar-chart").width();})
    .height(200)
    .margins({top: 10, right: 10, bottom: 60, left: 80})
    .gap(5)
    .dimension(lawsDim)
    .group(spendPerLaw)
    .x(d3.scale.ordinal())
    .xUnits(dc.units.ordinal)
    .elasticX(true)
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .title(function (d) {
      return formatEuro(d.value);
    })
    .on("filtered", function (chart, filter) {
      // update function for d3
      updateAllNonDC();
    })
    .on("renderlet.d", function(chart){
      chart.selectAll('rect.bar')
        .on('mouseover', showLawsBarTooltip)
        .on('mouseleave', hideBarTooltip);
      // remove standard tooltip
      chart.selectAll('title').remove();       
    });

  lawsBarChart.xAxis().tickFormat(function (d) {
    return "§" + d;
  });
  lawsBarChart.yAxis().ticks(4);
  lawsBarChart.yAxis().tickFormat(function (v) {
    return formatGuV(v,spendPerLaw.top(1)[0].value);
  });
};
exports.initExpensesBar = function(expensesBarChart)
{
  expensesBarChart
    .width(function(){return $("#expenses-bar-chart").width();})
    .height(200)
    .margins({top: 10, right: 10, bottom: 60, left: 40})
    .gap(1)
    .dimension(spendDim)
    .group(spendGroup)
    .valueAccessor(function(d) {return d.value.count;})
    .transitionDuration(500)
    .round(dc.round.floor)
    .alwaysUseRounding(true)
    .x(d3.scale.linear().domain([0,1]))
    .xUnits(dc.units.fp.precision(1))
    .elasticX(true) // overrides the x domain
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .title(function (d) {
      return formatEuro(d.value.total*binwidth);
    })
    .filterPrinter(function (filters) {
        var filter = filters[0], s = '';
        s += formatGuV(filter[0]*binwidth) + ' - ' + formatGuV(filter[1]*binwidth);
        return s;
    })
    .on("renderlet.d", function(chart){
      chart.selectAll("g.x text")
        .attr('dx', '-32')
        .attr('dy', '-5')
        .attr('transform', "rotate(-65)");
    })
    .on("filtered", function (chart, filter) {
      // update function for d3
      updateAllNonDC();
    });

  expensesBarChart.xAxis().tickFormat(function (v) {
      if(spendDim.top(1)[0])
        return formatGuV(v*binwidth,spendDim.top(1)[0].euro);
      else
        return formatGuV(v*binwidth);
  });

  expensesBarChart.yAxis().ticks(4);
  expensesBarChart.yAxis().tickFormat(d3.format("d"))
      .tickSubdivide(0);
};

exports.initTrendBar = function(trendBarChart)
{
  trendBarChart
    .width(function(){return $("#trend-bar-chart").width();})
    .height(200)
    .margins({top: 10, right: 10, bottom: 60, left: 40})
    .dimension(trendDim)
    .group(trendGroup)
    .valueAccessor(function(d) {return d.value.count;})
    .transitionDuration(500)
    .x(d3.scale.linear().domain([-1,1]).range([-1,1]))
    .xUnits(function(d){return d;})
    .elasticY(true)
    .renderHorizontalGridLines(true)
    .title(function (d) {
      return formatPercent(d.value.trend);
    })
    .filterHandler(function (dimension, filter) {
      groupedLegalDim.all().forEach(function(v){sourceToValue[v.key] = v.value;});
      if(filter[0])
        dimension.filter(filter[0]);
      else
        dimension.filterAll();
      return filter;
    })
    .filterPrinter(function (filters) {
      var filter = filters[0];
      return formatPercent(filter[0]) + ' - ' + formatPercent(filter[1]);
    })
    .on("filtered", function (chart, filter) {
      updateAllNonDC();
    });

  trendBarChart.xAxis().tickFormat(function (v) {return formatPercent(v);});
  trendBarChart.xAxis().ticks(6);
  trendBarChart.yAxis().ticks(4);
};