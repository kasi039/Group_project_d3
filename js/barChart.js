// js/barChart.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function buildBar(raw, field = "total", onCountryClick) {
  const svg = d3.select("#bar").html(null);

  const W = 780, H = 600;
  const margin = { top: 40, right: 40, bottom: 80, left: 100 };
  const innerW = W - margin.left - margin.right;
  const innerH = H - margin.top - margin.bottom;
  svg.attr("viewBox", [0, 0, W, H]);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const maxVal = d3.max(raw, d => d[field]);
  const x = d3.scaleBand()
    .domain(raw.map(d => d.country))
    .range([0, innerW])
    .padding(0.25);
  const y = d3.scaleLinear()
    .domain([0, maxVal]).nice()
    .range([innerH, 0]);
  const colour = d3.scaleSequential()
    .domain([0, maxVal])
    .interpolator(d3.interpolateRainbow);

  // Gridlines
  g.append("g")
    .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(""))
    .selectAll("line")
    .attr("stroke", "#ddd")
    .attr("stroke-dasharray", "2,2");

  // Axes
  g.append("g").call(d3.axisLeft(y));
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${innerH})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-25)");

  // Axis labels
  g.append("text")
    .attr("class", "axis-label")
    .attr("x", -innerH / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", 600)
    .text(field === "total" ? "Total ICC Trophies" :
      {
        odi_wc: "ODI WC wins",
        t20_wc: "T20 WC wins",
        champions_trophy: "Champions Trophy",
        wts: "World Test Series"
      }[field]
    );

  g.append("text")
    .attr("class", "axis-label")
    .attr("x", innerW / 2)
    .attr("y", innerH + 60)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", 600)
    .text("Country");

  // Tooltip
  const tip = svg.append("text")
    .attr("class", "bar-tooltip")
    .attr("text-anchor", "middle")
    .style("opacity", 0);

  // Bars
  g.selectAll("rect")
    .data(raw, d => d.country)
    .join("rect")
    .attr("x", d => x(d.country))
    .attr("width", x.bandwidth())
    .attr("y", innerH)
    .attr("height", 0)
    .attr("fill", d => colour(d[field]))
    .on("mouseover", (e, d) => {
      d3.select(e.currentTarget)
        .attr("stroke", "#000")
        .attr("stroke-width", 2);
      const xp = margin.left + x(d.country) + x.bandwidth() / 2;
      const yp = margin.top + y(d[field]) - 10;
      tip.attr("x", xp).attr("y", yp)
        .text(`${d.country}: ${d[field]}`)
        .transition().duration(200)
        .style("opacity", 1);
    })
    .on("mouseout", (e, d) => {
      d3.select(e.currentTarget).attr("stroke", null);
      tip.transition().duration(200).style("opacity", 0);
    })
    .on("click", (e, d) => {
      if (onCountryClick) onCountryClick(d.country);
    })
    .transition().duration(800)
    .attr("y", d => y(d[field]))
    .attr("height", d => innerH - y(d[field]));

  // Title
  svg.append("text")
    .attr("x", W / 2).attr("y", 24)
    .attr("text-anchor", "middle")
    .style("font-size", "22px")
    .style("font-weight", 700)
    .text(`ICC Trophies by Country`);
}
