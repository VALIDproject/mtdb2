/**
 * contains the definition and documentation of global variables
 */

/**
 * Path with filename and -end of the data base file to read.
 * 
 * @type {string}
 */
var sourceFileName = "data/data.csv";
/**
 * All final, unchangeable links (edges) between the nodes in the graph as D3 objects.
 * 
 * @type {array}
 * @property {number} links.source the legal entity
 * @property {number} links.target the media owner
 * @property {number} links.quarter in the transaction has happened.
 * @property {number} links.year in the transaction has happened.
 * @property {number} links.law acted upon or paragraph, respectively. (§2,§4,§31)
 * @property {number} links.euro amount of money.
 */
var links;
/**
 * All final, unchangeable nodes in this graph.
 * 
 * @type {array}
 * @property {string} nodes.name the name of the id. this can be a legal entity or a media owner
 * @property {bool} nodes.gov either it is a legal entity or not
 */
var nodes;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#bar-chart|dc.barChart} which shows the transfered money per quarter
 *
 * @type {dc.barChart}
 */
var timeBarChart;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#bar-chart|dc.barChart} which shows the transfered money per legal background
 *
 * @type {dc.barChart}
 */
var lawsBarChart;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#bar-chart|dc.barChart} which shows the number of relations of {@link links} from a legal entity to a media organisation. sorted by the amount of money on the x axis.
 *
 * @type {dc.barChart}
 */
var expensesBarChart;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#bar-chart|dc.barChart} which shows the number of relations of sources from a legal entity to a media organisation. sorted by the trend on the x axis.
 *
 * @type {dc.barChart}
 */
var trendBarChart;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#data-count|dc.dataCount} which shows the number selected legal entities.
 *
 * @type {dc.dataCount}
 */
var legalCount;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#data-count|dc.dataCount} which shows the number selected media organizations.
 
 * @type {dc.dataCount}
 */
var mediaCount;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#data-table|dc.data-table} which shows detailed information of the legal entities
 *
 * @type {dc.data-table}
 * @property {string} names the names of the legal entity
 * @property {number} relations the number of relations to media organisations
 * @property {number} sum the sum of the transfered money
 */
var legalTable;
/**
 * A {@link https://github.com/dc-js/dc.js/blob/master/web/docs/api-1.6.0.md#data-table|dc.data-table} which shows detailed information of the media organizations.
 *
 * @type {dc.data-table}
 * @property {string} names the names of the media organizations.
 * @property {number} relations the number of relations to legal entities.
 * @property {number} sum the sum of the transfered money
 */
var mediaTable;
/**
 * The {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-crossfilter|crossfilter} object containing all relations
 *
 * @type {crossfilter}
 * @see links
 */
var ndxLinks;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the legal entities.
 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var legalDim;
/**
 * A second {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the legal entities. We need two dimensions to filter on separate diagrams for the same dimension

 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var legalDim2;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the media organizations.
 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var mediaDim;
/**
 * A second {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the media organizations. We need two dimensions to filter on separate diagrams for the same dimension

 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var mediaDim2;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the legal background of the relations.
 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var lawsDim;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the quarter of the relations.
 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var timeDim;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} accessing the number of relations.
 *
 * @type {crossfilter.dimension}
 * @see links
 * @see ndxLinks
 */
var spendDim;

/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} grouping the legal dimension for total money and number of relations 
 *
 * @type {crossfilter.dimension.group}
 * @see legalDim
 * @property {number} count the number of relations to media organisations
 * @property {number} total the sum of the transfered money
 */
var groupedLegalDim;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} grouping the media dimension for total money and number of relations 
 *
 * @type {crossfilter.dimension.group}
 * @see mediaDim
 * @property {number} count the number of relations to legal entities
 * @property {number} total the sum of the transfered money
 */
var groupedMediaDim;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} grouping the time dimension for the transfered money
 *
 * @type {crossfilter.dimension.group}
 * @see legalDim
 */
var spendPerTime;
/**
 * A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} grouping the laws dimension for the transfered money
 *
 * @type {crossfilter.dimension.group}
 * @see legalDim
 */
var spendPerLaw;
/**
 * The binwidth of the expenses chart
 * 
 * @type {number}
 */
var binwidth;

/** The names of the quarters in the format: years*10 + quarter: e.g.: 20144 = year 2014 quarter 4
 * @type {array}
 */
var quarterNames;

