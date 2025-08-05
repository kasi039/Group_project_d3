import * as d3 from "https://cdn.skypack.dev/d3@7";

// Load the CSV
d3.csv("data/most_runs_in_ipl.csv", d3.autoType).then(data => {
  const svg = d3.select("#scatter");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 40, right: 20, bottom: 50, left: 60 };

  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d.Average))
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d.StrikeRate))
    .range([height - margin.bottom, margin.top]);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(8));

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).ticks(8));

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d.Average))
    .attr("cy", d => y(d.StrikeRate))
    .attr("r", 6)
    .attr("fill", "#007acc")
    .append("title")
    .text(d => `${d.Player}\nAvg: ${d.Average}\nSR: ${d.StrikeRate}`);

  // Add labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Batting Average");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Strike Rate");
});
