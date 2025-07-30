// js/scatter.js
import { loadData }    from "./main.js";
import { buildScatter } from "./scatterChart.js";

export async function drawScatter() {
  const { averages } = await loadData();
  const testChk = document.getElementById("testChk");
  const odiChk  = document.getElementById("odiChk");

  function update() {
    const formats = [];
    if (testChk.checked) formats.push("Test");
    if (odiChk.checked)  formats.push("ODI");
    buildScatter(averages.filter(d => formats.includes(d.format)));
  }

  testChk.addEventListener("change", update);
  odiChk.addEventListener("change", update);
  update();
}
drawScatter();