/** The half of the quarters in the format: years*10 + quarter: e.g.: 20144 = year 2014 quarter 4
 * @type int
 * @see quarterNames
 */
var halfQuarter

/** Filter a {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension|crossfilter.dimension} for a string
 * @func textFilter
 * @param {crossfilter.dimension} dim - The dimension to filter
 * @param {string} q - The query to filter for
 */
var textFilter;
/** reset the specified search box by setting the value to empty and submitting it.
 * @func resetSearchBox
 *
 * @param {jQuery} id - The jQuery Object of the search box
 * @param {string} tableType - either "legal" or "media"
 */
var resetSearchBox;
/** If there is a filter in the media selection, show the interaction buttons "reset", "combine" and "remove" else not
 * @func showMediaSelectionInteraction
 *
 */
var showMediaSelectionInteraction;
/** If there is a filter in the legal selection, show the interaction buttons "reset", "combine" and "remove" else not
 * @func showLegalSelectionInteraction
 */
var showLegalSelectionInteraction;

/** Draws the chord diagram 
 * @func drawChords
 * @param {crossfilter.dimension} dim - The crossfilter dimension which is used to draw the chords
 */
var drawChords;
/** Resizes the already drawn chord chart by scaling the svg size.
 * @func resizeChordChart
 */
var resizeChordChart;
/** Updates the tooltip text of the chord diagram
 * @func chordTooltipUpdate
 * @param {array} data - containing the name the sum of the transfered money and the total sum of the transfered money of the legal entity
 */
var chordTooltipUpdate;
/** The id of the legal entity representing the rest of the legal entities in the chord diagram.
 * @type {number}
 */
var sourceRestId;
/** The id of the media organization representing the rest of the media organization in the chord diagram.
 * @type {number}
 */
var targetRestId;
/** Updates all charts (dc charts and non dc charts)
 * @func updateAll
 * @see dc.redrawAll()
 */
var updateAll;
/** Rescales all charts
 * @func rescaleAll
 */
var rescaleAll;
/** Removes all filters from all charts (dc charts and the table filters)
 * @func filterAll
 * @see dc.filterAll()
 */
var filterAll;

/** Delete all selected data entries. But save it to be able to restore it. 
 * @func
 * @see ndxLinks
 * @see legalTableFilter
 * @see mediaTableFilter
 * @see combinedObj
 */
var deleteData;
/** Combine all selected data entries to one data entry. But save it to be able to restore it. 
 * @func
 * @see ndxLinks
 * @see legalTableFilter
 * @see mediaTableFilter
 * @see combinedObj
 */
var combineData;
/** Array storing all combined and removed data entries to be able to restore them
 * @type {array}
 * @see combineData
 * @see deleteData
 * @property {string} id a unique hash of the data
 * @property {string} name the displayed name of the object
 * @property {array} added the newly added data (only with combining)
 * @property {array} removed the removed data
 * @property {string} type either "combine" or "remove"
 */
var combinedObj;
/** 
 * resolves the data of the given hash.
 * @func
 * @param {string} id the hash of the combined or removed data
 * @see deleteData
 * @see combineData
 */
var resolveCombineData;
/** Create a tag for every object in the {@link combinedObj} array in the div with the id "#combine-blocks"
 * @func
 * @see deleteData
 * @see combineData
 * @see combinedObj
 */
var showTags;

/** Own local styles for d3
 * @type {d3.local}
 */
var locale;
/** Format the the input as euros with a grouping of 3 and 2 decimal places and a euro sign. e.g.: 12.345,67
 * @func
 */
var formatEuro;
/** Format the the input as euros with a grouping of 3 and no decimal places and a euro sign (truncating). e.g.: 12.345€
 * @func
 */
var formatBigEuro;
/** Format the the input as percentage number by multiply with 100 and suffix with "%". e.g.: 12.345%
 * @func
 */
var formatPercent;
/** Format the the input as euros with a grouping of 3 and 1 decimal place and a euro sign but truncat it to "Tsd." € or "Mil. €". e.g.: 12,3 Tsd.€
 * @func
 */
var formatGuV;
/** Add the amount of money of the input value to the grouping object
 * @func
 * @param {object} p the grouping object containing: the count which gets increased by 1 and the total sum of transfered money which gets increased by the input v
 * @param {object} v the object to increase (only v.euro is used)
 * @return p the adjusted grouping object
 * @see initTotal
 * @see removeTotal
 * @see removeEmptyBins
 */
