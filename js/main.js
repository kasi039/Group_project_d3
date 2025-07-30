// js/main.js
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export async function loadData() {
  // 1. Load ICC trophies since 1975
  const trophies = await d3.csv(
    "./data/icc_trophies_since1975.csv",
    d3.autoType
  );

  // 2. Load combined Top-20 batting averages
  const averages = await d3.csv(
    "./data/batting_averages_top20.csv",
    d3.autoType
  );

  return { trophies, averages };
}
