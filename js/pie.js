// js/pie.js
import * as d3 from "https://cdn.skypack.dev/d3@7";

// Team color map
const teamColors = {
  RCB: "#da1818",
  PBKS: "#d71920",
  DC:  "#17449b",
  MI:  "#045093",
  CSK: "#f9cd05"
};

d3.csv("data/most_runs_in_ipl.csv", d3.autoType).then(data => {
  const svg = d3.select("#pie").html(null);
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
  const entries = Array.from(teamRuns.entries()); 

  // Scales & layout
  const pie = d3.pie().value(d => d[1]).sort(null);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const arcs = pie(entries);

  // Tooltip
  const tip = g.append("g").attr("class", "pie-tooltip").style("display", "none");
  tip.append("rect");
  const tipText = tip.append("text").attr("x", 6).attr("y", 14).style("font-weight", 600);

  // State
  let selectedTeam = null; 

  // Helpers
  function color(team) { return teamColors[team] || "#ccc"; }
  function updateOpacity() {
    g.selectAll("path.slice")
      .attr("opacity", d => (selectedTeam && d.data[0] !== selectedTeam ? 0.25 : 1));
    d3.selectAll("#pie-legend .item")
      .style("opacity", d => (selectedTeam && d !== selectedTeam ? 0.4 : 1));
  }

  // Draw slices
  g.selectAll("path.slice")
    .data(arcs, d => d.data[0])
    .join(enter => enter.append("path")
      .attr("class", "slice")
      .attr("fill", d => color(d.data[0]))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .each(function(d){ this._current = { startAngle: d.startAngle, endAngle: d.startAngle }; })
      .transition().duration(800)
      .attrTween("d", function(d){
        const i = d3.interpolate(this._current, d);
        this._current = i(1);
        return t => arc(i(t));
      })
    );

  // Labels 
  g.selectAll("text.label")
    .data(arcs, d => d.data[0])
    .join("text")
      .attr("class", "label")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .text(d => d.data[0]);

  // Interactions
  g.selectAll("path.slice")
    .on("mousemove", function (ev, d) {
      const [team, runs] = d.data;
      tipText.text(`${team}: ${runs}`);
      const bb = tipText.node().getBBox();
      tip.select("rect").attr("width", bb.width + 12).attr("height", bb.height + 8).attr("fill", "#fff").attr("stroke", "#333").attr("rx",4).attr("ry",4);
      const [x, y] = arc.centroid(d);
      tip.attr("transform", `translate(${x - bb.width/2}, ${y - 30})`).style("display", null);
    })
    .on("mouseout", () => tip.style("display", "none"))
    .on("click", function (ev, d) {
      const team = d.data[0];
      selectedTeam = selectedTeam === team ? null : team;
      updateOpacity();
    });

  // Build legend
  const legendRoot = d3.select("#pie-legend").html(null);
  entries.forEach(([team]) => {
    const item = legendRoot.append("span").attr("class", "item").style("margin-right", "12px").style("cursor", "pointer");
    item.append("span").attr("class", "box").style("background", color(team)).style("margin-right", "6px");
    item.append("span").text(team);
    item.on("click", () => {
      selectedTeam = selectedTeam === team ? null : team;
      updateOpacity();
    });
  });

  // Title (optional)
  svg.append("text")
    .attr("x", width/2).attr("y", 24)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", 700)
    .text("IPL Runs by Team");
});
