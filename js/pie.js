import * as d3 from "https://cdn.skypack.dev/d3@7";

// Team color map
const teamColors = {
  "RCB": "#da1818",
  "PBKS": "#d71920",
  "DC": "#17449b",
  "MI": "#045093",
  "CSK": "#f9cd05"
};

d3.csv("data/most_runs_in_ipl.csv", d3.autoType).then(data => {
  const svg = d3.select("#pie");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const radius = Math.min(width, height) / 2 - 40;

  const g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  // Aggregate runs by team
  const teamRuns = d3.rollup(
    data,
    v => d3.sum(v, d => d.Runs),
    d => d.Team
  );

  const pie = d3.pie()
    .value(d => d[1]);

  const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

  const arcs = pie(Array.from(teamRuns.entries()));

  // Draw slices
  g.selectAll("path")
    .data(arcs)
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", d => teamColors[d.data[0]] || "#ccc")
    .attr("stroke", "#fff")
    .attr("stroke-width", 2)
    .transition()
    .duration(800)
    .attrTween("d", function(d) {
      const i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
      return t => {
        d.endAngle = i(t);
        return arc(d);
      };
    });

  // Add labels
  g.selectAll("text")
    .data(arcs)
    .enter()
    .append("text")
    .attr("transform", d => `translate(${arc.centroid(d)})`)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(d => `${d.data[0]} (${d.data[1]})`)
    .style("font-size", "12px")
    .style("fill", "#000");
});
