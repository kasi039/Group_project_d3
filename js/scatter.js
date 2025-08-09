// js/scatter.js
import { loadData } from "./main.js";
import { buildScatter } from "./scatterChart.js";

let averages = [];
let countryFilter = null; 
function getFormats() {
  const formats = [];
  if (document.getElementById("testChk")?.checked) formats.push("Test");
  if (document.getElementById("odiChk")?.checked)  formats.push("ODI");
  return formats;
}

function update() {
  // Filter by selected formats (Test/ODI); country filter is handled in buildScatter
  const subset = averages.filter(d => getFormats().includes(d.format));
  buildScatter(subset, countryFilter);
}

export async function initScatter() {
  const { averages: loaded } = await loadData();
  averages = loaded;

  // Wire up checkbox interactions
  document.getElementById("testChk")?.addEventListener("change", update);
  document.getElementById("odiChk")?.addEventListener("change", update);

  // Listen for bar-chart country selection
  window.addEventListener("countryFilter", (e) => {
    countryFilter = e.detail?.country ?? null;
    update();
  });

  update(); 
}

initScatter();
