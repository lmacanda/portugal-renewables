"use client";

import { useCallback, useState } from "react";
import DamsMap from "@/app/components/DamsMap";
import GenerationMixChart from "@/app/components/GenerationMixChart";
import DamsList from "@/app/components/Damslist";
import RenewableShareStat from "@/app/components/renawableShareStat"; 
import GenerationTreemap from "@/app/components/GenerationTreemap";

export default function Home() {
  const [selectedDamName, setSelectedDamName] = useState<string | null>(null);

  const handleClearSelection = useCallback(() => {
  setSelectedDamName(null);
}, []);

  return (
    <main style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          width: "320px",
          flexShrink: 0,
          overflowY: "auto",
          borderRight: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div style={{ background: "#0a0e17", padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          
          <RenewableShareStat />
          <GenerationTreemap />
        </div>
        <DamsList
          selectedDamName={selectedDamName}
          onSelectDam={setSelectedDamName}
        />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <DamsMap
  selectedDamName={selectedDamName}
  onClearSelection={handleClearSelection}
/>
        </div>
        <div style={{ background: "#0a0e17", padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <GenerationMixChart />
        </div>
      </div>
    </main>
  );
}