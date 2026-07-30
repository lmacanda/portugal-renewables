"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DamFeature } from "@/types";
import Button from "@/app/components/Button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface DamsMapProps {
  selectedDamName: string | null;
  onClearSelection?: () => void;
}

export default function DamsMap({ selectedDamName, onClearSelection }: DamsMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markersByName = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const damsRef = useRef<DamFeature[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sizeBy, setSizeBy] = useState<"reservoir" | "mw">("reservoir");

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    markersByName.current.clear();
  }, []);

  const addMarker = useCallback(
    (feature: DamFeature) => {
      const { coordinates } = feature.geometry;
      const { name, capacity, mwCapacity } = feature.properties;

      const value = sizeBy === "mw" ? mwCapacity : capacity;

      const el = document.createElement("div");

      if (sizeBy === "mw" && !value) {
        el.style.width = "8px";
        el.style.height = "8px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#666";
        el.style.opacity = "0.4";
      } else {
        const size = Math.max(
          10,
          Math.min(Math.sqrt(value ?? 0) * (sizeBy === "mw" ? 6 : 2), 50)
        );
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = "50%";
        el.style.backgroundColor = sizeBy === "mw" ? "#eda100" : "#378ADD";
        el.style.opacity = "0.7";
        el.style.border = "1px solid #fff";
      }

      const label =
        sizeBy === "mw"
          ? value
            ? `${value} MW installed capacity`
            : "No generation capacity data"
          : `${capacity} hm³ reservoir capacity`;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<strong>${name}</strong><br/>${label}`
          )
        )
        .addTo(map.current!);

      el.addEventListener("mouseenter", () => marker.togglePopup());
      el.addEventListener("mouseleave", () => marker.togglePopup());

      markersRef.current.push(marker);
      markersByName.current.set(name, marker);
    },
    [sizeBy]
  );

  const showAllDams = useCallback(() => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  setIsPlaying(false);
  setCurrentYear(null);
  clearMarkers();
  damsRef.current.forEach(addMarker);

  map.current?.flyTo({ center: [-8.2, 39.6], zoom: 6, essential: true });
  onClearSelection?.();
}, [clearMarkers, addMarker, onClearSelection]);

  const playByYear = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    clearMarkers();
    setIsPlaying(true);

    const sorted = [...damsRef.current].sort(
      (a, b) => a.properties.yearOperational - b.properties.yearOperational
    );

    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= sorted.length) {
        clearInterval(intervalRef.current!);
        setIsPlaying(false);
        return;
      }
      addMarker(sorted[i]);
      setCurrentYear(sorted[i].properties.yearOperational);
      i++;
    }, 150);
  }, [clearMarkers, addMarker]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-8.2, 39.6],
      zoom: 6,
    });

    const resizeObserver = new ResizeObserver(() => {
      map.current?.resize();
    });
    resizeObserver.observe(mapContainer.current);

    map.current.on("load", () => {
      fetch("/data/dams.geojson")
        .then((response) => response.json())
        .then((geojson) => {
          damsRef.current = geojson.features;
          showAllDams();
        });
    });

    return () => {
      resizeObserver.disconnect();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showAllDams]);

  // Redraw markers whenever the sizing mode changes
  useEffect(() => {
    if (!map.current || damsRef.current.length === 0) return;
    showAllDams();
  }, [sizeBy, showAllDams]);

  // Fly to and highlight the selected dam whenever selection changes
  useEffect(() => {
    if (!selectedDamName || !map.current) return;

    const feature = damsRef.current.find(
      (d) => d.properties.name === selectedDamName
    );
    if (!feature) return;

    map.current.flyTo({
      center: feature.geometry.coordinates,
      zoom: 10,
      essential: true,
    });

    const marker = markersByName.current.get(selectedDamName);
    marker?.togglePopup();
  }, [selectedDamName]);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "10px 14px",
          background: "#0a0e17",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          alignItems: "center",
        }}
      >
        <Button onClick={playByYear} disabled={isPlaying}>
          {isPlaying ? `${currentYear}…` : "Reveal by year"}
        </Button>
        <Button onClick={showAllDams}>Show all</Button>
        <Button onClick={() => setSizeBy("reservoir")} disabled={sizeBy === "reservoir"}>
          Reservoir
        </Button>
        <Button onClick={() => setSizeBy("mw")} disabled={sizeBy === "mw"}>
          Generation (MW)
        </Button>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}