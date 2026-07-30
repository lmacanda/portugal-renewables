"use client";

import { useEffect, useState } from "react";
import { yesterdayDateString } from "@/app/lib/dates";
import { computeRenewableShare } from "@/app/lib/renawableShare";

export default function RenewableShareStat() {
  const [stats, setStats] = useState<{
    renewablePct: number;
    nonRenewablePct: number;
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
    <div style={{ textAlign: "center", padding: "0 0 12px" }}>
      <p style={{ fontSize: "12px", color: "#898781", margin: "0 0 6px" }}>
        How Portugal&apos;s electricity was generated yesterday
      </p>
      <div style={{ fontSize: "15px", color: "#eef2f6" }}>
        <span style={{ fontWeight: 700, color: "#378ADD" }}>
          {stats.renewablePct.toFixed(0)}% renewable
        </span>
        <span style={{ color: "#898781", fontSize: "12px" }}>
          {" "}
          ({stats.hydroPctOfRenewable.toFixed(0)}% of that was hydro)
        </span>
      </div>
      <div style={{ fontSize: "15px", color: "#eef2f6", marginTop: "2px" }}>
        <span style={{ fontWeight: 700, color: "#898781" }}>
          {stats.nonRenewablePct.toFixed(0)}% non-renewable
        </span>
        <p style={{ fontSize: "10px", color: "#5a6472", margin: "6px 0 0", fontStyle: "italic" }}>
  Share of domestic generation — excludes imports/exports
</p>
      </div>
    </div>
  );
}