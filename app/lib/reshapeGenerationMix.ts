interface RenSeries {
  name: string;
  data: number[];
}

interface RenResponse {
  xAxis: { categories: string[] };
  series: RenSeries[];
}

export function reshapeGenerationMix(raw: RenResponse) {
  const { categories } = raw.xAxis;

  return categories.map((time, i) => {
    const point: Record<string, string | number> = { time };
    raw.series.forEach((series) => {
      point[series.name] = series.data[i];
    });
    return point;
  });
}