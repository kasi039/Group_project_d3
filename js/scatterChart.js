// js/scatterChart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function buildScatter(raw, filterCountry = null) {
  const svg = d3.select("#scatter").html(null);
  const W = 780, H = 600;
  const margin = { top: 60, right: 40, bottom: 80, left: 80 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  svg.attr("viewBox", [0, 0, W, H]);

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  let data = raw;
  if (filterCountry) {
    data = raw.filter(d => d.country === filterCountry);
  }

  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.strike_rate || 0) + 10])
    .range([0, innerW]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.average) + 10])
    .range([innerH, 0]);

  // Gridlines
  g.append("g")
    .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(""))
    .selectAll("line")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "2,2");

  g.append("g").call(d3.axisLeft(y));
  g.append("g").attr("transform", `translate(0,${innerH})`).call(d3.axisBottom(x));

  // Labels
  g.append("text")
    .attr("x", innerW / 2)
    .attr("y", innerH + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", 600)
    .text("Strike Rate");

  g.append("text")
    .attr("transform", `translate(${-60},${innerH / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", 600)
    .text("Batting Average");

  // Tooltip
  const tip = g.append("g").style("display", "none");
  tip.append("rect").attr("fill", "#fff").attr("stroke", "#333").attr("rx", 4).attr("ry", 4);
  const tipText = tip.append("text").attr("x", 4).attr("y", 14).style("font-size", "12px").style("font-weight", 600);

  // Circles
  g.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => x(d.strike_rate || 0))
    .attr("cy", d => y(d.average))
    .attr("r", 0)
    .attr("fill", d => d.format === "ODI" ? "#ff7f0e" : "#1f77b4")
    .attr("opacity", 0.8)
    .transition().duration(800)
    .attr("r", d => d3.scaleSqrt().domain([0, 100]).range([5, 20])(d.average));

  g.selectAll("circle")
    .on("mouseover", (ev, d) => {
      tipText.text(`${d.player} (${d.format}): ${d.average}`);
      const bb = tipText.node().getBBox();
      tip.select("rect").attr("width", bb.width + 8).attr("height", bb.height + 6);
      tip.attr("transform", `translate(${x(d.strike_rate || 0) - bb.width / 2},${y(d.average) - 30})`)
        .style("display", null);
    })
    .on("mouseout", () => tip.style("display", "none"));
}
// legend
const legend = d3.select("#scatter-legend").html(null);
["Test","ODI"].forEach(fmt=>{
  legend.append("span")
    .attr("class","box")
    .style("background", fmt==="ODI" ? "#ff7f0e" : "#1f77b4");
  legend.append("span")
    .text(fmt)
    .style("margin-right","12px");
});
