# Media Transparency Database Visualization
<small>188.943 Praktikum aus Visual Computing</small>
    
## Abstract

The "media transparency database" contains the accumulated amount of
money spent by governmental organizations on media companies. This data
can be explored as a multimodal dynamic network. Existing web projects
already present solutions to visualize the dataset, but to analyse the
data further a user needs more interaction methods. This project implements a 
task-tailored dashboard with multiple connected views, which implements
brushing and linking to enable the user to analyse the dataset
in an easy to use matter.

## Related Work

  The "media transparency database" is available since the third quarter 
  of 2012. Since then several visualizations got presented:

  -   [\[F. Lang\]](http://www.paroli-magazin.at/555/) presents a visualization that uses grouping of the media
      entities to reduce the screen space and complexity of
      the visualization. It only uses one quarter of one year of the
      total data. It is possible to interact with the visualization and
      ungroup the media entities.
  -   [\[M. Hametner\]](http://derstandard.at/2000017464403/Regierungsinserate-406-Millionen-im-ersten-Quartal) presents a static visualization with bar charts and a line
      plot as a visualization for time oriented data by the Austrian
      newspaper “Der Standard”.
  -   [\[M. Schrempf\]](http://web.student.tuwien.ac.at/~e0920136/Files/MTDV/src/MTDV.html) 
      implemented a force-directed node link diagram.
      The user of this visualization is able to interact with the data and
      filter it with different queries. But the force-directed node link
      diagram was too slow for the huge database.
  -   [\[P. Salhofer et. al\]](http://www.medien-transparenz.at/) implemented a website to get an overview of the
      media dataset. It features multiple visualizations which are all
      interactive but not connected to one dashboard.

The first two visualizations are presentations of an analysis of the
data. But the last two approaches are visualizations that support the
user to analyze and investigate into the data. The force directed node
link diagram has the problem that it is too slow to render a nice
overview of the dynamic network. Additionally it is hard to interpret
the payment flow, because it is visually encoded in the size of the
nodes of the diagram. 

The visualization of [\[P. Salhofer et. al\]](http://www.medien-transparenz.at/) is stable, easy and fast to interact. But
the visualizations are distributed onto 4 different web pages, which
makes it hard to combine the insight of the user from one visualization
with the others. Additionally the payment flow visualization is
restricted to only 800 relations. 

## Technologies

The following technologies are used:

 * _JavaScript_: a script language to create dynamic client side webpage.
 * [_Data-Driven Documents_](https://d3js.org/): A JavaScript library for manipulating documents based on data.
 * [_jQuery_](http://jquery.com/): A fast, small, and feature-rich JavaScript library.
 * [_Bootstrap_](http://getbootstrap.com/): A framework for developing responsive, mobile first projects on the web.
 * [_Brunch_](http://brunch.io/): A [node.js](https://nodejs.org) build tool to compile scripts and styles and to concatenate scripts and styles.
 * _clean-css_: Is a [node.js](https://nodejs.org) library for minifying CSS files.
 * _uglify-js_: Is a [node.js](https://nodejs.org) library for minifying JavaScript files.
 * [_crossfilter_](http://square.github.io/crossfilter/): Is a JavaScript library to explore multivariate datasets with coordinated views.
 * [_DC_](https://dc-js.github.io/dc.js/): Is a JavaScript library with native crossfilter support to create charts for multidimensional data exploration
 * [_Git_](https://git-scm.com/): Is used as version control system.

## Problem Description

Governmental advertisement in media and sponsorships are a possible way
to influence press opinion. Therefore, the Austrian parliament passed a
law that made it mandatory for governmental organizations to disclose
their expenses for advertisements in different media (TV, radio, print,
as well as online).

This so-called "media transparency database" is made publicly available
by the Austrian Regulatory Authority for Broadcasting and
Telecommunications ([RTR](https://www.rtr.at/de/m/veroeffentl_medkftg_daten)) via the Austrian open government data portal.

It contains the accumulated amount of money transferred in a
certain quarter of the year for each governmental organization and media
company. This database can be explored as a multimodal dynamic network.

### Data Structure

The media transparency database is structured as a Table with each row
containing a relation from one governmental organization
(*Rechtsträger*) to one media company (*Medium*). This
relation contains the amount of transfered money (*Euro*), the quarter
of the year (*Jahr Quartal*) and the law of the reason of the payment
(*Gesetz*).

The table contains over 145000 entries over 12 quarters. So that one
quarter contains 13000 data entries. There are over 1000 governmental
organizations and media companies.

The data quality of the database is not sufficient enough for some data
entries. These entries include spelling mistakes or are just differently
formated.

## Examples

### Dashboard
(Click on the image to go the the video)


[![Click on the image to go the the video](documentation/screenshots/dashboard.png)](https://youtu.be/53JBg1lmyDk)

### Filters

![](documentation/screenshots/quartale.png)
![](documentation/screenshots/recht.png)
![](documentation/screenshots/ausgaben.png)
![](documentation/screenshots/trend.png)

### Flow Visualization

![](documentation/screenshots/flow.png)

### Details

![](documentation/screenshots/media.png)
![](documentation/screenshots/legal.png)

## Source Code Documentation

### Install

The release build from the last tag is in the subfolder [``public``](public). Copy it onto a webserver and it should work. Or visit my [server](https://pfahler.at/mtdb2)

This project depends on [Brunch](http://brunch.io/). Install it with for example [node.js](nodejs.org). All depending libraries should be managed by brunch. If something is missing you have to install it manually with [node.js](nodejs.org).

1. install [node.js](nodejs.org)
2. install brunch globally:

```npm install -g brunch```

3. install local packages (if necessary):
 
```npm install --save-dev brunch javascript-brunch css-brunch sass-brunch queue-async```

### Run

__develop standard run__

```brunch build```

__develop run with server__

```brunch watch --server```

The standard port for the brunch server is 3333 (```localhost:3333```)

__release build__

```brunch build --production```

### Documentation of global variables

The source code documentation of global variables is in a seperate file: [application.js](app/application.js) I created a documentation file with [jsdoc](usejsdoc.org/) it is in [documentation/jsdoc](documentation/jsdoc/index.html) or online on my server: [https://pfahler.at/mtdb2/doc/](https://pfahler.at/mtdb2/doc/)

### Structure

The source code of this project is in the subfolder [``app``](app) this folder is structured as follow:

 * [``assets``](app/assets) the assets files that the project depends on. 
   For example the ``index.html``, the csv data, the used fonds, ...
 * [``styles``](app/styles) the style files of the project. 
   Currently ``less`` is used to translate the style files to a single css file. The filenames of the single files have to start with an ``_`` to be ignored by the ``brunch`` compiler. And in the file [``structure``](app/styles/structure.less) the single files are linked together.
 * [``views``](app/views) This folder contains the files that describe the dom structure of the view.
   * [``about.jade``](app/views/about.jade) contains a documentation of the project in markdown code
   * [``charts.jade``](app/views/charts.jade) contains the overall structure of the dashboard
   * [``chordChart.jade``](app/views/chordChart.jade) contains the structure of the chord chart: the tooltip and the chart itself.
   * [``contact.jade``](app/views/contact.jade) contains the contact information of the project
   * [``filters.jade``](app/views/filters.jade) contains the structure of the filters of the dashboard. For example the quartals bar chart, the legal background bar chart, ...
   * [``nav.jade``](app/views/nav.jade) contains the structure of the fixed navbar
   * [``table.jade``](app/views/table.jade) contains the structure of the two table widgets (legal and media entities), their count widgets and includes the chordChart.jade between them.
 * [``application.js``](app/application.js) contains the definition and documentation of all global variables. 
 * [``charts.js``](app/charts.js) initializes the application. 
 * [``chordChart.js``](app/chordChart.js) initializes the chord chart and implements the method for updating it.
 * [``data.js``](app/data.js) is responsible for initializing the data. 
    1) if a local storage is available it is used. 
    2) also the combined objects from a previous session is restored.
 * [``dataparse.js``](app/dataparse.js) parses the media transparence database data.
 * [``filterCharts.js``](app/filterCharts.js) methods for the initialization of the 4 filter charts.
 * [``globalFunction.js``](app/globalFunction.js) initializes the global functions of the application
 * [``listeners.js``](app/listeners.js) initializes the listeners for tooltips or the table.
 * [``dimensions.js``](app/dimensions.js) initializes the dimensions and the grouping of the dimensions.
 * [``matrixFactory.js``](app/matrixFactory.js) creates the matrix for the chord chart.
 * [``tables.js``](app/tables.js) initializes the tables and the functions for updating the tables

## Tutorials

### How to add a new Chart

  1.  Add a new dimension and group for a chart:

      This is done in the file [``dimensions.js``](app/dimensions.js):

      ```
      treeSourceDim = ndxLinks.dimension(function(d) {return +d.source});
      groupedTreeDim = removeEmptyBins(treeSourceDim.group().reduce(addTotal,removeTotal,initTotal),filterOutEmptyTotal);
      ```

      Look at the [_crossfilter_](http://square.github.io/crossfilter/) documentation for details.

  2.  Define where the chart should be:

      In the subfolder [``views``](app/views) the structure of the dashboard is defined. 
      Add the name of the new chart to the desired position. For example: [``filters.jade``](app/views/charts.jade)

      ```
      .row#my-treeMaps
        include treeMaps.jade
      ```

      To add a new row to the dashboard which includes a new jade file which defines a new chart. For example a tree map:

      ```
      .col-sm-6
        strong Rechtsträger
        a(href="javascript:legalTreeMap.filterAll();updateAll();",style="display: none;").reset reset
        .clearfix
        #legal-tree-map
      ```

  3.  Initialize the chart:

      It does not matter where you initialize it. For example in [``charts.js``](app/charts.js) after the initialization of the dimensions. If it is not a [_DC_](https://dc-js.github.io/dc.js/) chart, dont forget to define an update method and a resize method in [``application.js``](app/application.js).

  4.  Calls on update:
  
      If it is not a dc chart add the update call to the function ``updateAllNonDC`` in [``globalFunction.js``](app/globalFunction.js). In every case add the rescale call to ``rescaleAll`` in [``globalFunction.js``](app/globalFunction.js).

