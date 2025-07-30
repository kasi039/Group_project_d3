// js/bar.js
import { loadData } from "./main.js";
import { buildBar }  from "./barChart.js";

export async function drawBar() {
  const { trophies } = await loadData();
  const filter = document.getElementById("trophyFilter");

  function update() {
    buildBar(trophies, filter.value);
  }

  filter.addEventListener("change", update);
  update();  // initial draw
}

drawBar();
