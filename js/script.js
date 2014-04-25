// $(document).ready(function() {

  // setting css for elements
var windowHeight = window.innerHeight - 8;
var windowWidth = window.innerWidth - 8;

var borderWidth = 1;

var headerHeight = 0.07 * windowHeight;
if (headerHeight > 50) { headerHeight = 50; }

var headerFontSize = 0.05 * windowHeight;
if (headerFontSize > 36) { headerFontSize = 36; }

var headerFontSpacing = windowWidth * 0.0025;
if (headerFontSpacing > 3) { headerFontSpacing = 3; }

var topMargin = 0.02 * windowHeight;
if (topMargin > 10) { topMargin = 10; }

var divPadding = 0.01 * windowHeight;
if (divPadding > 8) { divPadding = 8; }


var rightWidth = 0.3 * windowWidth - (2 * divPadding);
if (rightWidth > 400 - (2 * divPadding)) { rightWidth = 400 - (2 * divPadding); }

var centerWidth = windowWidth - rightWidth - (4 * divPadding) - (4 * borderWidth);

var mainHeight = windowHeight - headerHeight - topMargin;
var dashboardHeight = mainHeight - (2 * divPadding) - (2 * borderWidth);
var optionsHeight = (mainHeight * 0.4) - (2 * divPadding) - (2 * borderWidth);
var navigatorHeight = mainHeight - optionsHeight - topMargin - (4 * divPadding) - (4 * borderWidth);

d3.select("#wrapper")
    .style("height", windowHeight + "px")
    .style("width", windowWidth + "px")
    .style("margin", "4px");
d3.select("#header")
    .style("font-size", headerFontSize + "px")
    .style("letter-spacing", headerFontSpacing + "px")
    .style("width", "96%")
    .style("height", headerHeight + "px")
    .style("vertical-align","middle")
    .style("background-color", "rgb(68,68,68)")
    .style("padding-left", "1%")
    .style("padding-right", "3%");
d3.select("#tree")
    .style("float", "left")
    .style("margin-top", topMargin + "px")
    .style("width", centerWidth + "px")
    .style("height", mainHeight + "px");
d3.select("#dashboard")
    .style("float", "left")
    .style("width", rightWidth + "px")
    .style("height", dashboardHeight + "px")
    .style("padding", divPadding + "px")
    .style("margin-top", topMargin + "px")
    .style("border", borderWidth + "px solid")
    .style("border-color", "rgb(229,150,54)")
    .style("background-color", "#fff");

//collapsing tree

  var margin = {top: 20, right: 120, bottom: 20, left: 120},
      width = 960 - margin.right - margin.left,
      height = 800 - margin.top - margin.bottom;
      
  var i = 0,
      duration = 750,
      root;

  var tree = d3.layout.tree()
      .size([height, width]);

  var diagonal = d3.svg.diagonal()
      .projection(function(d) { return [d.y, d.x]; });

  var svg = d3.select("#tree").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//global data vars
var data,
    time_data = [],
    subject_data = [];

//View Finder vars
//view finder based on: http://bl.ocks.org/mbostock/1667367

var margin = {top: 0, right: 0, bottom: 0, left: 0},
    margin2 = {top: 0, right: 0, bottom: 20, left: 0},
    width = ((document.getElementById("dashboard").offsetWidth) * 0.8) - margin.left - margin.right, //200 - margin.left - margin.right,
    height = ((document.getElementById("dashboard").offsetWidth) * 0.25) - margin.top - margin.bottom, //100 - margin.top - margin.bottom,
    height2 = ((document.getElementById("dashboard").offsetWidth) * 0.25) - margin2.top - margin2.bottom; //100 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%Y").parse;

var x = d3.time.scale().range([0, width]),
    x2 = d3.time.scale().range([0, width]),
    y = d3.scale.linear().range([height, 0]),
    y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
    xAxis2 = d3.svg.axis().scale(x2).orient("bottom"),
    yAxis = d3.svg.axis().scale(y).orient("left");

var brush = d3.svg.brush()
    .x(x2)
    .on("brush", brushed);

var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.years); })
    .y0(height2)
    .y1(function(d) { return y2(d.articles); });

var viewsvg = d3.select("#dashboard").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

