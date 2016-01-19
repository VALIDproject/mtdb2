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
var formatBigWithoutEuro = locale.numberFormat(",.1f");

var getUnit = function(d){
  var t = Math.floor(d/1000);
  var m = Math.floor(t/1000);
  if (m > 0)
    return 2;
  else if(t > 0)
    return 1;
  else
    return 0; 
}

formatGuV = function(d,max,min){
  var m = getUnit(min);
  var n = getUnit(max);
  var u = m;
  if(n > m + 1)
    u = n;
  switch(getUnit(max))
  {
    case 0: 
      return formatBigEuro(d);
    case 1:
      return formatBigWithoutEuro(d/1000) + " Tsd. €";
    case 2:
      return formatBigWithoutEuro(d/1000000) + " Mil. €";
  }
}

textFilter = function(dim, q, tab) {
  //tab.filterAll();
  var re = new RegExp(".*"+q, "i")
  if (q != '') {
    dim.filterFunction(function(d) {
        return 0 == nodes[d].name.search(re);
    });
  } else {
    dim.filterAll();
  }
  updateAll();     
};

showMediaSelectionInteraction = function()
{
  if( $("#mediaSearch").val().length > 0 || mediaTableFilter.length > 0){
    $('#mediaSearchReset').show(); 
  }
  else{
    $('#mediaSearchReset').hide();
  }
};

showLegalSelectionInteraction = function()
{
  if( $("#legalSearch").val().length > 0  || legalTableFilter.length > 0){
    $('#legalSearchReset').show(); 
  }
  else{
    $('#legalSearchReset').hide();
  }
};