var addTotal;
/** Remove the amount of money of the input value from the grouping object
 * @func
 * @param {object} p the grouping object containing: the count which gets decreased by 1 and the total sum of transfered money which gets decreased by the input v
 * @param {object} v the object to decrease (only v.euro is used)
 * @return p the adjusted grouping object
 * @see initTotal
 * @see addTotal
 * @see removeEmptyBins
 */
var removeTotal;
/** Initializes the grouping object (count and total with 0)
 * @func
 * @return p the initialized grouping object
 * @see addTotal
 * @see removeTotal
 * @see removeEmptyBins
 */
var initTotal;

/** This function is called after creating a {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} and filters all values by the specified function. This is necessary because after adding and removing the same values, numerical errors lead to a not zero solution. (I use 1e-3 for a difference) 
 * @func
 * @param {crossfilter.dimension.group} The {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} that gets filtered
 * @param {function} filterFunction the function the sourceGroup gets filtered on
 * @return {crossfilter.dimension.group} A {@link https://github.com/square/crossfilter/wiki/API-Reference#wiki-dimension_group|crossfilter.dimension.group} that contains no empty values
 */
var removeEmptyBins;

/** Contains the name of the glyphicon for numerical ascending sorting
 * @type {string}
 */
var numericAscendingGlyph;
/** Contains the name of the glyphicon for numerical descending sorting
 * @type {string}
 */
var numericDescendingGlyph;
/** Contains the name of the glyphicon for ordinal ascending sorting
 * @type {string}
 */
var ordinalAscendingGlyph;
/** Contains the name of the glyphicon for ordinal descending sorting
 * @type {string}
 */
var ordinalDescendingGlyph;
/** Contains the current sorting status of the legal entities table
 * @type {Object}
 * @property {string} alphabet the glyph of the sorting of the first column (names)
 * @property {string} relation the glyph of the sorting of the second column (relations)
 * @property {string} sum the glyph of the sorting of the third column (sum)
 */
var legalTableSortingStatus;
/** Contains the current sorting status of the media organization table
 * @type {Object}
 * @property {string} alphabet the glyph of the sorting of the first column (names)
 * @property {string} relation the glyph of the sorting of the second column (relations)
 * @property {string} sum the glyph of the sorting of the third column (sum)
 */
var mediaTableSortingStatus;

/** Contains the functions on how to sort the table columns
 * @type {Object}
 * @property {function} alphabet sort by name
 * @property {function} relation sort by the count of relations
 * @property {function} sum sort by the total sum of money transfers
 */
var tableSorting;
/** How the legal table should be sorted ("alphabet", "relation" or "sum")
 * @type {string}
 * @see legalTableSortingStatus
 * @see tableSorting
 */
var legalTableSorting;
/** How the legal table should be ordered
 * @type {Object}
 * @see legalTableSortingStatus
 * @see tableSorting
 * @property {function} alphabet order the first column
 * @property {function} relation order the second column
 * @property {function} sum order the third column
 */
var legalTableOrdering;
/** How the media table should be sorted ("alphabet", "relation" or "sum")
 * @type {string}
 * @see legalTableSorting
 * @see tableSorting
 */
var mediaTableSorting;
/** How the media table should be ordered
 * @type {Object}
 * @see mediaTableSortingStatus
 * @see tableSorting
 * @property {function} alphabet order the first column
 * @property {function} relation order the second column
 * @property {function} sum order the third column
 */
var mediaTableOrdering;
/** Contains the keys of the selected entries in the legal table
 * @type {array}
 */
var legalTableFilter;
/** Contains the keys of the selected entries in the media table
 * @type {array}
 */
var mediaTableFilter;

/** shotens a long string to shorter representation
 * @func
 * @param {string} the long input string
 * @return {string} a shorter representation of that string
 */
var shortenLongName;

var tagTooltip;

var sparklineTooltip;

var filterTooltip;

var chordTooltip;

var TablePaging;

var legalTablePaging;

var mediaTablePaging;

var sourceToValue;

var quartalSelection;

var hasLocalStorage;

require('globalFunctions');

var App = {

  init: function init() {

    var nav = require('views/nav');
      $('body').prepend(nav);

  	var content = require('views/charts');
      $('.starter-template').append(content);

    require('charts').init(sourceFileName);      
  }
};

module.exports = App;
