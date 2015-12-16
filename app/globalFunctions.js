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
formatBigEuro = locale.numberFormat("$,d");
var formatBigWithoutEuro = locale.numberFormat(",d");
formatGuV = function(d){
  var t = Math.floor(d/1000);
  var m = Math.floor(t/1000);
  if(m > 0)
  {
    return formatBigWithoutEuro(m) + " Mil. €";
  }
  else if(t > 0)
  {
    return formatBigWithoutEuro(t) + " Tsd.  €";
  }
  else
  {
    return formatBigEuro(d);
  }
}

textFilter = function(dim, q, tab) {
  //tab.filterAll();
  var re = new RegExp(".*"+q, "i")
  if (q != '') {
    dim.filterFunction(function(d) {
        return 0 == nodes[d].search(re);
    });
  } else {
    dim.filterAll();
  }
  updateAll();     
};

resetSearchBox = function(id,tableType){
  id.val('');
  id.change();
  if(tableType == "legal")
  {
    legalTableFilter = new Array();  
    legalDim.filterAll();
  }
  else
  {
    mediaTableFilter = new Array();  
    mediaDim.filterAll();
  }
  updateAll();
};

updateAll = function()
{
  updateAllNonDC();
  dc.redrawAll();
};

updateAllNonDC = function()
{
  drawChords(legalDim);
}

rescaleAll = function()
{
  timeBarChart.rescale();
  lawsBarChart.rescale();
  expensesBarChart.rescale();
  resizeChordChart();
};

deleteData = function(dimension)
{
  ndxLinks.remove(dimension);
  updateAll();
};

combineLegalData = function()
{
  var addArr = [];
  legalDim.top(Infinity).forEach(function(d){
    d.source = nodes.length;
    addArr.push(d);
  })
  ndxLinks.remove();
  // TODO combination name
  nodes.push($("#legalSearch").val())
  ndxLinks.add(addArr);

  updateAll();
};

combineMediaData = function()
{
  var addArr = [];
  mediaDim.top(Infinity).forEach(function(d){
    d.target = nodes.length;
    addArr.push(d);
  })
  ndxLinks.remove();
  // TODO combination name
  nodes.push($("#mediaSearch").val())
  ndxLinks.add(addArr);

  updateAll();
};

remove_empty_bins = function (source_group,filterFunction) {
  return {
    all:function () {
      return source_group.all().filter(filterFunction);
    },
    top: function(n) {
        return source_group.top(Infinity)
            .filter(filterFunction)
            .slice(0, n);
    },
    bottom: function(n) {
        return source_group.top(Infinity)
            .filter(filterFunction)
            .slice(-n);
    },
    size:function () { 
      return source_group.all().filter(filterFunction).length;
    }
  };
};

addTotal = function(p,v) {
  ++p.count;
  p.total += +v.euro;
  return p;  
};

removeTotal = function (p, v) {
  --p.count;
  p.total -= +v.euro;
  return p;
};

initTotal = function(){return {count: 0, total: 0};}

numericAscendingGlyph = "glyphicon-sort-by-order";
numericDescendingGlyph = "glyphicon-sort-by-order-alt";
ordinalAscendingGlyph = "glyphicon-sort-by-alphabet";
ordinalDescendingGlyph = "glyphicon-sort-by-alphabet-alt";

legalTableSortingStatus = {
  alphabeth : ordinalAscendingGlyph,
  relation : numericAscendingGlyph,
  sum : numericDescendingGlyph
};
mediaTableSortingStatus = {
  alphabeth : ordinalAscendingGlyph,
  relation : numericAscendingGlyph,
  sum : numericDescendingGlyph
};

tableSorting = {
  alphabeth : function (d) {return nodes[d.key];},
  relation  : function (d) {return d.value.count;},
  sum       : function (d) {return d.value.total;}
};

legalTableSorting = "sum";
mediaTableSorting = "sum";

legalTableOrdering = {
  alphabeth : d3.descending,
  relation : d3.descending,
  sum : d3.descending
};
mediaTableOrdering = {
  alphabeth : d3.descending,
  relation : d3.descending,
  sum : d3.descending
};

legalTableFilter = new Array();
mediaTableFilter = new Array();