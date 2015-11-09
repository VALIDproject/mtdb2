"use strict";

var yearDim  = ndxLinks.dimension(function(d) {return +d.year;});
var quarterDim  = ndxLinks.dimension(function(d) {return +d.quarter;});
var lawsDim = ndxLinks.dimension(function(d) {return +d.law;});

var spendPerYear = yearDim.group().reduceSum(function(d) {return +d.euro;});
var spendPerQuarter = quarterDim.group().reduceSum(function(d) {return +d.euro;});
var spendPerLaw = lawsDim.group().reduceSum(function(d) {return +d.euro;});

yearsChart
  .width(180).height(180).radius(80)
  .dimension(yearDim)
  .group(spendPerYear)
  .label(function (d) {
    var label = d.key;
    if (yearsChart.hasFilter() && !yearsChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerYear.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  });

quarterChart
  .width(180).height(180).radius(80)
  .dimension(quarterDim)
  .group(spendPerQuarter)
  .label(function (d) {
    var label = d.key;
    if (quarterChart.hasFilter() && !quarterChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerQuarter.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  });      

lawsChart
  .width(180).height(180).radius(80)
  .dimension(lawsDim)
  .group(spendPerLaw)
  .label(function (d) {
    var label = d.key;
    if (lawsChart.hasFilter() && !lawsChart.hasFilter(d.key)) {
        return label + '(0%)';
    }
    var all = d3.sum(spendPerLaw.all(),function(d) {return d.value;});
    if (all) {
        label += '(' + Math.floor(d.value / all * 100) + '%)';
    }
    return label;
  });
