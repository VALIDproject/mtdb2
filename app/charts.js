exports.init = function(datafile) {

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  yearsChart = dc.pieChart('#years-chart');

  quarterChart = dc.pieChart('#quarter-chart');

  lawsChart = dc.pieChart("#laws-chart");

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    var ndxNodes = crossfilter(data);
    var ndxLinks = crossfilter(links);

    var yearDim  = ndxLinks.dimension(function(d) {return +d.year;});
    var quarterDim  = ndxLinks.dimension(function(d) {return +d.quarter;});
    var lawsDim = ndxLinks.dimension(function(d) {return +d.law;});

    var spendPerYear = yearDim.group().reduceSum(function(d) {return +d.euro;});
    var spendPerQuarter = quarterDim.group().reduceSum(function(d) {return +d.euro;});
    var spendPerLaw = lawsDim.group().reduceSum(function(d) {return +d.euro;});

    yearsChart
      .width(180).height(180).radius(80)
      .dimension(yearDim)
      .group(spendPerYear);

    quarterChart
      .width(180).height(180).radius(80)
      .dimension(quarterDim)
      .group(spendPerQuarter);

    lawsChart
      .width(180).height(180).radius(80)
      .dimension(lawsDim)
      .group(spendPerLaw);    

    dc.renderAll();
  }
}