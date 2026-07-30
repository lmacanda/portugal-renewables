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
import Button from "./Button";

const SOURCE_COLORS: Record<string, string> = {
  Hydro: "#378ADD", // matches the dam marker blue on the map
  Solar: "#eda100",
  Wind: "#008300",
  "Natural Gas": "#898781",
};

const EMPHASIZED_SOURCE = "Hydro";

function shiftDate(base: string, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function GenerationMixChart() {
  const [date, setDate] = useState(yesterdayDateString());
  const [data, setData] = useState<Record<string, string | number>[]>([]);

  useEffect(() => {
    fetch(`/api/generation-mix?date=${date}`)
      .then((response) => response.json())
      .then((rawData) => {
        const reshapedData = reshapeGenerationMix(rawData);
        setData(reshapedData);
      });
  }, [date]);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
        <label style={{ fontSize: "12px", color: "#898781" }}>Showing</label>
        <input
  type="date"
  value={date}
  max={yesterdayDateString()}
  onChange={(e) => setDate(e.target.value)}
  style={{
    padding: "10px 16px",
    borderRadius: "999px",
    border: "2px solid #000",
    background: "#fff",
    color: "#000",
    fontWeight: 700,
    fontSize: "13px",
    boxShadow: "4px 4px 0px #000",
    cursor: "pointer",
  }}
/>
        <Button onClick={() => setDate(yesterdayDateString())}>Yesterday</Button>
        <Button onClick={() => setDate(shiftDate(date, -7))}>−7 days</Button>
      </div>

      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <XAxis
              dataKey="time"
              interval={11}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#898781" }}
            />
            <YAxis hide />
            <Tooltip />
            {Object.entries(SOURCE_COLORS).map(([key, color]) => {
              const isEmphasized = key === EMPHASIZED_SOURCE;
              return (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="mix"
                  stroke={color}
                  strokeWidth={isEmphasized ? 2.5 : 1}
                  fill={color}
                  fillOpacity={isEmphasized ? 0.55 : 0.15}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}