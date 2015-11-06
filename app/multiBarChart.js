/**
## Multiple Group Mixin
A mixin for adding basic multi aggregation support for charts.
**/
dc.multiGroupMixin = function (_chart) {

    _chart._groups   = new Array();
    _chart._groupGap = 5;

    _chart.groups = function( g ) {
        if (!arguments.length) return _chart._groups;
        _chart._groups = g;
        _chart.expireCache();
        return _chart;
    };

    _chart.groupGap = function (_) {
        if (!arguments.length) return _chart._groupGap;
        _chart._groupGap = _;
        return _chart;
    };

    _chart.legendables = function() {
        var items = new Array();
        _chart.groups().forEach(function(g, k){
            var item = {
                chart:  _chart,
                name:   g.title,
                hidden: false,
                color:  _chart.colors()(k)
            };
            items.push(item);
        });
        return items;
    };

    return _chart;
};

dc.multiBarChart = function (parent, chartGroup) {
    var MIN_BAR_WIDTH = 1;
    var DEFAULT_GAP_BETWEEN_BARS = 2;

    var _chart = dc.multiGroupMixin(dc.stackMixin(dc.coordinateGridMixin({})));

    var _gap = DEFAULT_GAP_BETWEEN_BARS;
    var _centerBar = false;
    var _alwaysUseRounding = false;

    var _maxBarleLabelWidth = 0;
    var _barWidth;

    dc.override(_chart, 'rescale', function () {
        _chart._rescale();
        _barWidth = undefined;
    });

    _chart._labelFormatter = function(d){ return d; };
    _chart._barLabels = false;

    dc.override(_chart, 'render', function () {
        if (_chart.round() && _centerBar && !_alwaysUseRounding) {
            dc.logger.warn("By default, brush rounding is disabled if bars are centered. " +
                         "See dc.js bar chart API documentation for details.");
        }

        _chart._render();
    });

    _chart.plotData = function () {

        var data = new Array();
        _chart.groups().forEach(function(m, i){
            var row = {};
            row.data = m.dimgroup.all();
            row.data.forEach(function(d, j){
                d.valueAccessor = m.accessor;
                d.x  = _chart.keyAccessor()( d );
                d.y  = d.valueAccessor( d );
                d.y0 = 0;
            });
            data.push(row);
        });

        var layers = _chart.chartBodyG().selectAll("g.series").data( data );

        calculateBarWidth();
        calculateMaxBarLabelWidth();

        layers
            .enter()
            .append("g")
            .attr("class", function (d, i) {
                return "series " + "_" + i;
            });

        layers.each(function (d, i) {
            var layer = d3.select(this);
            renderBars(layer, i, d);
        });
    };

    function calculateMaxBarLabelWidth(){
        var
            max  = 0,
            data = _chart.groups();

        max = d3.max(data, function(g, i){
            return d3.max(g.dimgroup.all(), function(h, j){
                return 5.5 * _chart._labelFormatter(h.valueAccessor(h)).length;
            });
        });
        _maxBarleLabelWidth = max;
    }

    function barHeight(d) {
        return dc.utils.safeNumber(Math.abs(_chart.y()(d.y + d.y0) - _chart.y()(d.y0)));
    }

    function barLabelY(d) {
        var
            labY = 0,
            labP = "out",
            maxY = _chart.y().range()[0],
            curY = _chart.y()(d.y + d.y0)
        ;

        if( curY < 15 ){
            labY = curY + 15;
            labP = "in";
        }
        else {
            labY = curY -5;
        }
        labY = dc.utils.safeNumber(labY);

        return { "y": labY, "p": labP };
    }

    function renderBars(layer, layerIndex, d) {

        var bars = layer.selectAll("g.bargr").data(d.data);

        var barEnter = bars.enter()
            .append("g")
                .attr("class", "bargr");

        barEnter
            .append("rect")
                .attr("class", "bar")
                .attr("fill", function(d){
                    return _chart.colors()(layerIndex);
                })
                .attr("height", 0)
                .attr("width", _barWidth)
                .attr("x", function (d) {
                    var x; 
                    x  = _chart.x()(d.x) + _chart.groupGap() / 2;
                    x += layerIndex * (_barWidth + _gap);
                    x += _gap / 2
                    return dc.utils.safeNumber(x);
                })
                .attr("y", function(d){
                    return _chart.y()(0);
                });

        if (_chart.renderTitle()) {
            //bars.append("title").text(dc.pluck('data',_chart.title(d.name)));
        }

        if (_chart.isOrdinal()) {
            bars.on("click", onClick);
        }

        dc.transition(bars.selectAll("rect.bar"), _chart.transitionDuration())
            .attr("y", function (d) {
                var y = _chart.y()(d.y + d.y0);

                if (d.y < 0)
                    y -= barHeight(d);

                return dc.utils.safeNumber(y);
            })
            .attr("height", function (d) {
                return barHeight(d);
            });

        dc.transition(bars.exit(), _chart.transitionDuration())
            .attr("height", function(d){
                return 0;
            })
            .remove();


        if (_chart.barLabels() && _maxBarleLabelWidth <= _barWidth){
            barEnter.append("text")
                    .attr("class", "bar-label")
                    .attr("text-anchor", "middle")
                    .attr("y", function(d){
                        return _chart.y()(0);
                    })
                    .attr("data-prevvalue", function(d){
                        return d.valueAccessor(d);
                    });

            var labels = layer.selectAll("text.bar-label")
                    .data(d.data)
                    .text(function(e){
                        var dat = Math.abs(e.valueAccessor(e));
                        var ret = _chart._labelFormatter(dat);
                        return ret;
                    });

           dc.transition(labels, _chart.transitionDuration())
                .attr("x", function (d) {
                    var x = _chart.x()(d.x);
                    if (_chart.isOrdinal()) {
                        x += _barWidth / 2;
                        x += 0.5 * _chart.groupGap() + 0.5 * _gap;
                        x += layerIndex * (_barWidth + _gap);
                    }
                    return dc.utils.safeNumber(x);
                })
                .attr("y", function (d) {
                    return barLabelY(d).y;
                })
                .style("fill", function (d){
                    if (barLabelY(d).p == "in"){
                        return "white";
                    }
                    if (barLabelY(d).p == "out"){
                        return "#3d3d3d";
                    }
                })
                .tween("text", function(d) {
                    var
                        start,
                        end,
                        i;

                    start = d3.select(this).attr("data-prevvalue");
                    end   = d.valueAccessor(d);
                    i     = d3.interpolate(start, end);
                    return function(t) {
                        this.textContent = _chart._labelFormatter( i(t) );
                    };
                })
                .each("end", function(d){
                    d3.select(this).attr("data-prevvalue", function(d){
                        return d.valueAccessor(d);
                    });
                });
        }
    }

    function calculateBarWidth() {

        if (_barWidth === undefined) {
            var numberOfBars = _chart.xUnitCount() * _chart.groups().length;
            _barWidth = (_chart.x().rangeBand() - _chart.groupGap()) / _chart.groups().length - _gap;
        }
    }

    _chart.fadeDeselectedArea = function () {
        var bars = _chart.chartBodyG().selectAll("rect.bar");
        var extent = _chart.brush().extent();

        if (_chart.isOrdinal()) {
            if (_chart.hasFilter()) {
                bars.classed(dc.constants.SELECTED_CLASS, function (d) {
                    return _chart.hasFilter(d.x);
                });
                bars.classed(dc.constants.DESELECTED_CLASS, function (d) {
                    return !_chart.hasFilter(d.x);
                });
            } else {
                bars.classed(dc.constants.SELECTED_CLASS, false);
                bars.classed(dc.constants.DESELECTED_CLASS, false);
            }
        } else {
            if (!_chart.brushIsEmpty(extent)) {
                var start = extent[0];
                var end = extent[1];

                bars.classed(dc.constants.DESELECTED_CLASS, function (d) {
                    return d.x < start || d.x >= end;
                });
            } else {
                bars.classed(dc.constants.DESELECTED_CLASS, false);
            }
        }
    };

    /**
    #### .centerBar(boolean)
    Whether the bar chart will render each bar centered around the data position on x axis. Default to false.

    **/
    _chart.centerBar = function (_) {
        if (!arguments.length) return _centerBar;
        _centerBar = _;
        return _chart;
    };

    function onClick(d) {
        _chart.onClick(d);
    }

    /**
    #### .barPadding([padding])
    Get or set the spacing between bars as a fraction of bar size. Valid values are within 0-1.
    Setting this value will also remove any previously set `gap`. See the
    [d3 docs](https://github.com/mbostock/d3/wiki/Ordinal-Scales#wiki-ordinal_rangeBands)
    for a visual description of how the padding is applied.
    **/
    _chart.barPadding = function (_) {
        if (!arguments.length) return _chart._rangeBandPadding();
        _chart._rangeBandPadding(_);
        _gap = 0;
        return _chart;
    };

    /**
    #### .outerPadding([padding])
    Get or set the outer padding on an ordinal bar chart. This setting has no effect on non-ordinal charts.
    Padding equivlent in width to `padding * barWidth` will be added on each side of the chart.

    Default: 0.5
    **/
    _chart.outerPadding = _chart._outerRangeBandPadding;

    /**
    #### .gap(gapBetweenBars)
    Manually set fixed gap (in px) between bars instead of relying on the default auto-generated gap. By default bar chart
    implementation will calculate and set the gap automatically based on the number of data points and the length of the x axis.

    **/
    _chart.gap = function (_) {
        if (!arguments.length) return _gap;
        _gap = _;
        return _chart;
    };

    _chart.extendBrush = function () {
        var extent = _chart.brush().extent();
        if (_chart.round() && (!_centerBar || _alwaysUseRounding)) {
            extent[0] = extent.map(_chart.round())[0];
            extent[1] = extent.map(_chart.round())[1];

            _chart.chartBodyG().select(".brush")
                .call(_chart.brush().extent(extent));
        }

        return extent;
    };

    /**
    #### .alwaysUseRounding([boolean])
    Set or get the flag which determines whether rounding is enabled when bars are centered (default: false).
    If false, using rounding with centered bars will result in a warning and rounding will be ignored.
    This flag has no effect if bars are not centered.

    When using standard d3.js rounding methods, the brush often doesn't align correctly with centered bars since the bars are offset.
    The rounding function must add an offset to compensate, such as in the following example.
    **/
    _chart.alwaysUseRounding = function (_) {
        if (!arguments.length) return _alwaysUseRounding;
        _alwaysUseRounding = _;
        return _chart;
    };

    _chart.barLabels = function (_) {
        if (!arguments.length) return _chart._barLabels;
        _chart._barLabels = _;
        return _chart;
    };

    _chart.labelFormatter = function (_) {
        if (!arguments.length) return _chart._labelFormatter;
        _chart._labelFormatter = _;
        return _chart;
    };

    function colorFilter(color,inv) {
        return function() {
            var item = d3.select(this);
            var match = item.attr('fill') == color;
            return inv ? !match : match;
        };
    }

    _chart.legendHighlight = function (d) {
        if(!_chart.isLegendableHidden(d)) {
            _chart.g().selectAll('rect.bar')
                .classed('highlight', colorFilter(d.color))
                .classed('fadeout', colorFilter(d.color, true));
        }
    };

    _chart.legendReset = function () {
        _chart.g().selectAll('rect.bar')
            .classed('highlight', false)
            .classed('fadeout', false);
    };

    _chart.yAxisMax = function () {
        var max = d3.max(_chart.groups(), function (e) {
            var groupmax = d3.max(e.dimgroup.all(), function(d){
                return e.accessor( d );
            });
            return groupmax;
        });
        return max;
    };

    dc.override(_chart, "xAxisMax", function() {
        var max = this._xAxisMax();
        if('resolution' in _chart.xUnits()) {
            var res = _chart.xUnits().resolution;
            max += res;
        }
        return max;
    });

    return _chart.anchor(parent, chartGroup);
}

