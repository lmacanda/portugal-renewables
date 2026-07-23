"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { yesterdayDateString } from "@/app/lib/dates";
import { reshapeGenerationMix } from "@/app/lib/reshapeGenerationMix";

// The colors we agreed on in the mockup — real domain meaning, not arbitrary
const SOURCE_COLORS: Record<string, string> = {
  Hydro: "#639922",
  Solar: "#eda100",
  Wind: "#008300",
  "Natural Gas": "#898781",
};

export default function GenerationMixChart() {
  const [data, setData] = useState<Record<string, string | number>[]>([]);

  useEffect(() => {
    fetch(`/api/generation-mix?date=${yesterdayDateString()}`)
      .then((response) => response.json())
      .then((rawData) => {
        const reshapedData = reshapeGenerationMix(rawData);
        setData(reshapedData);
      });
  }, []);

  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer>
        <AreaChart data={data}>
          <XAxis dataKey="time" hide />
          <YAxis hide />
          <Tooltip />
          {Object.entries(SOURCE_COLORS).map(([key, color]) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="mix"
              stroke={color}
              fill={color}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}