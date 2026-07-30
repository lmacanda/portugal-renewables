"use client";

import { useEffect, useState } from "react";
import { translateDamType } from "@/app/lib/damTypeTranslations";
import { DamFeature } from "@/types";
import Image from "next/image";

interface DamsListProps {
  selectedDamName: string | null;
  onSelectDam: (name: string) => void;
}

export default function DamsList({ selectedDamName, onSelectDam }: DamsListProps) {
  const [dams, setDams] = useState<DamFeature[]>([]);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);
  const gridTemplate = "44px 2fr 1.2fr 1fr";

  useEffect(() => {
    fetch("/data/dams.geojson")
      .then((response) => response.json())
      .then((geojson) => {
        const sorted = [...geojson.features].sort(
          (a, b) => b.properties.capacity - a.properties.capacity
        );
        setDams(sorted);
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
          display: "grid",
          gridTemplateColumns: gridTemplate,
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
        <span />
        <span>Name</span>
        <span>Type</span>
        <span style={{ textAlign: "right" }}>Capacity</span>
      </div>

      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            cursor: "pointer",
          }}
        >
          <img
            src={enlargedImage}
            alt=""
            style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "8px" }}
          />
        </div>
      )}

      {dams.map((dam) => {
        const isSelected = dam.properties.name === selectedDamName;
        return (
          <div
            key={dam.properties.name}
            onClick={() => onSelectDam(dam.properties.name)}
            style={{
              display: "grid",
              gridTemplateColumns: gridTemplate,
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer",
              fontSize: "13px",
              background: isSelected ? "rgba(55,138,221,0.25)" : "transparent",
            }}
            onMouseEnter={(e) => {
              if (!isSelected) e.currentTarget.style.background = "rgba(55,138,221,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isSelected
                ? "rgba(55,138,221,0.25)"
                : "transparent";
            }}
          >
            {dam.properties.imageUrl ? (
              <Image
                src={dam.properties.imageUrl}
                alt={dam.properties.name}
                width={36}
                height={36}
                onClick={(e) => {
                  e.stopPropagation();
                  setEnlargedImage(dam.properties.imageUrl ?? null);
                }}
                style={{ borderRadius: "4px", objectFit: "cover", cursor: "pointer" }}
              />
            ) : (
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "4px",
                  background: "#1c2330",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                }}
              >
                💧
              </div>
            )}

            <span style={{ color: "rgb(0 35 134)" }}>{dam.properties.name}</span>
            <span style={{ color: "black", fontWeight: 700, fontSize: "11px" }}>
              {translateDamType(dam.properties.damType)}
            </span>
            <span style={{ textAlign: "right", color: "#898781", fontSize: "11px" }}>
              {dam.properties.capacity} hm³
            </span>
          </div>
        );
      })}
    </div>
  );
}