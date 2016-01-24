"use strict";

var showTimeBarTooltip = function(d){
  var text = timeBarChart.title()(d.data);
  filterTooltip
    .transition()
    .duration(200)      
    .style("opacity", .9)
    .style("left", (d3.event.pageX + 5) + "px")     
    .style("top", (d3.event.pageY - 35) + "px");
  filterTooltip.html(text);
}

var showLawsBarTooltip = function(d){
  var text = lawsBarChart.title()(d.data);
  filterTooltip
    .transition()
    .duration(200)      
    .style("opacity", .9)
    .style("left", (d3.event.pageX + 5) + "px")     
    .style("top", (d3.event.pageY - 35) + "px");
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
  .gap(10)
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
  return formatGuV(v,spendPerTime.top(1)[0].value,spendPerTime.bottom(1)[0].value);
});    
timeBarChart.xAxis().tickFormat(function (v) {
  return Math.floor(v/10) +" Q"+v%10;
});

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
  return formatGuV(v,spendPerLaw.top(1)[0].value,spendPerLaw.bottom(1)[0].value);
});

expensesBarChart
  .width(function(){return $("#expenses-bar-chart").width();})
  .height(200)
  .margins({top: 10, right: 10, bottom: 60, left: 40})
  .gap(1)
  .dimension(spendDim)
  .group(spendGroup)
  .transitionDuration(500)
  .round(dc.round.floor)
  .alwaysUseRounding(true)
  .x(d3.scale.linear().domain([0,1]))
  .xUnits(dc.units.fp.precision(1))
  .elasticX(true) // overrides the x domain
  .elasticY(true)
  .renderHorizontalGridLines(true)
  .title(function (d) {
    return formatEuro(d.value*binwidth);
  })
  .filterPrinter(function (filters) {
      var filter = filters[0], s = '';
      s += formatGuV(filter[0]*binwidth,filter[0]*binwidth,filter[0]*binwidth) + ' - ' + formatGuV(filter[1]*binwidth,filter[1]*binwidth,filter[1]*binwidth);
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
      return formatGuV(v*binwidth,spendDim.top(1)[0].euro,spendDim.bottom(1)[0].euro);
    else
      return formatGuV(v*binwidth,v*binwidth,v*binwidth);
});

expensesBarChart.yAxis().ticks(4);
expensesBarChart.yAxis().tickFormat(d3.format("d"))
    .tickSubdivide(0);