/**
## Row Chart

Includes: [Cap Mixin](#cap-mixin), [Margin Mixin](#margin-mixin), [Color Mixin](#color-mixin), [Base Mixin](#base-mixin)

Concrete row chart implementation.

#### dc.rowChart(parent[, chartGroup])
Create a row chart instance and attach it to the given parent element.

Parameters:

* parent : string - any valid d3 single selector representing typically a dom block element such as a div.
* chartGroup : string (optional) - name of the chart group this chart instance should be placed in. Once a chart is placed in a certain chart group then any interaction with such instance will only trigger events and redraw within the same chart group.

Return a newly created row chart instance

**/
dc.multiRowChart = function (parent, chartGroup) {

    var _g;

    var _labelOffsetX = 10;
    var _labelOffsetY = 15;
    var _labelCenterY = false;

    var _titleLabelOffsetX = 2;

    var _gap = 0.02;

    var _fixedBarHeight = false;
    var _rowGroupCssClass = "row-group";
    var _rowCssClass = "row";
    var _valLabelCssClass = "value-label";
    var _renderTitleLabel = false;

    var _chart = dc.multiGroupMixin(dc.capMixin(dc.marginMixin(dc.colorMixin(dc.baseMixin({})))));

    var _x;

    var _elasticX;

    var _xAxis = d3.svg.axis().orient("bottom");

    var _rowData;

    _chart.rowsCap = _chart.cap;

    _chart._titleLabelFormatter = function(d){ return d; };

    function calculateAxisScale() {
        if (!_x || _elasticX) {

            var max = d3.max(_chart.groups(), function (e) {
                var groupmax = d3.max(e.dimgroup.all(), function(d){
                    return e.accessor( d );
                });
                return groupmax;
            });

            _x = d3.scale.linear().domain([0, max])
                .range([0, _chart.effectiveWidth()]);
        }
        _xAxis.scale(_x);
    }

    function maxTitleLabelWidth(data){
        var
            ret    = -1,
            widths = new Array();

        _chart.dimension().group().all().forEach(function(v, k){
            widths.push( 5.5 * _chart._titleLabelFormatter(v.value).length );
        });
        ret = d3.max(widths);

        return ret;
    }

    function calculateLabelOffsetY(obj){
        var offset = 0;
        if(_labelCenterY){
            offset = calculateRowHeight() / 2 + obj.getBBox().height / 2 - 2.5;
        }
        else {
            offset = _labelOffsetY;
        }
        return offset;
    }

    function calculateRowHeight() {
        var
            n      = _rowData.length * _chart.dimension().group().all().length,
            height = 0;

        if (!_fixedBarHeight) {
            height  = _chart.effectiveHeight() / n;
            height *= 1 - _chart.groupGap();
            height *= 1 - _chart.gap();
        }
        else {
            height = _fixedBarHeight;
        }
        return height;
    }

    function drawAxis() {
        var axisG = _g.select("g.axis");

        calculateAxisScale();

        if (axisG.empty())
            axisG = _g.append("g").attr("class", "axis")
                .attr("transform", "translate(0, " + _chart.effectiveHeight() + ")");

        dc.transition(axisG, _chart.transitionDuration())
            .call(_xAxis);
    }

    _chart._doRender = function () {
        _chart.resetSvg();

        _g = _chart.svg()
            .append("g")
            .attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")");

        drawChart();

        return _chart;
    };

    _chart.title(function (d) {
        return _chart.cappedKeyAccessor(d) + ": " + _chart.cappedValueAccessor(d);
    });

    _chart.label(_chart.cappedKeyAccessor);

    _chart.x = function(x){
        if(!arguments.length) return _x;
        _x = x;
        return _chart;
    };

    function drawGridLines() {
        _g.selectAll("g.tick")
            .select("line.grid-line")
            .remove();

        _g.selectAll("g.tick")
            .append("line")
            .attr("class", "grid-line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", function () {
                return -_chart.effectiveHeight();
            });
    }

    function drawChart() {
        _rowData = _chart.groups();

        var groupValues = _chart.dimension().group().all();

        var rowGroups = _g.selectAll("g." + _rowGroupCssClass)
            .data(groupValues);

        drawAxis();
        drawGridLines();

        createElements(rowGroups);
        removeElements(rowGroups);
        updateElements(rowGroups);
    }

    function createElements(rowGroups) {

        var rowGroupsEnter = rowGroups.enter()
            .append("g")
            .attr("class", function (d, i) {
                return _rowGroupCssClass + " _" + i;
            });

        rowGroups.each(function (d, i) {
            var rowGroup = d3.select(this);
            rowGroup
                .attr("transform", function(d, j){
                    var groupHeight = _chart.effectiveHeight() / _chart.dimension().group().all().length;
                    var y           = i * groupHeight + 0.5 * _chart.groupGap() * groupHeight;
                    return "translate(0, " + y + ")";
                });
            createRows(rowGroup, i);

        });
        createLabels(rowGroupsEnter);
        updateLabels(rowGroupsEnter);
    }

    function createRows(rowGroup, gIdx){

        var data = Array();
        var barHeight = calculateRowHeight();

        _rowData.forEach(function(g, i){
            var row = {};
            row.accessor = g.accessor;
            row.data     = g.dimgroup.all()[gIdx];
            data.push(row);
        });

        var rows = rowGroup.selectAll("g." + _rowCssClass).data(data),
            rowEnter = rows.enter();

        rowEnter.append("g")
            .attr("class", function (d, i){
                return _rowCssClass + " _" + i;
            })
            .on("click", onClick)
            .append("rect")
                .attr("class", "row-bar")
                .attr("width", 0)
                .attr("y", function(d, i){
                    return (barHeight * (1 + _chart.gap()) ) * i ;
                })
                .attr("height", barHeight)
                .attr("fill", function(d, i){
                    return _chart.colors()(i);
                });
    }

    function removeElements(rowGroups) {
        rowGroups.exit().remove();
    }

    function updateElements(rowGroups) {

        var rect = _g.selectAll("rect.row-bar")
            .classed("deselected", function (d) {
                return (_chart.hasFilter()) ? !isSelectedRow(d) : false;
            })
            .classed("selected", function (d) {
                return (_chart.hasFilter()) ? isSelectedRow(d) : false;
            });

        dc.transition(rect, _chart.transitionDuration())
            .attr("width", function (d) {
                var start = _x(0) == -Infinity ? _x(1) : _x(0);
                return Math.abs(start - _x(d.accessor(d.data)));
            });

        //createTitles(rows);
        //updateLabels(rows);
    }

    function createTitles(rows) {
        if (_chart.renderTitle()) {
            rows.selectAll("title").remove();
            rows.append("title").text(_chart.title());
        }
    }

    function createLabels(rowGroupsEnter) {

        var rowHeight = calculateRowHeight();

        if (_chart.renderLabel()) {
            rowGroupsEnter.append("text")
                .attr("class", function (d, i) {
                    return _rowCssClass + " row-label _" + i;
                })
                .attr("text-anchor", "end")
                .attr("x", -_labelOffsetX)
                .text(function(d){
                    return _chart.label()(d);
                });
        }

        if (_chart.renderTitleLabel() && rowHeight >= 10) {
             rowGroupsEnter.selectAll("g.row").append("text")
                .attr("class", function (d, i) {
                    return _valLabelCssClass + " _" + i;
                })
                .text("0")
                .attr("text-anchor", "start")
                .attr("data-prevvalue", function(d){
                    return d.accessor(d.data);
                })
                .attr("x", _labelOffsetX)
                //.on("click", onClick);
                .on("click", function(){
                    console.log(this);
                });
        }

    }

    function updateLabels() {

        var rowGroups = _chart.selectAll(".row-group")[0];
        var rows      = _g.selectAll("g.row");
        var rowHeight = calculateRowHeight();

        if (_chart.renderLabel()) {
            rowGroups.forEach(function(g, i){
                d3.select(g).selectAll(".row-label")
                    .attr("y", function(){
                        var y = rowHeight / 2 * _rowData.length + this.getBBox().height / 2 - 2.5;
                        return y;
                    });
            });
        }

        if (_chart.renderTitleLabel() && rowHeight >= 10 ) {

            var titlelab = rows.select("text.value-label")
                .text(function (d, i) {
                    return _chart.titleLabelFormatter()(d.accessor(d.data));
                });

                rowGroups.forEach(function(g, i){
                    var rows = d3.select(g).selectAll("g.row")
                    rows[0].forEach(function(r, j){
                        var label = d3.select(r).select("text");
                        label.attr("y", function(){
                            return ( j * rowHeight * (1 + _gap) ) + ( rowHeight + this.getBBox().height ) / 2 - 2.5;
                        });
                    });
                });

            dc.transition(titlelab, _chart.transitionDuration())
                .attr("x", function(d){
                    var ret = _chart.x()(_chart.valueAccessor()(d.data)) + _labelOffsetX;
                    ret = d3.max([_labelOffsetX, ret]);
                    ret = d3.min([_chart.effectiveWidth() - maxTitleLabelWidth(_rowData) - _labelOffsetX, ret]);
                    return ret;
                })
                .tween("text", function(d) {
                    var
                        start,
                        end,
                        i;

                    start = d3.select(this).attr("data-prevvalue");
                    end   = _chart.valueAccessor()(d.data);
                    i     = d3.interpolate(start, end);
                    return function(t) {
                        this.textContent = _chart.titleLabelFormatter()( i(t) );
                    };
                })
               .each("end", function(d){
                    d3.select(this).attr("data-prevvalue", function(d){
                        return d.accessor(d.data);
                    });
                });
        }
    }

    /**
    #### .renderTitleLabel(boolean)
    Turn on/off Title label rendering (values) using SVG style of text-anchor 'end'

    **/
    _chart.renderTitleLabel = function (_) {
        if (!arguments.length) return _renderTitleLabel;
        _renderTitleLabel = _;
        return _chart;
    };

    _chart.titleLabelFormatter = function (_) {
        if (!arguments.length) return _chart._titleLabelFormatter;
        _chart._titleLabelFormatter = _;
        return _chart;
    };

    function onClick(d) {
        _chart.onClick(d.data);
    }

    function translateX(d) {
        var x = _x(_chart.cappedValueAccessor(d)),
            x0 = _x(0),
            s = x > x0 ? x0 : x;
        return "translate("+s+",0)";
    }

    _chart._doRedraw = function () {
        drawChart();
        return _chart;
    };

    /**
    #### .xAxis()
    Get the x axis for the row chart instance.  Note: not settable for row charts.
    See the [d3 axis object](https://github.com/mbostock/d3/wiki/SVG-Axes#wiki-axis) documention for more information.

    **/
    _chart.xAxis = function () {
        return _xAxis;
    };

    /**
    #### .fixedBarHeight([height])
    Get or set the fixed bar height. Default is [false] which will auto-scale bars.
    For example, if you want to fix the height for a specific number of bars (useful in TopN charts) 
    you could fix height as follows (where count = total number of bars in your TopN and gap is your vertical gap space).  
    **/
    _chart.fixedBarHeight = function (g) {
        if (!arguments.length) return _fixedBarHeight;
        _fixedBarHeight = g;
        return _chart;
    };

    /**
    #### .fixedBarHeight([height])
    Get or set the fixed bar height. Default is [false] which will auto-scale bars.
    For example, if you want to fix the height for a specific number of bars (useful in TopN charts) 
    you could fix height as follows (where count = total number of bars in your TopN and gap is your vertical gap space).  
    **/
    _chart.fixedBarHeight = function (g) {
        if (!arguments.length) return _fixedBarHeight;
        _fixedBarHeight = g;
        return _chart;
    };    

    /**
    #### .gap([gap])
    Get or set the vertical gap space between rows on a particular row chart instance. Default gap is 5px;

    **/
    _chart.gap = function (g) {
        if (!arguments.length) return _gap;
        _gap = g;
        return _chart;
    };

    /**
    #### .elasticX([boolean])
    Get or set the elasticity on x axis. If this attribute is set to true, then the x axis will rescle to auto-fit the data
    range when filtered.

    **/
    _chart.elasticX = function (_) {
        if (!arguments.length) return _elasticX;
        _elasticX = _;
        return _chart;
    };

    /**
    #### .labelOffsetX([x])
    Get or set the x offset (horizontal space to the top left corner of a row) for labels on a particular row chart. Default x offset is 10px;

    **/
    _chart.labelOffsetX = function (o) {
        if (!arguments.length) return _labelOffsetX;
        _labelOffsetX = o;
        return _chart;
    };

    /**
    #### .labelOffsetY([y])
    Get or set the y offset (vertical space to the top left corner of a row) for labels on a particular row chart. Default y offset is 15px;

    **/
    _chart.labelOffsetY = function (o) {
        if (!arguments.length) return _labelOffsetY;
        _labelOffsetY = o;
        return _chart;
    };

    _chart.labelCenterY = function (o) {
        if (!arguments.length) return _labelCenterY;
        _labelCenterY = o;
        return _chart;
    }; 

    /**
    #### .titleLabelOffsetx([x])
    Get of set the x offset (horizontal space between right edge of row and right edge or text.   Default x offset is 2px;

    **/
    _chart.titleLabelOffsetX = function (o) {
        if (!arguments.length) return _titleLabelOffsetX;
        _titleLabelOffsetX = o;
        return _chart;
    };

    function isSelectedRow (d) {
        return _chart.hasFilter(_chart.cappedKeyAccessor(d.data));
    }

    return _chart.anchor(parent, chartGroup);
};