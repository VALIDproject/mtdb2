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
    if (yearsChart.hasFilter() && !yearsChart.hasFilter(d.key)) {
        return d.key + '(0%)';
    }
    var label = d.key;
    if (all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
    }
    return label;
  })
  .renderLabel(true);

quarterChart
  .width(180).height(180).radius(80)
  .dimension(quarterDim)
  .group(spendPerQuarter)
  .label(function (d) {
    if (quarterChart.hasFilter() && !quarterChart.hasFilter(d.key)) {
        return d.key + '(0%)';
    }
    var label = d.key;
    if (all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
    }
    return label;
  })
  .renderLabel(true);      

lawsChart
  .width(180).height(180).radius(80)
  .dimension(lawsDim)
  .group(spendPerLaw)
  .label(function (d) {
    if (lawsChart.hasFilter() && !lawsChart.hasFilter(d.key)) {
        return '§' + d.key + '(0%)';
    }
    var label = '§' + d.key;
    if (all.value()) {
        label += '(' + Math.floor(d.value / all.value() * 100) + '%)';
    }
    return label;
  })
  .renderLabel(true); 
