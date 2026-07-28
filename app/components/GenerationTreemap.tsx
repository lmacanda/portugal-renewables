"use client";

import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { yesterdayDateString } from "@/app/lib/dates";
import { computeDailyTotals } from "@/app/lib/renawableShare";

const SOURCE_COLORS: Record<string, string> = {
  Hydro: "#378ADD",
  Solar: "#eda100",
  Wind: "#008300",
  Biomass: "#8FA30D",
  Wave: "#32CCCD",
  "Natural Gas": "#898781",
  Coal: "#800000",
  "Other Thermal": "#747474",
};

export default function GenerationTreemap() {
  const [data, setData] = useState<{ name: string; size: number }[]>([]);

  useEffect(() => {
    fetch(`/api/generation-mix?date=${yesterdayDateString()}`)
      .then((response) => response.json())
      .then((rawData) => {
        setData(computeDailyTotals(rawData));
      });
  }, []);

  return (
    <div style={{ width: "100%", height: 160 }}>
      <ResponsiveContainer>
        <Treemap
          data={data}
          dataKey="size"
          stroke="#0a0e17"
          content={({ x, y, width, height, name }) => (
            <g>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={SOURCE_COLORS[name] ?? "#666"}
                stroke="#0a0e17"
                strokeWidth={2}
              />
              {width > 40 && height > 20 && (
                <text
                  x={x + 6}
                  y={y + 16}
                  fill="#0a0e17"
                  fontSize={11}
                  fontWeight={500}
                >
                  {name}
                </text>
              )}
            </g>
          )}
        >
          <Tooltip />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}