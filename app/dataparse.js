"use strict";

exports.parse = function(data) {

  /**
   * All final, unchangeable nodes in this graph. The here documented properties are created by this visualization all others by D3.
   * 
   * @type {array}
   * @alias force#nodes
   * @memberof force
   * @property {string} force#nodes.name of an legal entity or media owner.
   * @property {number} force#nodes.overall of money spent or received.
   * @property {boolean} force#nodes.gov true if an legal entity, otherwise false and therefore a media owner node.
   * @see {@link https://github.com/mbostock/d3/wiki/Force-Layout#nodes|D3 force layout nodes}
   */
  var nodes = [];

  /**
   * All final, unchangeable links (edges) between the nodes in the graph as D3 objects. The here documented properties are created by this visualization all others by D3.
   * 
   * @type {array}
   * @alias force#links
   * @memberof force
   * @property {number} force#links.quarter in the transaction has happened.
   * @property {number} force#links.year in the transaction has happened.
   * @property {number} force#links.law acted upon or paragraph, respectively.
   * @property {number} force#links.euro amount of money.
   * @see {@link https://github.com/mbostock/d3/wiki/Force-Layout#links|D3 force layout links}
   */
  var links = [];

  // Since it is a csv file we have to format the data a bit
  data.forEach(function (d) {
        
    if (+d.LEERMELDUNG == 0)
    {
      var ri = -1;
      var mi = -1;

      d.EURO = parseFloat(d.EURO.replace(',', '.'));

      for (var i = 0; (ri == -1 || mi == -1) && i < nodes.length; i++)
      {
        if (d.EURO > 10000000) // Filter unrealistic values for Austria
          return;

        if (nodes[i].name == d.RECHTSTRGER)
        {
          ri = i;
          nodes[i].overall = nodes[i].overall + d.EURO;
        }

        if (nodes[i].name == d.MEDIUM_MEDIENINHABER)
        {
          mi = i;
          nodes[i].overall = nodes[i].overall + d.EURO;
        }
      }

      if (ri == -1)
      {// Create new entry
        nodes.push({
          name : d.RECHTSTRGER,
          overall : d.EURO,
          gov : 1,
        });
        ri = nodes.length - 1;
      }

      if (mi == -1)
      {// Create new entry
        nodes.push({
          name : d.MEDIUM_MEDIENINHABER,
          overall : d.EURO,
          gov : 0,
        });
        mi = nodes.length - 1;
      }

      links.push({// Return a link object with meta data
        source : ri, // Index of legal entity
        target : mi, // Index of media owner
        quarter : +d.QUARTAL.substring(4), // The quartal
        year : +d.QUARTAL.substring(0, 4), // The year
        law : +d.BEKANNTGABE, // Law number
        euro : d.EURO// Money value
      });
    }
  });

  return [nodes, links];
}