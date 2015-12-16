"use strict";

timeBarChart
  .width(function(){return $("#time-bar-chart").width();})
  .height(200)
  .margins({top: 10, right: 10, bottom: 30, left: 80})
  .gap(10)
  .dimension(timeDim)
  .group(spendPerTime)
  .renderHorizontalGridLines(true)
  .x(d3.scale.ordinal())
  .xUnits(dc.units.ordinal)
  .elasticX(true)
  .elasticY(true)
  .colorAccessor(function(d, i){
    return Math.floor(d.key/10);
  })
  .title(function (d) {
    return Math.floor(d.key/10) +" Q"+d.key%10 +": "+ formatEuro(d.value);
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAllNonDC();
  });

timeBarChart.yAxis().tickFormat(function (v) {
  return formatGuV(v);
});    
timeBarChart.xAxis().tickFormat(function (v) {
  return Math.floor(v/10) +"Q"+v%10;
});

lawsBarChart
  .width(function(){return $("#laws-bar-chart").width();})
  .height(200)
  .margins({top: 10, right: 10, bottom: 30, left: 80})
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
  });

lawsBarChart.xAxis().tickFormat(function (d) {
  return "§" + d;
});
lawsBarChart.yAxis().tickFormat(function (v) {
  return formatGuV(v);
});

expensesBarChart
  .width(function(){return $("#expenses-bar-chart").width();})
  .height(200)
  .margins({top: 10, right: 10, bottom: 60, left: 40})
  .gap(2)
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
  .on("renderlet.d", function(chart){
    chart.selectAll("g.x text")
      .attr('dx', '-32')
      .attr('dy', '-7')
      .attr('transform', "rotate(-65)");
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAllNonDC();
  });

expensesBarChart.xAxis().tickFormat(function (v) {
    return formatGuV(v*binwidth);
});