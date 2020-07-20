// Size and location of the chart
var svgWidth = 750;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
  
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// appending an svg group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params
var xindvar = "poverty";
var ydvar = "healthcare";

//update independent variable 
function xScale(corData, xindvar) {
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(corData, d => d[xindvar]) * 0.8,
      d3.max(corData, d => d[xindvar]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

// update dependent variable 
function yScale(corData, ydvar) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(corData, d => d[ydvar]) * 0.8,
      d3.max(corData, d => d[ydvar]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;
}

// xaxis units
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// yaxis units
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// points on chart
function renderCircles(circlesGroup, newXScale, xindvar, newYScale, ydvar) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[xindvar]))
    .attr("cy", d => newYScale(d[ydvar]));

  return circlesGroup;
}

// chart text
function renderCircleText(circlesText, newXScale, xindvar, newYScale, ydvar) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[xindvar]))
    .attr("y", d => newYScale(d[ydvar]));

  return circlesText;
}


// function used for updating circles group with new tooltip
function updateToolTip(xindvar, ydvar, circlesGroup) {

  var xlabel;
  var ylabel;
  // Conditional for X Axis.
  if (xindvar === "poverty") {
    xlabel = "In Poverty (%):";
  }
 
  else if (xindvar === "age") {
    xlabel = "Age (median):";
  }

  else {
    xlabel = "Household Income (median):";
  }
  // Conditional for Y Axis.
  if (ydvar === "healthcare") {
    ylabel = "Lacks Healthcare (%):";
  }
 
  else if (ydvar === "smokes") {
    ylabel = "Smokes (%):";
  }

  else {
    ylabel = "Obese (%):";
  }

  var toolTip=d3.tip()
    .attr("class", "tooltip")
    .style("background", "#288C93")
    .style("border-radius", "8px")
    .style("color", "white")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[xindvar]}<br>${ylabel} ${d[ydvar]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(corData, err) {
  if (err) throw err;

  // parse data
  corData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });
  
  // xLinearScale function above csv import
  var xLinearScale = xScale(corData, xindvar);

  // Create y scale function
  var yLinearScale = yScale(corData, ydvar);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(corData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[xindvar]))
    .attr("cy", d => yLinearScale(d[ydvar]))
    .attr("r", 12)
    .attr("fill", "purple")
    .attr("opacity", ".6");

  // append circle labels
  var circlesText = chartGroup.selectAll("text")
    .data(corData)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[xindvar]))
    .attr("y", d => yLinearScale(d[ydvar]))
    .style("font-size", "10px")
    .style("text-anchor", "middle")
    .style('fill', 'white');


  // Create group for x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // x-axis labels
  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for y-axis labels
  var ylabelsGroup = chartGroup.append("g");

  // y-axis labels
  var healthcareLabel = ylabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y",  -40 )
  .attr("x", 0 - (height/2))
  .attr("value", "healthcare") // value to grab for event listener
  .classed("active", true)
  .text("Lacks Healthcare (%)");

  var obeseLabel = ylabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y",  -60)
  .attr("x", 0 - (height/2))
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y",  -80)
  .attr("x", 0 - (height/2))
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  .text("Smokes (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(xindvar, ydvar, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

      if (value !== xindvar) {
        // replaces chosenXAxis with value
        xindvar = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(corData, xindvar);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, xindvar, yLinearScale, ydvar);

        // updates circle text with new x values
        circlesText = renderCircleText(circlesText, xLinearScale, xindvar, yLinearScale, ydvar);


        // updates tooltips with new info
        circlesGroup = updateToolTip(xindvar,ydvar, circlesGroup);        

        // changes classes to change bold text
        if (xindvar === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (xindvar === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", true)
          .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      }
    });

    // y axis labels event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

    if (value !== ydvar) { 


        // replaces chosenXAxis with value
        ydvar = value;


        // functions here found above csv import
        // updates x scale for new data
        yLinearScale = yScale(corData, ydvar);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, xindvar, yLinearScale, ydvar);

        // updates circle text with new x values
        circlesText = renderCircleText(circlesText, xLinearScale, xindvar, yLinearScale, ydvar);


        // updates tooltips with new info
        circlesGroup = updateToolTip(xindvar,yindvar, circlesGroup);

        // changes classes to change bold text
        if (ydvar === "obesity") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
        }
        else if (ydvar === "smokes") {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        }
        else {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        }
      } 

    });
}).catch(function(error) {
  console.log(error);
});