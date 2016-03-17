/**
 * This file is responsible for initializing the data. 
 * 1) if a local storage is available it is used. 
 * 2) also the combined objects from a previous session is restored.
 */ 

hasLocalStorage = typeof(Storage) !== "undefined";
if(hasLocalStorage) {
  data = JSON.parse(localStorage.getItem("data"));
  if(data == null) {
    data = require('dataparse').parse(rawData);
    localStorage.setItem("data",JSON.stringify(data));
  }
}
else {
  data = require('dataparse').parse(rawData);
}
nodes = data[0];
links = data[1];
ndxLinks = crossfilter(links);
binwidth = 1000;

if(hasLocalStorage) {
  combinedObj = JSON.parse(localStorage.getItem("combinedObj"));
  if(combinedObj == null) {
    combinedObj = new Array();
  }
}
else{
  combinedObj = new Array();
}

tagTooltip = $("#tag-tooltip");
sparklineTooltip = d3.select("#sparkline-tooltip");
filterTooltip = d3.select("#filter-tooltip");
chordTooltip = d3.select("#chord-tooltip");