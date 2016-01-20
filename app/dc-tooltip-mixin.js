"use strict";

if (!dc.tooltipMixin) {

  dc.tooltipMixin = function (_chart) {

    if (_chart) {
      _chart.tip = function () {
        var selector = 'rect.bar,circle.dot,g.pie-slice path,circle.bubble,g.row rect';
        var svg = _chart.svg();
        var tip = d3.tip()
          .attr('class', 'myTooltip')
          .attr('id','filter-tooltip')
          .html(function (d) {
            if (d.data) {
              return _chart.title()(d.data);
            }

            return _chart.title()(d);
          });

        svg.selectAll('rect.bar,circle.dot,g.pie-slice path,circle.bubble,g.row rect').call(tip);
        svg.selectAll(selector).on('mouseover', tip.show).on('mouseleave', tip.hide);

        // remove standard tooltip
        svg.selectAll('title').remove();
      };

      _chart.tip();
    }

    return _chart;
  };
}
