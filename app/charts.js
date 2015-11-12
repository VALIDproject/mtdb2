exports.init = function(datafile) {

  $("#my-charts").hide(); //hide the charts. They are displayed when the data finishes loading

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

  var addTotal = function(p,v) {
    ++p.count;
    p.total += +v.euro;
    return p;  
  };

  var removeTotal = function (p, v) {
    --p.count;
    p.total -= +v.euro;
    return p;
  };

  var initTotal = function(){return {count: 0, total: 0};}

  var filterOutEmptryCont = function(d) { return d.value.count != 0; };

  var remove_empty_bins = function (source_group) {
      return {
          all:function () {
              return source_group.all().filter(filterOutEmptryCont);
          },
          top:function (x) {
              return source_group.top(x).filter(filterOutEmptryCont);
          },
          size:function () { 
              return source_group.all().filter(filterOutEmptryCont).length;
          }
      };
  };

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    ndxLinks = crossfilter(links);

    legalNameDim = ndxLinks.dimension(function(d) {return nodes[+d.source].name;});
    mediaNameDim = ndxLinks.dimension(function(d) {return nodes[+d.target].name;});
    legalDim = ndxLinks.dimension(function(d) {return +d.source});
    mediaDim = ndxLinks.dimension(function(d) {return +d.target});

    groupedLegalDim = remove_empty_bins(legalDim.group().reduce(addTotal,removeTotal,initTotal));
    groupedMediaDim = remove_empty_bins(mediaDim.group().reduce(addTotal,removeTotal,initTotal));

    textFilter = function(dim, q, tab) {
      tab.filterAll();
      var re = new RegExp(".*"+q, "i")
      if (q != '') {
        dim.filter(function(d) {
            return 0 == d.search(re);
        });
      } else {
        dim.filterAll();
      }
      updateAll();     
    };

    resetSearchBox = function(id){
      id.val('');
      id.change();
      updateAll();
    }


    updateAll = function()
    {
      legalTable.filterAll();
      mediaTable.filterAll();
      drawChords(legalDim);
      dc.renderAll();
    }    

    deleteData = function(dimension)
    {
      ndxLinks.remove(dimension);
      updateAll();
    }

    combineData = function(dimension)
    {
      var addArr = [];
      dimension.top(Infinity).forEach(function(d){
        d.source = nodes.length;
        addArr.push(d);
      })
      ndxLinks.remove();
      nodes.push({gov: 1, name:$("#legalSearch").val(),overall: 1})
      ndxLinks.add(addArr);

      updateAll();
    }

    require('filterCharts');
    require('tables');
    require('chordChart');

    dc.renderAll();

    $('#dataLoading').hide();
    $("#my-charts").show();

    $("#legalSearch").on('change', function () {
      textFilter(legalNameDim, this.value, legalTable);
    })
    $("#legalSearch").parent().parent().submit(function () {
      textFilter(legalNameDim, $("#legalSearch").val(), legalTable);
      return false;
    });
    $("#mediaSearch").on('change', function () {
      textFilter(mediaNameDim, this.value, mediaTable);
    });
    $("#mediaSearch").parent().parent().submit(function () {
      textFilter(mediaNameDim, $("#mediaSearch").val(), mediaTable);
      return false;
    });    
  }
}