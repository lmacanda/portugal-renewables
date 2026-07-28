import DamsMap from "@/app/components/DamsMap";
import GenerationMixChart from "@/app/components/GenerationMixChart";
import DamsList from "@/app/components/Damslist";

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