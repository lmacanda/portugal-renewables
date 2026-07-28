interface RenSeries {
  name: string;
  data: number[];
}
interface RenResponse {
  series: RenSeries[];
}
const TREEMAP_SOURCES = [
  "Hydro",
  "Solar",
  "Wind",
  "Biomass",
  "Wave",
  "Natural Gas",
  "Coal",
  "Other Thermal",
];

export function computeDailyTotals(raw: RenResponse) {
  return raw.series
    .filter((series) => TREEMAP_SOURCES.includes(series.name))
    .map((series) => ({
      name: series.name,
      size: sumSeries(series.data),
    }))
    .filter((entry) => entry.size > 0); // drop sources that generated nothing that day
}

const OTHER_RENEWABLE_SOURCES = ["Solar", "Wind", "Biomass", "Wave"];
const NON_RENEWABLE_SOURCES = ["Natural Gas", "Coal", "Other Thermal"];

function sumSeries(data: number[]): number {
  return data.reduce((total, value) => total + value, 0);
}

export function computeRenewableShare(raw: RenResponse) {
  let hydroTotal = 0;
  let otherRenewableTotal = 0;
  let nonRenewableTotal = 0;

  raw.series.forEach((series) => {
    if (series.name === "Hydro") {
      hydroTotal += sumSeries(series.data);
    } else if (OTHER_RENEWABLE_SOURCES.includes(series.name)) {
      otherRenewableTotal += sumSeries(series.data);
    } else if (NON_RENEWABLE_SOURCES.includes(series.name)) {
      nonRenewableTotal += sumSeries(series.data);
    }
  });

  const renewableTotal = hydroTotal + otherRenewableTotal;
  const total = renewableTotal + nonRenewableTotal;

  return {
    renewablePct: total > 0 ? (renewableTotal / total) * 100 : 0,
    hydroPctOfTotal: total > 0 ? (hydroTotal / total) * 100 : 0,
    hydroPctOfRenewable: renewableTotal > 0 ? (hydroTotal / renewableTotal) * 100 : 0,
  };

  
}