"use client";

import { useEffect, useState } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { yesterdayDateString } from "@/app/lib/dates";
import { computeGroupedTotals } from "@/app/lib/renawableShare";

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

interface TreemapNode {
  name: string;
  size?: number;
  children?: TreemapNode[];
  [key: string]: unknown;
}

export default function GenerationTreemap() {
  const [data, setData] = useState<TreemapNode[]>([]);

  useEffect(() => {
    fetch(`/api/generation-mix?date=${yesterdayDateString()}`)
      .then((response) => response.json())
      .then((rawData) => {
        setData(computeGroupedTotals(rawData));
      });
  }, []);

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <Treemap
          data={data}
          dataKey="size"
          stroke="#0a0e17"
          content={({ x, y, width, height, name, depth, size }) => {
            // depth 1 = the outer "Renewable" / "Non-renewable" group.
            // depth 2 = an individual source (Hydro, Solar, Gas, etc.)
            const isGroup = depth === 1;

            return (
              <g>
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={isGroup ? "transparent" : SOURCE_COLORS[name] ?? "#666"}
                  stroke={isGroup ? "#fff" : "#0a0e17"}
                  strokeWidth={isGroup ? 3 : 2}
                />

                {isGroup && width > 60 && height > 16 && (
                 <text
  x={x + 6}
  y={y + 14}
  fill="#eef2f6"
  fontSize={11}
  fontWeight={700}
  style={{ textTransform: "uppercase" }}
>
  {name}
</text>
                )}

                {!isGroup && width > 40 && height > 20 && (
                  <>
                    <text x={x + 6} y={y + 16} fill="#0a0e17" fontSize={11} fontWeight={500}>
                      {name}
                    </text>
                    {height > 36 && (
  <text x={x + 6} y={y + 30} fill="#0a0e17" fontSize={10}>
    {Math.round(typeof size === "number" ? size : 0).toLocaleString()} MWh
  </text>
)}
                  </>
                )}
              </g>
            );
          }}
        >
          <Tooltip
            formatter={(value) => {
              const num = typeof value === "number" ? value : 0;
              return `${Math.round(num).toLocaleString()} MWh`;
            }}
          />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}