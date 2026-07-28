"use client";

import { useEffect, useState } from "react";
import { DamFeature } from "@/types";
import Image from "next/image";

export default function DamsList() {
  const [dams, setDams] = useState<DamFeature[]>([]);

  useEffect(() => {
    fetch("/data/dams.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        const sorted = [...geojson.features].sort(
          (a, b) => b.properties.capacity - a.properties.capacity
        );
        
        setDams(sorted);
        console.log(geojson.features.map((f: DamFeature) => f.properties.imageUrl));
      });
      
  }, []);

  return (
    <div>
      <div style={{ padding: "16px 14px 12px" }}>
        <h1 style={{ fontSize: "29px", fontWeight: 600, color: "black", margin: 0 }}>
          DAMS
        </h1>
        <p style={{ fontSize: "12px", color: "#898781", margin: "2px 0 0" }}>
          {dams.length} dams · sorted by reservoir capacity
        </p>
      </div>

      <div
        style={{
          display: "flex",
          padding: "8px 14px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          fontSize: "11px",
          fontWeight: 500,
          color: "#898781",
          textTransform: "uppercase",
          letterSpacing: "0.03em",
        }}
      >
        <span style={{ flex: 2 }}>Name</span>
        <span style={{ flex: 1 }}>Type</span>
        <span style={{ flex: 1, textAlign: "right" }}>Capacity</span>
      </div>

{dams.map((dam) => (
      <div
        key={dam.properties.name}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 14px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          fontSize: "13px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(55,138,221,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        {dam.properties.imageUrl && (
          <Image
    src={dam.properties.imageUrl}
    alt={dam.properties.name}
    width={36}
    height={36}
    style={{
      borderRadius: "4px",
      objectFit: "cover",
      marginRight: "10px",
      flexShrink: 0,
    }}
          />
        )}

        <span style={{ flex: 2, color: "rgb(0 35 134)" }}>{dam.properties.name}</span>
        <span style={{ flex: 1, color: "black", marginTop: "2px", fontWeight: 700, fontSize: "11px" }}>
          {dam.properties.damType}
        </span>
        <span style={{ flex: 1, textAlign: "right", color: "#898781", fontSize: "11px" }}>
          {dam.properties.capacity} hm³
        </span>
      </div>
    ))}
    </div>
  );
}