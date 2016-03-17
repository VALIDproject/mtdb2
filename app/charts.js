/**
 * This module initializes the application.
 * @param the file to the data.
 */
exports.init = function(datafile) {

  $("#my-charts").hide(); //hide the charts. They are displayed when the data finishes loading

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  timeBarChart = dc.barChart('#time-bar-chart');
  lawsBarChart = dc.barChart('#laws-bar-chart');
  expensesBarChart = dc.barChart('#expenses-bar-chart');
  trendBarChart = dc.barChart('#trend-bar-chart');

  legalCount = dc.dataCount('#data-count-legal');
  mediaCount = dc.dataCount('#data-count-media');

  legalTable = dc.dataTable('#legal-table');
  mediaTable = dc.dataTable("#media-table");

  legalTablePaging = new TablePaging(legalTable,0,10,"#legal-paging");
  mediaTablePaging = new TablePaging(mediaTable,0,10,"#media-paging");

  q.await(function(error, rawData) {

    require('initData');
    require('initDimensions');
    require('filterCharts');
    require('chordChart');
    require('tables');

    dc.renderAll();
    showTags();

    $('#dataLoading').hide();
    $("#my-charts").show();
    $('#legalSearchReset').hide();
    $('#mediaSearchReset').hide();

    require('createListeners');
  });
}