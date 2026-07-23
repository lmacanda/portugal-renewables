import DamsMap from "@/app/components/DamsMap";
import GenerationMixChart from "@/app/components/GenerationMixChart";

export default function Home() {
  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <DamsMap />
      </div>
      <div style={{ background: "#0a0e17", padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <GenerationMixChart />
      </div>
    </main>
  );
}