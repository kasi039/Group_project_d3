// js/bar.js
import { loadData } from "./main.js";
import { buildBar } from "./barChart.js";
import { buildScatter } from "./scatterChart.js";

export async function drawBarAndScatter() {
  const { trophies, averages } = await loadData();
  const filter = document.getElementById("trophyFilter");

  function updateScatter(country = null) {
    buildScatter(averages, country);
  }

  function updateBar() {
    buildBar(trophies, filter.value, updateScatter);
  }

  filter.addEventListener("change", updateBar);
  updateBar();
  updateScatter();
}

drawBarAndScatter();
