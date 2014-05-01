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

//current level
var current_subject = ['\/Computer and information sciences'],
    current_depth = [0];

//bar charts
var s,
    histo,
    histo_y,
    maketopbar_y,
    maketopbar_x,
    top_level_bar;

//collapsing tree

  var margin = {top: 20, right: 50, bottom: 20, left: 50},
      width = ((document.getElementById("tree").offsetWidth) * 1) - margin.right - margin.left,
      height = ((document.getElementById("tree").offsetHeight) * 0.90) - margin.top - margin.bottom;
      
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
    date_range = [1900,2200],
    time_view,
    time_data = [],
    subject_data = [];

//View Finder vars
//view finder based on: http://bl.ocks.org/mbostock/1667367

var margin = {top: 0, right: 10, bottom: 0, left: 10},
    margin2 = {top: 0, right: 0, bottom: 20, left: 0},
    width = ((document.getElementById("dashboard").offsetWidth) * 0.85) - margin.left - margin.right, //200 - margin.left - margin.right,
    height = ((document.getElementById("dashboard").offsetHeight) * 0.10) - margin.top - margin.bottom, //100 - margin.top - margin.bottom,
    height2 = ((document.getElementById("dashboard").offsetHeight) * 0.10) - margin2.top - margin2.bottom; //100 - margin2.top - margin2.bottom;

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
    .on("brushend", brushed);

var area2 = d3.svg.area()
    .interpolate("monotone")
    .x(function(d) { return x2(d.years); })
    .y0(height2)
    .y1(function(d) { return y2(d.articles); });

var viewsvg = d3.select("#chartFinder").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

viewsvg.append("defs").append("clipPath")
    .attr("id", "clip")
  .append("rect")
    .attr("width", width)
    .attr("height", height);

var context = viewsvg.append("g")
    .attr("width", width)
    .attr("class", "context");
    //.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

//vars for word cloud

//controls color of words
var fill = d3.scale.ordinal()
  .range(colorbrewer.Blues[10]);



