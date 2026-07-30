import DamsMap from "@/app/components/DamsMap";
import GenerationMixChart from "@/app/components/GenerationMixChart";
import DamsList from "@/app/components/Damslist";
import RenewableShareStat from "@/app/components/renawableShareStat"; 
import GenerationTreemap from "@/app/components/GenerationTreemap";

export default function Home() {
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
  <p style={{ fontSize: "12px", color: "#898781", textAlign: "center", margin: "0 0 8px" }}>
  How Portugal&apos;s electricity was generated yesterday, by source (MWh)
</p>
  <RenewableShareStat />

  <GenerationTreemap />
</div>
        <DamsList />
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <DamsMap />
        </div>
        <div style={{ background: "#0a0e17", padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <GenerationMixChart />
        </div>
      </div>
    </main>
  );
}