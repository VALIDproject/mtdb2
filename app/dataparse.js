"use strict";

exports.parse = function(data) {

  var nodes = [];

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
          ri = i;

        if (nodes[i].name == d.MEDIUM_MEDIENINHABER)
          mi = i;
      }

      if (ri == -1)
      {// Create new entry
        nodes.push({
          name: d.RECHTSTRGER,
          gov: 1
        });
        ri = nodes.length - 1;
      }

      if (mi == -1)
      {// Create new entry
        nodes.push({
          name: d.MEDIUM_MEDIENINHABER,
          gov: 0
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