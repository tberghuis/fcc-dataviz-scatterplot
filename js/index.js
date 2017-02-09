import * as d3 from 'd3';
d3.tip = require("d3-tip");
import data from '../assets/cyclist-data.json';

var WIDTH = 1000, HEIGHT = 700;
var margin = {
    top: 10,
    right: 110,
    bottom: 50,
    left: 75
},
    width = WIDTH - margin.left - margin.right,
    height = HEIGHT - margin.top - margin.bottom;

// scales
// x axis, time, + - 0
// y axis, place, 0 - +
// xValue = finishDelayTimeSeconds (time of arrival after first place)
var xValue = function (d) { return d.Seconds - 2210; }
var yValue = function (d) { return d.Place; }

var xScale = d3.scaleLinear()
    .domain([d3.max(data, xValue) + 5, 0]) // +5 add some space
    .range([0, width]);

var yScale = d3.scaleLinear()
    .domain([1, d3.max(data, yValue) + 1])
    .range([0, height]);

var svg = d3.select('.chart').append("svg")
    .attr('width', WIDTH)
    .attr('height', HEIGHT);

var rootGroup = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

rootGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
        return xScale(xValue(d));
    })
    .attr("cy", function (d) {
        return yScale(yValue(d));
    })
    .attr("r", 5)
    .attr("class", d => d.Doping == "" ? "nodope" : "dope")
    .attr("data-place", function (d) {
        return yValue(d);
    });

rootGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .text(function (d) {
        return d.Name;
    })
    .attr("x", function (d) {
        return xScale(xValue(d));
    })
    .attr("y", function (d) {
        return yScale(yValue(d));
    })
    .attr("transform", "translate(10,+4)")
    .attr("data-place", function (d) {
        return yValue(d);
    });

// legend
var legend = rootGroup.append("g");

legend.append("circle")
    .attr("cx", function (d) {
        return 10;
    })
    .attr("cy", function (d) {
        return 10;
    })
    .attr("r", 10)
    .attr("fill", "red");

legend.append("circle")
    .attr("cx", function (d) {
        return 10;
    })
    .attr("cy", function (d) {
        return 40;
    })
    .attr("r", 10)
    .attr("fill", "green");

legend.append("text")
    .attr("x", function (d) {
        return 25;
    })
    .attr("y", function (d) {
        return 15;
    })
    .text("Alleged doper");

legend.append("text")
    .attr("x", function (d) {
        return 25;
    })
    .attr("y", function (d) {
        return 15 + 30;
    })
    .text("No doping allegations");

legend.selectAll("text").style("fill", "black");
legend.attr("transform", "translate(700,400)");

// axis
// bottom
var xAxis = d3.axisBottom(xScale);
rootGroup.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
rootGroup.append("text")
    .attr("transform",
    "translate(" + (width / 2) + " ," +
    (height + margin.top + 40) + ")")
    .style("text-anchor", "middle")
    .text("Seconds behind fastest time");

//left
rootGroup.append("g")
    .call(d3.axisLeft(yScale));

rootGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -60)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Ranking");

//tooltip
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function (d) {
        return `
            <div class="tooltip">
            <span class = 'name'>${d.Name}: ${d.Nationality}</span>
            <br/>Year: ${d.Year}, Time: ${friendlySeconds(d.Seconds)}<br/>
            <br/>${d.Doping}
            </div>
          `;
    });

function friendlySeconds(seconds) {
    return parseInt(seconds / 60) + ":" + seconds % 60;
}

rootGroup.append("g")
    .call(tip);

// mouseover
rootGroup.selectAll("[data-place]")
    .on("mouseover", d => {
        //text black
        rootGroup.select("text[data-place='" + d.Place + "']").style("fill", "black");
        //circle bigger
        rootGroup.select("circle[data-place='" + d.Place + "']").attr("r", 10);
        tip.show(d);
    })
    .on("mouseout", d => {
        rootGroup.select("text[data-place='" + d.Place + "']").style("fill", null);
        rootGroup.select("circle[data-place='" + d.Place + "']").attr("r", 5);
        tip.hide(d);
    })
    .on("click", function (d) {
        if (d.URL != "") {
            window.open(d.URL);
        }
    });