resetSearchBox = function(tableType){
  if(tableType == "legal")
  {
    $('#legalSearch').val('').submit();    
    legalTableFilter = new Array();  
    legalDim.filterAll();
  }
  else
  {
    $('#mediaSearch').val('').submit();       
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
  showLegalSelectionInteraction();
  showMediaSelectionInteraction();
  legalTablePaging.update();
  mediaTablePaging.update();
  showTags();
  drawChords(legalDim);
}

filterAll = function()
{
  legalTableFilter = new Array();
  mediaTableFilter = new Array();
  legalDim.filterAll();
  mediaDim.filterAll();
  dc.filterAll();
}

rescaleAll = function()
{
  timeBarChart.rescale();
  lawsBarChart.rescale();
  expensesBarChart.rescale();
  resizeChordChart();
};

combinedObj = new Array();

function hashString (s) {
  var hash = 0, i, chr, len;
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr   = s.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var getCombinedObjHash = function(hash) {
  hash = hashString(hash);
  for (var i = combinedObj.length - 1; i >= 0; i--) {
    if(combinedObj[i].name == hash) {
      return getCombinedObjHash(hash + Math.floor(Math.random() * 10));
    }
  }
  return hash;
}

deleteData = function(dimension)
{
  var combinedName = prompt("Name of the removed data",
    dimension == legalDim ? nodes[dimension.top(1)[0].source].name : nodes[dimension.top(1)[0].target].name);
  if(combinedName)
  {
    var addArr = [];
    dimension.top(Infinity).forEach(function(d){
      var dD = jQuery.extend(true, {}, d); //deep copy!
      addArr.push(dD);    
    });

    ndxLinks.remove(dimension);
    if(dimension == legalDim) {
      legalTableFilter = new Array();
    }
    else {
      mediaTableFilter = new Array();
    }
    dimension.filterAll();

    combinedObj.push({
      id: getCombinedObjHash(combinedName),
      name: combinedName,
      added: [],
      removed: addArr,
      type: "remove"
    });  

    updateAll();
  }
};

combineData = function(dimension)
{
  var combinedName = prompt("Name of the combined data",
    dimension == legalDim ? nodes[dimension.top(1)[0].source].name : nodes[dimension.top(1)[0].target].name);
  if(combinedName)
  {
    var addArr = [];
    var newArr = [];
    var newId = nodes.length;
    var isLegal = dimension == legalDim;
    var filter = isLegal ? legalTableFilter : mediaTableFilter;

    dimension.top(Infinity).forEach(function(d){
      var dD = jQuery.extend(true, {}, d); //deep copy!
      addArr.push(dD);
      var dN = jQuery.extend(true, {}, d); //deep copy!
      if(isLegal)
        dN.source = newId;
      else
        dN.target = newId;
      newArr.push(dN);
    });

    ndxLinks.remove();
    nodes.push({name: combinedName, gov: isLegal});
    ndxLinks.add(newArr);

    resetSearchBox(isLegal ? "legal" : "media");

    combinedObj.push({
      id: getCombinedObjHash(combinedName),
      name: combinedName,
      added: newArr,
      removed: addArr,
      type: "combine"
    });

    updateAll();
  }
};

var showTagTooltip = function(d,x,y)
{
  tagTooltip.empty();
  var str = "<table><tr><th>Rechtsträger</th><th>Media</th><th>Quartal</th><th>Summe</th></tr>";
  if(d.type == "combine"){
    d.removed.forEach(function(id){
      str += "<tr><td> "+shortenLongName(nodes[id.source].name)+"</td><td>"+shortenLongName(nodes[id.target].name)+"</td><td>"+ id.year +" Q"+id.quarter +"</td><td class='num'>"+ formatEuro(id.euro) +"</td></tr>";
    });
    
  }
  else {
    d.removed.forEach(function(id){
      str += "<tr><td> "+shortenLongName(nodes[id.source].name)+"</td><td>"+shortenLongName(nodes[id.target].name)+"</td><td>"+ id.year +" Q"+id.quarter +"</td><td class='num'>"+ formatEuro(id.euro) +"</td></tr>";
    });
  }
  tagTooltip.append(str + "</table>");
  tagTooltip.css({'top':y+12});
  tagTooltip.show();
}

var hideTagTooltip = function()
{
  tagTooltip.hide();
}

showTags = function()
{
  var div = $("#combine-blocks");
  div.empty();
  var id = 0;
  combinedObj.forEach(function(d){
    var h = $("<span class=\"tag "+d.type+"\">"+shortenLongName(d.name)+"<button class=\"btn\" onClick=\"javascript:resolveCombineData(\'"+id+"\')\"><span class=\"glyphicon glyphicon-remove\"></span></button></span>")
      .hover(function(e){
        showTagTooltip(d,e.clientX,e.clientY);
      },function(e){
        hideTagTooltip();
      })
      .appendTo(div);
    id++;
  });
}

resolveCombineData = function(id) 
{
  tagTooltip.hide();
  filterAll();
  var obj = jQuery.extend(true, {}, combinedObj[+id]); //deep copy!
  combinedObj.splice(+id, 1); // remove element
  // create filter to delete the added ones
  if(obj.added.length > 0)
  {
    sourceArr = obj.added.map(function(x){return x.source;});
    targetArr = obj.added.map(function(x){return x.target;});
    lawsArr = obj.added.map(function(x){return x.law;});
    timeArr = obj.added.map(function(x){return +x.year*10+x.quarter;});
    moneyArr = obj.added.map(function(x){return Math.floor(+x.euro/binwidth);});

    legalDim.filterFunction(function(d){
      return sourceArr.indexOf(d) > -1;
    });
    mediaDim.filterFunction(function(d){
      return targetArr.indexOf(d) > -1;
    });
    lawsDim.filterFunction(function(d){
      return lawsArr.indexOf(d) > -1;
    });
    timeDim.filterFunction(function(d){
      return timeArr.indexOf(d) > -1;
    });
    spendDim.filterFunction(function(d){
      return moneyArr.indexOf(d) > -1;
    });    
    ndxLinks.remove();
    legalDim.filterAll();
    mediaDim.filterAll();
    lawsDim.filterAll();
    timeDim.filterAll();
    spendDim.filterAll();
  }

  // add the deleted ones:
  ndxLinks.add(obj.removed);
  updateAll();
}

chordTooltipUpdate = function (data)
{
  //var string = "von " + nodes[+data.sname] + " nach " + nodes[+data.tname] + ": " + formatEuro((data.svalue) + "/" + formatEuro((data.stotal);
  //console.log(data);
  if(nodes[+data.sname].gov == 1)
  {
    $("#ttLegal").text(nodes[+data.sname].name);
    $("#ttMedia").text(nodes[+data.tname].name);
    $("#ttFrom").text(formatEuro(data.svalue));
    $("#ttTo").text(formatEuro(data.stotal));    
  }
  else
  {
    $("#ttLegal").text(nodes[+data.tname].name);
    $("#ttMedia").text(nodes[+data.sname].name);
    $("#ttFrom").text(formatEuro(data.tvalue));
    $("#ttTo").text(formatEuro(data.ttotal));    
  }
};

removeEmptyBins = function (sourceGroup,filterFunction) {
  return {
    all:function () {
      return sourceGroup.all().filter(filterFunction);
    },
    top: function(n) {
        return sourceGroup.top(Infinity)
            .filter(filterFunction)
            .slice(0, n);
    },
    bottom: function(n) {
        return sourceGroup.top(Infinity)
            .filter(filterFunction)
            .slice(-n);
    },
    size:function () { 
      return sourceGroup.all().filter(filterFunction).length;
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

shortenLongName = function(name)
{
  if (name.length > 30)
    name = name.substr(0, 20) + "..." + name.substr(-7);
  return name;
}

numericAscendingGlyph = "glyphicon-sort-by-order";
numericDescendingGlyph = "glyphicon-sort-by-order-alt";
ordinalAscendingGlyph = "glyphicon-sort-by-alphabet";
ordinalDescendingGlyph = "glyphicon-sort-by-alphabet-alt";

legalTableSortingStatus = {
  alphabet : ordinalAscendingGlyph,
  relation : numericAscendingGlyph,
  sum : numericDescendingGlyph
};
mediaTableSortingStatus = {
  alphabet : ordinalAscendingGlyph,
  relation : numericAscendingGlyph,
  sum : numericDescendingGlyph
};

tableSorting = {
  alphabet : function (d) {return nodes[d.key].name;},
  relation  : function (d) {return d.value.count;},
  sum       : function (d) {return d.value.total;}
};

legalTableSorting = "sum";
mediaTableSorting = "sum";

legalTableOrdering = {
  alphabet : d3.descending,
  relation : d3.descending,
  sum : d3.descending
};
mediaTableOrdering = {
  alphabet : d3.descending,
  relation : d3.descending,
  sum : d3.descending
};

legalTableFilter = new Array();
mediaTableFilter = new Array();

TablePaging = function(table,ofs,pag,parentID)
{
  this._ofs = ofs;
  this._pag = pag;
  this._table = table;
  this._parentId = parentID;
}

TablePaging.prototype.display = function () {
  d3.select(this._parentId+" #begin")
    .text(this._ofs); // or 0
  d3.select(this._parentId+" #end")
    .text(this._ofs+this._pag-1);
  d3.select(this._parentId+" #last")
    .attr('disabled', this._ofs-this._pag<0 ? 'true' : null);
  if(this._parentId == "#legal-paging"){
    d3.select(this._parentId+" #next")
      .attr('disabled', this._ofs+this._pag>=groupedLegalDim.all().length ? 'true' : null);    
  }
  else{
    d3.select(this._parentId+" #next")
      .attr('disabled', this._ofs+this._pag>=groupedMediaDim.all().length ? 'true' : null);    
  }    
  
};

TablePaging.prototype.update = function() {
  this._table.beginSlice(this._ofs); // or this._ofs
  this._table.endSlice(this._ofs+this._pag);
  this.display();
};

TablePaging.prototype.next = function() {
  this._ofs += this._pag;
  this.update();
  this._table.redraw();
};

TablePaging.prototype.last = function() {
  this._ofs -= this._pag;
  this.update();
  this._table.redraw();
};