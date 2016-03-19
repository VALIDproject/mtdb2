/**
 * Initialize the dimensions and the grouping of the dimensions
 */
exports.init = function()
{
  var filterOutEmpty = function(d) { return Math.abs(d.value)>1e-3 };

  var filterOutEmptyTotal = function(d) { 
    return Math.abs(d.value.total)>1e-3;
  };

  var removeEmptyBins = function (sourceGroup,filterFunction) {
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

  var addTotal = function(p,v) {
    if(!p.sources[v.source])
    {
      p.sources[v.source] = 0;
      ++p.sources.count
    }
    if(!p.targets[v.target])
    {
      p.targets[v.target] = 0;  
      ++p.targets.count
    }
    p.sources[v.source]++;
    p.targets[v.target]++;
    p.count = Math.max(p.sources.count,p.targets.count);
    p.total += +v.euro;
    if(+v.year*10+v.quarter < halfQuarter)
    {
      p.trendBefore += +v.euro;
    }
    else
    {
      p.trendAfter += +v.euro;
    }
    p.trend = (p.trendAfter-p.trendBefore)/p.total;
    return p;  
  };

  var removeTotal = function (p, v) {
    if(p.sources[v.source] > 1)
      --p.sources[v.source];
    else{
      delete p.sources[v.source];
      --p.sources.count;
    }
     
    if(p.targets[v.target] > 1)
      --p.targets[v.target];
    else{
      delete p.targets[v.target];
      --p.targets.count;
    }
    p.count = Math.max(p.sources.count,p.targets.count);
    p.total -= +v.euro;
    if(+v.year*10+v.quarter < halfQuarter)
    {
      p.trendBefore -= +v.euro;
    }
    else
    {
      p.trendAfter -= +v.euro;
    }
    p.trend = (p.trendAfter-p.trendBefore)/p.total; 
    return p;
  };

  var initTotal = function(){return {count: 0, total: 0, trend: 0, trendAfter: 0, trendBefore: 0, sources: {count: 0}, targets: {count: 0}};}

  // The Dimensions

  legalDim = ndxLinks.dimension(function(d) {return +d.source});
  legalDim2 = ndxLinks.dimension(function(d) {return +d.source});
  mediaDim = ndxLinks.dimension(function(d) {return +d.target});
  mediaDim2 = ndxLinks.dimension(function(d) {return +d.target});
  lawsDim = ndxLinks.dimension(function(d) {return +d.law;});
  timeDim = ndxLinks.dimension(function(d) {return +d.year*10+d.quarter;})
  spendDim = ndxLinks.dimension(function(d) {return Math.floor(+d.euro/binwidth);})

  // The Grouping of the dimensions:

  spendPerTime = removeEmptyBins(timeDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);
  spendPerLaw = removeEmptyBins(lawsDim.group().reduceSum(function(d) {return +d.euro;}),filterOutEmpty);

  quarterNames = spendPerTime.all().map(function(d){return d.key});
  halfQuarter = quarterNames[Math.floor(quarterNames.length/2)];
  // initialize quarter selection to not selected
  quartalSelection = [];
  for (var i = quarterNames.length - 1; i >= 0; i--) {
    quartalSelection[i] = 0;
  }

  spendGroup = removeEmptyBins(spendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
  groupedLegalDim = removeEmptyBins(legalDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
  groupedMediaDim = removeEmptyBins(mediaDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);

  sourceToValue = {};
  groupedLegalDim.all().forEach(function(v){sourceToValue[v.key] = v.value;});

  trendDim = ndxLinks.dimension(function(d) {return sourceToValue[+d.source].trend;});
  trendGroup = removeEmptyBins(trendDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
}