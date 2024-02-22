var width = 600,
    height = 600;

var color = d3.scale.category20();

var dist = (width + height) / 4;

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(dist)
    .size([width, height]);

function getrank(rval) {
  return (rval/2.0) + 3;
}

function getcolor(rval) {
  return color(rval);
}

var svg = d3.select("#chart").append("svg")
    .attr("width", width)
    .attr("height", height);

function loadData(json) {
  force
      .nodes(json.nodes)
      .links(json.links);

    var k = Math.sqrt(json.nodes.length / (width * height));

    force
        .charge(-10 / k)
        .gravity(100 * k)
        .start();

  // Add links with arrows
  var arrow = svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

  var links = svg.selectAll(".link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); })
        .attr("marker-end", "url(#end)"); // Add arrow to the end of each link

  var nodes = svg.selectAll(".node")
        .data(json.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return getrank(d.rank) * 1.5; } )  // Increase the size of the circles
        .style("fill", function(d) { return getcolor(d.rank); })
        .on("dblclick",function(d) { 
            if ( confirm('Do you want to open '+d.url) ) 
                window.open(d.url,'_new',''); 
            d3.event.stopPropagation();
        })
        .call(force.drag);

  // Add probability text
  var probText = svg.selectAll(".prob")
      .data(json.nodes)
      .enter().append("text")
      .attr("class", "prob")
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .style("fill", "white")
      .style("font-size", "10px") // Set the font size to 10px
      .text(function(d) { return d.rank.toFixed(1); }); // Display probability

  nodes.append("title")
      .text(function(d) { return d.url; });

  force.on("tick", function() {
    links.attr("x1", function(d) { return d.source.x; })
         .attr("y1", function(d) { return d.source.y; })
         .attr("x2", function(d) { return d.target.x; })
         .attr("y2", function(d) { return d.target.y; });

    nodes.attr("cx", function(d) { return d.x; })
         .attr("cy", function(d) { return d.y; });

    // Position probability text within each node
    probText.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; });
  });
}
loadData(spiderJson);
