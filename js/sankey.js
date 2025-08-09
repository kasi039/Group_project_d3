// js/sankey.js
import * as d3 from "https://cdn.skypack.dev/d3@7";
import { sankey, sankeyLinkHorizontal } from "https://cdn.skypack.dev/d3-sankey@0.12";

const teamColors = {
  RCB: "#da1818",
  PBKS: "#d71920",
  DC: "#17449b",
  MI: "#045093",
  CSK: "#f9cd05"
};

let currentTeam = null;

function dispatchTeam(team) {
  currentTeam = team;
  window.dispatchEvent(new CustomEvent("teamFilter", { detail: { team } }));
}

function renderLegend(teams) {
  const legend = d3.select("#sankey-legend");
  if (!legend.selectAll("span").empty()) return;

  legend.html(null);
  teams.forEach(t => {
    legend.append("span").attr("class", "box").style("background", teamColors[t] || "#888");
    legend.append("span").text(t).style("margin-right", "12px");
  });
}

d3.csv("data/most_runs_in_ipl.csv", d3.autoType).then(rows => {
  const svg = d3.select("#sankey").html(null);
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  svg.attr("viewBox", [0, 0, width, height]);

  const byTeam = d3.group(rows, d => d.Team);
  const teams = Array.from(byTeam.keys());
  renderLegend(teams);

  const nodeIndex = new Map();
  const nodes = [];
  const links = [];

  const getIdx = (name) => {
    if (!nodeIndex.has(name)) {
      nodeIndex.set(name, nodes.length);
      nodes.push({ name });
    }
    return nodeIndex.get(name);
  };

  byTeam.forEach((teamRows, team) => {
    const teamIdx = getIdx(team);
    const byPlayer = d3.group(teamRows, d => d.Player);
    byPlayer.forEach((playerRows, player) => {
      const playerIdx = getIdx(player);
      links.push({ source: teamIdx, target: playerIdx, value: playerRows.length });
      const hsLabel = `HS: ${d3.max(playerRows, r => r.Highest)}`;
      const hsIdx = getIdx(`${player} — ${hsLabel}`);
      links.push({ source: playerIdx, target: hsIdx, value: 1 });
    });
  });

  const topPad = 60;
  const sankeyGen = sankey()
    .nodeWidth(20)
    .nodePadding(12)
    .extent([[1, topPad], [width - 2, height - 2]]);

  const graph = sankeyGen({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

  const defs = svg.append("defs");
  graph.nodes.forEach((n, i) => {
    const col = teamColors[n.name];
    if (!col) return;
    const lg = defs.append("linearGradient")
      .attr("id", `grad-${i}`)
      .attr("x1", "0%").attr("x2", "100%")
      .attr("y1", "0%").attr("y2", "0%");
    lg.append("stop").attr("offset", "0%").attr("stop-color", "#fff");
    lg.append("stop").attr("offset", "100%").attr("stop-color", col);
  });

  const linkG = svg.append("g").attr("fill", "none").attr("stroke-opacity", 0.4);
  const link = linkG.selectAll("path")
    .data(graph.links)
    .join("path")
    .attr("d", sankeyLinkHorizontal())
    .attr("stroke", "#bbb")
    .attr("stroke-width", d => Math.max(1, d.width))
    .on("mouseover", function (ev, d) {
      link.transition().duration(150).attr("stroke-opacity", l => (l === d ? 0.9 : 0.1));
      nodeRect.transition().duration(150).attr("opacity", n => (n === d.source || n === d.target ? 1 : 0.3));
    })
    .on("mouseout", () => {
      if (currentTeam) return;
      link.transition().duration(150).attr("stroke-opacity", 0.4);
      nodeRect.transition().duration(150).attr("opacity", 1);
    });

  const nodeG = svg.append("g");
  const nodeRect = nodeG.selectAll("rect")
    .data(graph.nodes)
    .join("rect")
    .attr("x", d => d.x0)
    .attr("y", d => d.y0)
    .attr("height", d => d.y1 - d.y0)
    .attr("width", d => d.x1 - d.x0)
    .attr("fill", d => {
      const i = graph.nodes.indexOf(d);
      const col = teamColors[d.name];
      return col ? `url(#grad-${i})` : "#007acc";
    })
    .attr("opacity", 1)
    .style("cursor", "pointer")
    .on("mouseover", function (ev, d) {
      link.transition().duration(150).attr("stroke-opacity", l => (l.source === d || l.target === d ? 0.85 : 0.1));
      nodeRect.transition().duration(150).attr("opacity", n => (n === d ? 1 : 0.4));
    })
    .on("mouseout", () => {
      if (currentTeam) return;
      link.transition().duration(150).attr("stroke-opacity", 0.4);
      nodeRect.transition().duration(150).attr("opacity", 1);
    })
    .on("click", (ev, d) => {
      const isTeam = teamColors[d.name];
      const next = isTeam ? (currentTeam === d.name ? null : d.name) : null;
      dispatchTeam(next);
      if (next) {
        nodeRect.transition().duration(200).attr("opacity", n => {
          if (n.name === next) return 1;
          const connected = graph.links.some(l => (l.source.name === next && (l.target === n || l.target.name.startsWith(n.name))));
          return connected ? 1 : 0.12;
        });
        link.transition().duration(200).attr("stroke-opacity", l => (l.source.name === next ? 0.85 : 0.05));
      } else {
        nodeRect.transition().duration(200).attr("opacity", 1);
        link.transition().duration(200).attr("stroke-opacity", 0.4);
      }
    });

  nodeG.selectAll("text")
    .data(graph.nodes)
    .join("text")
    .attr("x", d => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
    .style("font-size", "12px")
    .style("opacity", 0)
    .text(d => d.name)
    .transition()
    .delay(600)
    .duration(400)
    .style("opacity", 1);

  svg.append("text")
    .attr("x", width / 2).attr("y", 24)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", 700)
    .text("IPL Highest Scores — Team ➜ Player ➜ HS");

  window.addEventListener("teamFilter", (e) => {
    const team = e.detail?.team ?? null;
    currentTeam = team;
    if (team) {
      nodeRect.transition().duration(200).attr("opacity", n => {
        if (n.name === team) return 1;
        const connected = graph.links.some(l => (l.source.name === team && (l.target === n || l.target.name.startsWith(n.name))));
        return connected ? 1 : 0.12;
      });
      link.transition().duration(200).attr("stroke-opacity", l => (l.source.name === team ? 0.85 : 0.05));
    } else {
      nodeRect.transition().duration(200).attr("opacity", 1);
      link.transition().duration(200).attr("stroke-opacity", 0.4);
    }
  });
});