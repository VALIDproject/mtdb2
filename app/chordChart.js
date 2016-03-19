/**
 * Initializes the chord chart and implements the method for updating it.
 */
exports.init = function(){
  var size = [700, 700]; // SVG SIZE WIDTH, HEIGHT
  var marg = [30, 30, 30, 30]; // TOP, RIGHT, BOTTOM, LEFT
  var dims = []; // USABLE DIMENSIONS
  dims[0] = size[0] - marg[1] - marg[3]; // WIDTH
  dims[1] = size[1] - marg[0] - marg[2]; // HEIGHT

  var colors = d3.scale.ordinal()
    .range(['#9C6744','#C9BEB9','#CFA07E','#C4BAA1','#C2B6BF','#121212','#8FB5AA','#85889E','#9C7989','#91919C','#242B27','#212429','#99677B','#36352B','#33332F','#2B2B2E','#2E1F13','#2B242A','#918A59','#6E676C','#6E4752','#6B4A2F','#998476','#8A968D','#968D8A','#968D96','#CC855C', '#967860','#929488','#949278','#A0A3BD','#BD93A1','#65666B','#6B5745','#6B6664','#695C52','#56695E','#69545C','#565A69','#696043','#63635C','#636150','#333131','#332820','#302D30','#302D1F','#2D302F','#CFB6A3','#362F2A']);

  var chord = d3.layout.chord()
    .padding(0.02)
    .sortSubgroups(d3.ascending);

  var matrix = require('matrixFactory').chordMatrix()
    .layout(chord)
    .filter(function (item, r, c) {
      return (item.source === r.name && item.target === c.name) ||
             (item.source === c.name && item.target === r.name);
    })
    .reduce(function (items, r, c) {
      var value;
      if (!items[0]) {
        value = 0;
      } else {
        value = items.reduce(function (m, n) {
          if (r === c) {
            return m + n.euro;
          } else {
            return m + (n.source === r.name ? n.euro: n.euro);
          }
        }, 0);
      }
      return {value: value, data: items};
    });

  var innerRadius = (dims[1] / 2) - 100;

  var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 10);

  var path = d3.svg.chord()
    .radius(innerRadius);

  var svg = d3.select("#chord-chart").append("svg")
    .attr("class", "chart")
    .attr({width: size[0] + "px", height: size[1] + "px"})
    .attr("preserveAspectRatio", "xMinYMin")
    .attr("viewBox", "0 0 " + size[0] + " " + size[1]);

  var container = svg.append("g")
    .attr("class", "container")
    .attr("transform", "translate(" + ((dims[0] / 2) + marg[3]) + "," + ((dims[1] / 2) + marg[0]) + ")");

  var messages = svg.append("text")
    .attr("class", "messages")
    .attr("transform", "translate(10, 10)")
    .text("Updating...");

  drawChords = function (dataDimension) {
    
    var numChords = 13;
    var entities = new Array();

    var sortedDim = dataDimension.top(Infinity).sort(function(a,b){
      return (b.euro - a.euro);
    });

    var data = new Array();
    var rest = {
          source : sourceRestId, 
          target : targetRestId,
          quarter : -1, // irrelevant
          year : -1,// irrelevant
          law : -1,// irrelevant
          euro : 0 // this needs to get added up
        };
    var useRest = false;

    for(var i = 0; i < sortedDim.length; i++) {
      s = sortedDim[i]; //reference!

      var iS = entities.indexOf(s.source) >= 0;
      var iT = entities.indexOf(s.target) >= 0;

      if(numChords <= 0) {
        if(!(iS && iT)) {
          rest.euro += s.euro;
          if(iS || iT) {
            var dS = jQuery.extend(true, {}, s); //deep copy!
            if(iS) {
              dS.target = targetRestId;
            }
            else {
              dS.source = sourceRestId;
            }
            data.push(dS);     
          } else {
            useRest = true;
          }
        } else {
          data.push(s);
        }
      }
      else {
        data.push(s);
        if(!iS)
          entities.push(s.source);
        if(!iT)
          entities.push(s.target);
        if(!iS || !iT)
          numChords--;
      }
    }

    if(useRest)
      data.push(rest);

    messages.attr("opacity", 0.9);
    messages.transition().duration(1000).attr("opacity", 0);

    matrix.data(data)
      .resetKeys()
      .addKeys(['source', 'target'])
      .update()

    var groups = container.selectAll("g.group")
      .data(matrix.groups(), function (d) { return +d._id; });
    
    var gEnter = groups.enter()
      .append("g")
      .attr("class", "group");

    gEnter.append("path")
      .attr("class", function (d) { return nodes[d._id].gov == 1 ? "chordLabelGov" : "chordLabelNonGov"; })
      .attr("d", arc)
      .on("click", groupClick)
      .on("mouseover", textMouseover)
      .on("mouseout", resetChords);

    gEnter.append("text")
      .attr("dy", ".35em")
      .on("click", groupClick)
      .on("mouseover", textMouseover)
      .on("mouseout", resetChords)
      .text(function (d) {
        return shortenLongName(nodes[d._id].name,20);
      });

    groups.select("path")
      .transition().duration(2000)
      .attrTween("d", matrix.groupTween(arc));

    groups.select("text")
      .transition()
      .duration(2000)
      .attr("transform", function (d) {
        d.angle = (d.startAngle + d.endAngle) / 2;
        var r = "rotate(" + (d.angle * 180 / Math.PI - 90) + ")";
        var t = " translate(" + (innerRadius + 14) + ")";
        return r + t + (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 
      })
      .attr("text-anchor", function (d) {
        return d.angle > Math.PI ? "end" : "begin";
      })
      .attr("class", function(d) { return nodes[d._id].gov == 1 ? "chordLabelGov" : "chordLabelNonGov"; });

    groups.exit().select("text").attr("fill", "orange");
    groups.exit().select("path").remove();

    groups.exit().transition().duration(1000)
      .style("opacity", 0).remove();

    var chords = container.selectAll("path.chord")
      .data(matrix.chords(), function (d) { return d._id; });

    chords.enter().append("path")
      .attr("class", "chord")
      .style("fill", function (d) {
        return colors(d.source.index);
      })
      .attr("d", path)
      .on("mouseover", chordMouseover)
      .on("mouseout", resetChords);

    chords.transition().duration(2000)
      .attrTween("d", matrix.chordTween(path));

    chords.exit().remove()

    function groupClick(d) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      dimChords(d);
      entry = matrix.read(d);
      id = +entry.gname;
      if(nodes[id].gov == 1 && id != sourceRestId) {
        if(legalTableFilter.indexOf(id) < 0)
        {
          legalTableFilter.push(id);
          legalDim.filterFunction(function(x){return legalTableFilter.indexOf(x) > -1;});      
          updateAll();
        }
      } else if(nodes[id].gov == 0 && id != targetRestId){
        if(mediaTableFilter.indexOf(id) < 0)
          mediaTableFilter.push(id);
          mediaDim.filterFunction(function(x){return mediaTableFilter.indexOf(x) > -1;});     
          updateAll();
      }
      resetChords();
    }

    function chordMouseover(d) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      dimChords(d);
      chordTooltip.style("opacity", 0.9);
      chordTooltipUpdate(matrix.read(d));
    }

    function textMouseover(d) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      dimChords(d);
      chordTooltip.style("opacity", 0.9);
      chordTooltipUpdate(matrix.read(d));
    }  

    function resetChords() {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      chordTooltip.style("opacity", 0);
      container.selectAll("path.chord").style("opacity",0.9);
    }

    function dimChords(d) {
      d3.event.preventDefault();
      d3.event.stopPropagation();
      container.selectAll("path.chord").style("opacity", function (p) {
        if (d.source) { // COMPARE CHORD IDS
          return (p._id === d._id) ? 0.9: 0.1;
        } else { // COMPARE GROUP IDS
          return (p.source._id === d._id || p.target._id === d._id) ? 0.9: 0.1;
        }
      });
    }
  }; // END DRAWCHORDS FUNCTION

  resizeChordChart = function() {
    var _width = $("#chord-chart").width();
    svg.attr({
      width: _width,
      height: _width / (size[0] / size[1])
    });
  }

  drawChords(legalDim);
  resizeChordChart();
}