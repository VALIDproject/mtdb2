yearsPieChart
  .width(180).height(180).radius(80)
  .dimension(yearDim)
  .group(spendPerYear)
  .label(function (d) {
    var label = d.key;
    if (yearsPieChart.hasFilter() && !yearsPieChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerYear.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAll();
  });

quarterPieChart
  .width(180).height(180).radius(80)
  .dimension(quarterDim)
  .group(spendPerQuarter)
  .label(function (d) {
    var label = d.key;
    if (quarterPieChart.hasFilter() && !quarterPieChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerQuarter.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAll();
  });        

lawsPieChart
  .width(180).height(180).radius(80)
  .dimension(lawsDim)
  .group(spendPerLaw)
  .label(function (d) {
    var label = d.key;
    if (lawsPieChart.hasFilter() && !lawsPieChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerLaw.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  })
  .on("filtered", function (chart, filter) {
    // update function for d3
    updateAll();
  });