//load data for collapsing tree

  d3.json("/data/plos.json", function(error, flare) {
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

    //creating scale for sizing nodes
    var node_array = [];
    nodes.map(function(d) { node_array.push(d.count);});

    var maxval = d3.max(node_array);
    var minval = d3.min(node_array);
    var node_scale = d3.scale.sqrt().domain([minval, maxval]).range([4, 14]);

    console.log('max', maxval);
    console.log('min', minval);

    // Normalize for fixed-depth.
    nodes.forEach(function(d) { d.y = d.depth * 180; });

    // Update the nodes…
    var node = svg.selectAll("g.node")
        .data(nodes, function(d) { return d.id || (d.id = ++i); });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("mouseover", mouseoverTree)
        .on("mouseout", mouseoutTree)
        .on("click", click);

    nodeEnter.append("circle")
        .attr("r", function(d) {return node_scale(d.count);}) //1e-6
        .style("fill", function(d) {console.log(d); return d._children ? "lightsteelblue" : "#fff"; });
        // .append("circle:title")
        // .text(function(d) { return 'Count: ' + d.count; });

    nodeEnter.append("text")
        .attr("x", function(d) { return d.children || d._children ? -17 : 12; })
        .attr("dy", ".35em")
        .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
        .text(function(d) { return d.name; })
        .style("fill-opacity", function(d) {return node_scale(d.count);});

    // Transition nodes to their new position.
    var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

    nodeUpdate.select("circle")
        .attr("r", function(d) {return node_scale(d.count);})
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
        .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();

    nodeExit.select("circle")
        .attr("r", function(d) {return node_scale(d.count);});

    nodeExit.select("text")
        .style("fill-opacity", function(d) {return node_scale(d.count);});

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

    //updating level for creating graphs
    if (current_depth.indexOf(d.depth)> -1) {
      if (d.depth === 0) {
        current_subject = [current_subject.shift()];
        current_depth = [current_depth.shift()];
      }
      else if (d.depth === current_depth[current_depth.length-1]) {
        current_subject.pop();
        current_subject.push(d.name);
      }
      else {
        current_subject = current_subject.slice(0, (d.depth));
        current_depth = current_depth.slice(0, (d.depth));
        current_subject.push(d.name);
      }
    }
    else {
      current_subject = current_subject.slice(0, (d.depth-1));
      current_depth.push(d.depth);
      current_subject.push(d.parent.name);
      current_subject.push(d.name);
    }
    update_data(data, current_subject);
  }

//load data for graphs
d3.json("data/articles.json", function(error, json) {
  if (error) return console.warn(error);

  data = json;
  update_data(data, current_subject);
});

//mousoever tool tip for tree
function mouseoverTree(d, i) {
  d3.select(this)
      .select("circle")
      .style("stroke", "steelblue")
      .style("stroke-width", "3px");

  d3.select("#tooltip")
      .style("visibility", "visible")
      .html("<span style='font-weight: bold; font-size: 120%'>" + d.name + "</span><br/># of articles:&nbsp;" + addCommas(d.count))
      .style("top", function () { return (d3.max([50,d3.event.pageY - 70]))+"px";})
      .style("left", function () { return (d3.max([0,d3.event.pageX - 70]))+"px";});
}

//mouseout tool tip for tree
function mouseoutTree(d, i) {
    d3.select(this)
        .select("circle")
        .style("stroke", "steelblue")
        .style("stroke-width", "1.5px");

    d3.select("#tooltip")
        .style("visibility", "hidden");
}

// function to update all the chart data
function update_data(data, current_subject) {

  //Write currently selected subject as title of Dashboard
  clearBox('dashtitle');
  var buttons = d3.select("#dashtitle").append("text")
    .style("font-size", "20px")
    .style("font-weight", "700")
    .style("display", "block")
    .style("margin", "auto")
    .style("text-align", "center")
    .style("color", '#000000')
    .style("text-decoration", "underline")
    .text(current_subject[current_subject.length-1]);

  //create dictionaries with raw counts
  var time_dict = {},
      subject_dict = {};
  // time
  for (var key in data) {

    if (current_subject.length < 2) {
      var level = current_subject;
    }
    else {
      var level = current_subject.join('\/');
    }

    var subj_leaf = data[key]['subj_leaf'],
        top = data[key]['subj_top'],
        subject = data[key]['subject'].join(''),
        regex = new RegExp(level);



    //test to see if the subject that was clicked on is a subject of the article.
    if (regex.test( subject )) {
      if ( !(data[key]['publication_date'] in time_dict) ) {
        time_dict[data[key]['publication_date']] = {articles: 0, subj_leaf: [], subj_top: {}};
      }
      time_dict[data[key]['publication_date']].articles += 1;
      time_dict[data[key]['publication_date']].subj_leaf.pushArray(subj_leaf);
      for (var i=0; i<top.length; i++) {
        var temp = top[i];
        if ( !(temp in time_dict[data[key]['publication_date']].subj_top) ) {
          time_dict[data[key]['publication_date']].subj_top[temp] = 0;
        }
        time_dict[data[key]['publication_date']].subj_top[temp]+=1;
      }
    }
  }

  //turn dicts into list of dicts
  var objkeys = Object.keys(time_dict);
  while(time_data.length > 0) {
      time_data.pop();
  };
  for (var c=0; c<objkeys.length; c++) {
      time_data.push({
          name: objkeys[c],
          articles: time_dict[objkeys[c]].articles,
          subj_leaf: time_dict[objkeys[c]].subj_leaf,
          subj_top: time_dict[objkeys[c]].subj_top,
      });
    
    }

if (typeof histo !== 'undefined') {
  update_graphs();
}
else {
  makeviewfinder();
  histo = makehisto();
  cloud = makewordcloud();
  top_level_bar = maketopbar();
}



}

//adds ability to easily add array items to another array.
Array.prototype.pushArray = function(arr) {
    this.push.apply(this, arr);
};

//funtion for updating graphs from view finder
function update_graphs() {

  var new_date = [],
      new_top_dict = {};

  time_data.forEach(function(d) {
    temp = parseInt(d.name);
    if (temp >= date_range[0] && temp <= date_range[1]) {   //date_range.indexOf(temp) > -1
      new_date.push({"years":temp, "articles": d.articles, "subj_leaf": d.subj_leaf, });

      for (var key in d.subj_top) {
        if ( !(key in new_top_dict) ) {
        new_top_dict[key] = 0;
        }
        new_top_dict[key]+=d.subj_top[key];
      }
    }
    
  });

  //word cloud draw
  clearBox('wordcloud');
  var new_cloud_dict = {};
  new_date.forEach(function(d) {
    d.subj_leaf.forEach(function(c){
      if ( !(c in new_cloud_dict) ) {
        new_cloud_dict[c] = {count: 0};
      }
      new_cloud_dict[c].count += 1;
    });
  });

  var sortable = [];
  for (var word in new_cloud_dict)
        sortable.push([word, new_cloud_dict[word].count]);
  sortable.sort(function(a, b) {return b[1] - a[1]});

  var word_slice = sortable.slice(0,40);

  create_words(word_slice);


  //histogram draw

  time_view = [];
  new_date.forEach(function(d) {
          time_view.push({"years":d.name, "articles": d.articles});
  });


  time_view.forEach(function(d) {
      d.years = parseDate(String(d.years));
    });

  // working on getting rid of rendering of removed bars
  // histo.data.forEach(function (d) { d.Value = 0; });
  // histo.draw(200);
  // s.afterDraw = function () {
  //   histo.data = new_date;
  //   s.afterDraw = null;
  //   histo.draw(1000);
  // };

  histo.data = new_date;
  histo.draw(1000);

  cleanAxis(histo_y, 2);

  //top subject graph draw
  new_top = [];
  for (var key in new_top_dict) {
      new_top.push({"subject": key, "count": new_top_dict[key]});
  }
  top_level_bar.data = new_top;
  top_level_bar.draw(1000);
  // Invoke the cleaning algorithm 
  cleanAxis(maketopbar_x, 2);

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


    var xvals = [];
    var yvals = [];
    time_view.forEach(function(d) {
        xvals.push(d.years);
        yvals.push(d.articles);
    });


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
      .attr("width", width)
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

    var maxY = d3.max(time_new.map(function(item) {return item.articles;}));


    var histosvg = dimple.newSvg("#chartHisto", '80%', '25%');

      var myChart = new dimple.chart(histosvg, time_new);
      myChart.setBounds('20%', '30%', '75%', '40%');
      var x = myChart.addCategoryAxis("x", "years");
      histo_y = myChart.addMeasureAxis("y", "articles");
      //y.overrideMax = maxY;
      s = myChart.addSeries(null, dimple.plot.bar);
      // myChart.addLegend(65, 10, 510, 20, "right");
      myChart.draw(1500);
      // Invoke the cleaning algorithm 
      cleanAxis(histo_y, 2);

      histosvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", ((document.getElementById("dashboard").offsetHeight) * 0.05))
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text("Num Articles per Year");

      return myChart;
}

// makes a bar graph of the top level subject areas and counts.
function maketopbar() {

    top_dict = {};
    time_data.forEach(function(d) {

      for (var key in d.subj_top) {
        if ( !(key in top_dict) ) {
        top_dict[key] = 0;
        }
        top_dict[key]+=d.subj_top[key];
      }
    });

    top_new = [];
    for (var key in top_dict) {
        top_new.push({"subject": key, "count": top_dict[key]});
    }

    // var maxY = d3.max(top_new.map(function(item) {return item.count;}));


    var histosvg = dimple.newSvg("#chartTop", '90%', '25%');

      var myChart = new dimple.chart(histosvg, top_new);
      myChart.setBounds('60%', '15%', '40%', '70%');
      maketopbar_x = myChart.addMeasureAxis("x", "count");
      maketopbar_y = myChart.addCategoryAxis("y", "subject");
      maketopbar_y.addOrderRule("count", false);
      // y.overrideMax = maxY;
      s = myChart.addSeries(null, dimple.plot.bar);
      // myChart.addLegend(65, 10, 510, 20, "right");
      myChart.draw(1500);
      // Invoke the cleaning algorithm 
      cleanAxis(maketopbar_x, 2);

      histosvg.append("text")
        .attr("x", (width / 2))             
        .attr("y", ((document.getElementById("dashboard").offsetHeight) * 0.02))
        .attr("text-anchor", "middle")  
        .style("font-size", "12px") 
        .style("text-decoration", "underline")  
        .text("Top Level Subject Areas");

      return myChart;
}

//function for making word cloud
function makewordcloud() {

  var cloud_dict = {};
  time_data.forEach(function(d) {
    d.subj_leaf.forEach(function(c){
      if ( !(c in cloud_dict) ) {
        cloud_dict[c] = {count: 0};
      }
      cloud_dict[c].count += 1;
    });
  });

  var sortable = [];
  for (var word in cloud_dict)
        sortable.push([word, cloud_dict[word].count]);
  sortable.sort(function(a, b) {return b[1] - a[1]});

  var word_slice = sortable.slice(0,40);

  create_words(word_slice);
}

function create_words(word_slice) {

  //creating a scale for the word cloud font size
  var count_array = [];
  word_slice.map(function(d) { count_array.push(d[1]);});

  var maxval = d3.max(count_array);
  var minval = d3.min(count_array);
  var word_scale = d3.scale.linear().domain([minval, maxval]).range([10, 40]);


  d3.layout.cloud().size([((document.getElementById("dashboard").offsetWidth) * 0.80), ((document.getElementById("dashboard").offsetHeight) * 0.33)])
    .words(word_slice.map(function(d) {
      return {text: d[0], size: word_scale(d[1])};
    }))
    .rotate(function() { return  0; })  //~~(Math.random() * 2) * 90 (for different orientations)
    .font("Impact")
    .fontSize(function(d) { return d.size; })
    .on("end", draw)
    .start();
  }


function draw(words) {
  //for keeping track of color change
  var counter = 0,
      w = ((document.getElementById("dashboard").offsetWidth) * 0.85),
      h = ((document.getElementById("dashboard").offsetHeight) * 0.35);
  d3.select("#wordcloud").append("svg")
      .attr("width", w)
      .attr("height", h)
    .append("g")
      .attr("transform", "translate(170," + (h * 0.5) + ")") 
    .selectAll("text")
      .data(words)
    .enter().append("text")
      .style("font-size", function(d) { return d.size + "px"; })
      .style("font-family", "Impact")
      //loops through colors the first 10 words are the darkest blue ect...
      .style("fill", function(d, i) { 
        if(i%5 === 0){counter++;} 
        return fill(counter); })
      .attr("text-anchor", "middle")
      .attr("transform", function(d) {
        return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
      })
      .text(function(d) { return d.text; });
}


//enables view finder brushing
function brushed() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());
  date_range = [parseInt(String(brush.extent()[0]).slice(11,15)),parseInt(String(brush.extent()[1]).slice(11,15))];
  update_graphs(time_view, date_range, histo, s);
}

// function for cleaning up y axis
// from: http://stackoverflow.com/questions/23305230/how-do-you-reduce-the-number-of-y-axis-ticks-in-dimple-js
// Pass in an axis object and an interval.
 var cleanAxis = function (axis, oneInEvery) {
     // This should have been called after draw, otherwise do nothing
     if (axis.shapes.length > 0) {
         // Leave the first label
         var del = false;
         // If there is an interval set
         if (oneInEvery > 1) {
            if (axis.shapes.selectAll("text")[0].length > 6) {
             // Operate on all the axis text
             axis.shapes.selectAll("text")
             .each(function (d) {
                 // Remove all but the nth label
                 if (del % oneInEvery !== 0) {
                     this.remove();
                     // Find the corresponding tick line and remove
                     axis.shapes.selectAll("line").each(function (d2) {
                         if (d === d2) {
                             this.remove();
                         }
                     });
                 }
                 del += 1;
             });
           }
         }
     }
 };

// use to clear divs for drawing of new graph 
function clearBox(elementID) {
  document.getElementById(elementID).innerHTML = "";
}

//add commas to numbers
function addCommas(nStr) {
    nStr += '';
    var x = nStr.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}


// });  