"use client";

import { useEffect, useState } from "react";
import { yesterdayDateString } from "@/app/lib/dates";
import { computeRenewableShare } from "@/app/lib/renawableShare";

export default function RenewableShareStat() {
  const [stats, setStats] = useState<{
    renewablePct: number;
    hydroPctOfTotal: number;
    hydroPctOfRenewable: number;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/generation-mix?date=${yesterdayDateString()}`)
      .then((response) => response.json())
      .then((rawData) => {
        setStats(computeRenewableShare(rawData));
      });
  }, []);

  if (!stats) return null;

  return (
    <div style={{ display: "flex", gap: "24px", justifyContent: "center", padding: "0 0 8px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px", fontWeight: 600, color: "#eef2f6" }}>
          {stats.renewablePct.toFixed(0)}%
        </div>
        <div style={{ fontSize: "11px", color: "#898781" }}>renewable, yesterday</div>
      </div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "28px", fontWeight: 600, color: "#378ADD" }}>
          {stats.hydroPctOfRenewable.toFixed(0)}%
        </div>
        <div style={{ fontSize: "11px", color: "#898781" }}>of that was hydro</div>
      </div>
    </div>
  );
}