(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var has = ({}).hasOwnProperty;

  var aliases = {};

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf('components/' === 0)) {
        start = 'components/'.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return 'components/' + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var expand = (function() {
    var reg = /^\.\.?(\/|$)/;
    return function(root, name) {
      var results = [], parts, part;
      parts = (reg.test(name) ? root + '/' + name : name).split('/');
      for (var i = 0, length = parts.length; i < length; i++) {
        part = parts[i];
        if (part === '..') {
          results.pop();
        } else if (part !== '.' && part !== '') {
          results.push(part);
        }
      }
      return results.join('/');
    };
  })();
  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
"use strict";

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @global
 * @type {string}
 * @memberof force
 */
var sourceFileName = "data/data20144.csv";

var App = {
  init: function init() {
    require('charts').init(sourceFileName);
    //dc.renderAll();
  }
};

module.exports = App;

});

require.register("charts", function(exports, require, module) {
exports.init = function(datafile) {

  var yearRingChart   = dc.pieChart("#chart-ring-year");

  var q = queue()
    .defer(d3.dsv(";", "text/csv"), datafile);

  q.await(initCharts);

  function initCharts(error, rawData) 
  {
    data = require('dataparse').parse(rawData);
    nodes = data[0];
    links = data[1];
    var ndxNodes = crossfilter(data);
    var ndxLinks = crossfilter(links);

    var yearDim  = ndxLinks.dimension(function(d) {return +d.year;});

    var spendPerYear = yearDim.group().reduceSum(function(d) {return +d.euro;});

    yearRingChart
      .width(200).height(200)
      .dimension(yearDim)
      .group(spendPerYear)
      .innerRadius(50);
  }
}
});

;require.register("dataparse", function(exports, require, module) {
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

  /**
   * Enables a rounding of all numbers.
   * 
   * @property {Number} rounds the number to two.
   * @this is the number to round.
   */
  Number.prototype.roundToTwo = function()
  {
    return Math.round(this * 100) / 100;
  }

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
          nodes[i].overall = (nodes[i].overall + d.EURO).roundToTwo();
        }

        if (nodes[i].name == d.MEDIUM_MEDIENINHABER)
        {
          mi = i;
          nodes[i].overall = (nodes[i].overall + d.EURO).roundToTwo();
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
    else
    {
      console.log("leermeldung " + d.MEDIUM_MEDIENINHABER);
    }
  });

  return [nodes, links];
}
});

;
//# sourceMappingURL=app.js.map