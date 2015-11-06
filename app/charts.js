exports.init = function(datafile) {

  var yearRingChart   = dc.pieChart("#chart-ring-year");

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    var ndxNodes = crossfilter(data);
    var ndxLinks = crossfilter(links);

    var yearDim  = ndxLinks.dimension(function(d) {return +d.year;});

    var spendPerYear = yearDim.group().reduceSum(function(d) {return +d.euro;});

    yearRingChart
      .width(200).height(200)
      .dimension(yearDim)
      .group(spendPerYear)
      .innerRadius(50);

    dc.renderAll();
  }
}