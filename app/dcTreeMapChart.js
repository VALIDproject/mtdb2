dc.treemapChart = function (parent, chartGroup) {

  var _chart = dc.capMixin(dc.marginMixin(dc.baseMixin({})));
  var _treemap;
  _chart.rowsCap = _chart.cap;
  _chart._doRedraw = function() {
    var _cellData = {
      name:'tree',
      children: _chart.data()
    };
    _chart.root()
      .selectAll('.node')
      .data(_treemap.nodes)
      .transition().duration(1000)
      .call(_updateCell);

    _highlightFilters();
    return _chart;
  };

  _chart._doRender = function () {

    var color = d3.scale.category20c();

    _treemap = d3.layout.treemap()
      .size([_chart.width(), _chart.height()])
      .sticky(true)
      .value(function (d) { return _chart.valueAccessor()(d); });

    var _cellData = {
      name:'tree',
      children: _chart.data()
    };

    _chart.root()
      .classed('treemap', true)
      .style('position', 'relative')
      .style('height', _chart.height() + 'px')
      .style('width', _chart.width() + 'px');

    var _node = _chart.root()
      .datum(_cellData)
      .selectAll('.node')
      .data(_treemap.nodes)
      .enter()
      .append('div')
      .attr('class', 'node')
      .call(_updateCell)
      .style('background', function(d) { return color(d.key); })
      .style('position', 'absolute')
      .text(function(d) { return _chart.keyAccessor()(d); })
      .attr('title', _chart.title())
      .on('click', onClick);


    return _chart;
  };

  function _updateCell() {
    this.style('left', function (d) { return d.x + 'px'; })
    .style('top', function (d) { return d.y + 'px'; })
    .style('width', function (d) { return (d.dx - 1) + 'px'; })
    .style('height', function (d) { return (d.dy - 1) + 'px'; })
    .style('font-size', function (d) { return d.value > 0 ? 0.1 * Math.sqrt(d.dx * d.dy) +'px' : 0; });
  }

  function onClick(d, i) {
    _chart.onClick(d, i);
  }

  function _highlightFilters() {
    if (_chart.hasFilter()) {
      _chart.root().selectAll('.node').each(function (d) {
        if (_chart.hasFilter(d.key)) {
          _chart.highlightSelected(this);
        }
        else {
          _chart.fadeDeselected(this);
        }
      });
    }
    else {
      _chart.root().selectAll('.node').each(function (d) {
        _chart.resetHighlight(this);
      });
    }
  }

  return _chart.anchor(parent, chartGroup);
};