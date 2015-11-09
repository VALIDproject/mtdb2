exports.init = function(datafile) {

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  yearsChart = dc.pieChart('#years-chart');
  quarterChart = dc.pieChart('#quarter-chart');
  lawsChart = dc.pieChart("#laws-chart");
  legalCount = dc.dataCount('#data-count-legal');
  legalTable = dc.dataTable('#legal-table');
  mediaTable = dc.dataTable("#media-table");
  mediaCount = dc.dataCount('#data-count-media');

  locale = d3.locale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["", "€"],
    "dateTime": "%a %b %e %X %Y",
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "shortDays": ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    "months": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    "shortMonths": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  });

  formatEuro = locale.numberFormat("$,.2f");

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    ndxLinks = crossfilter(links);

    legalNameDim = ndxLinks.dimension(function(d) {return nodes[+d.source].name;});
    mediaNameDim = ndxLinks.dimension(function(d) {return nodes[+d.target].name;});

    text_filter = function(dim, q, tab) {
      tab.filterAll();
      var re = new RegExp(q, "i")
      if (q != '') {
        dim.filter(function(d) {
            return 0 == d.search(re);
        });
      } else {
        dim.filterAll();
      }
      dc.redrawAll();
    };

    all = ndxLinks.groupAll();

    require('filterCharts');
    require('tables');

    dc.renderAll();
  }
}