viewsvg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var context = viewsvg.append("g")
    .attr("class", "context")
    .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


//load data for collapsing tree

  d3.json("/data/plos.json", function(error, flare) {
    console.log('flare', flare);
    root = flare;
    root.x0 = height / 2;
    root.y0 = 0;

    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    }

    root.children.forEach(collapse);
    update(root);
  });

  d3.select(self.frameElement).style("height", "800px");

  function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", 1e-6);

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", 4.5)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", 1e-6);

    nodeExit.select("text")
        .style("fill-opacity", 1e-6);

    // Update the links…
    var link = svg.selectAll("path.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links at the parent's previous position.
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          var o = {x: source.x0, y: source.y0};
          return diagonal({source: o, target: o});
        });

    // Transition links to their new position.
    link.transition()
        .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          var o = {x: source.x, y: source.y};
          return diagonal({source: o, target: o});
        })
        .remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

//load data for graphs
d3.json("data/articles.json", function(error, json) {
  if (error) return console.warn(error);

  data = json;
  update_data(data);
});

// function to update all the chart data
function update_data(data) {

  //create dictionaries with raw counts
  var time_dict = {},
      subject_dict = {};
  // time
  for (var key in data) {
    if ( !(data[key]['publication_date'] in time_dict) ) {
      time_dict[data[key]['publication_date']] = {articles: 0};
    }
    time_dict[data[key]['publication_date']].articles += 1;
  }

  console.log('time dict', time_dict);

  //turn dicts into list of dicts
  var objkeys = Object.keys(time_dict);
  console.log('obj', objkeys);
  while(time_data.length > 0) {
      time_data.pop();
  };
  for (var c=0; c<objkeys.length; c++) {
      time_data.push({
          name: objkeys[c],
          articles: time_dict[objkeys[c]].articles,
      });
    
    }


makeviewfinder();
histo = makehisto();

return histo;

}

//funtion for updating graphs from view finder
function update_graphs(time_view, date_range, histo) {

  // clearBox('chartContainer');

  var new_date = [];

  time_view.forEach(function(d) {
    temp = parseInt(String(d["years"]).slice(11,15));
    console.log('in', temp);
    if (temp >= date_range[0] && temp <= date_range[1]) {   //date_range.indexOf(temp) > -1
      new_date.push({"years":temp, "articles": d.articles});
    }
  });

  console.log(new_date);

  histo.data = new_date;
  histo.draw(1000);

}

// View Finder

function makeviewfinder() {

    time_view = [];
    time_data.forEach(function(d) {
            time_view.push({"years":d.name, "articles": d.articles});
    });


    time_view.forEach(function(d) {
        d.years = parseDate(String(d.years));
      });

    console.log("data",time_data);

    var xvals = [];
    var yvals = [];
    time_view.forEach(function(d) {
        xvals.push(d.years);
        yvals.push(d.articles);
    });

    console.log(time_view);

    x.domain(d3.extent(xvals));
    y.domain([0, d3.max(yvals)]);
    x2.domain(x.domain());
    y2.domain(y.domain());

    context.append("path")
      .datum(time_view)
      .attr("class", "area")
      .attr("d", area2);

    context.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

    context.append("g")
      .attr("class", "x brush")
      .call(brush)
    .selectAll("rect")
      .attr("y", -6)
      .attr("height", height2 + 7); 

}

//function for making histogram
function makehisto() {

    time_new = [];
    time_data.forEach(function(d) {
        time_new.push({"years":parseInt(d.name), "articles": d.articles});
    });

    console.log('histo', time_new);

    var histosvg = dimple.newSvg("#chartContainer", '80%', '33%');

      var myChart = new dimple.chart(histosvg, time_new);
      myChart.setBounds('20%', '30%', '75%', '30%');
      myChart.addCategoryAxis("x", "years");
      myChart.addMeasureAxis("y", "articles");
      myChart.addSeries("Channel", dimple.plot.bar);
      // myChart.addLegend(65, 10, 510, 20, "right");
      myChart.draw();
      return myChart;
}

//enables view finder brushing
function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  var date_range = [parseInt(String(brush.extent()[0]).slice(11,15)),parseInt(String(brush.extent()[1]).slice(11,15))];
  console.log(date_range);
  update_graphs(time_view, date_range, histo);
}


// });  