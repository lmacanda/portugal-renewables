"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DamFeature } from "@/types";
import Button from "@/app/components/Button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function DamsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const damsRef = useRef<DamFeature[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [currentYear, setCurrentYear] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }, []);

  const addMarker = useCallback((feature: DamFeature) => {
    const { coordinates } = feature.geometry;
    const { name, capacity } = feature.properties;

    const el = document.createElement("div");
    const size = Math.max(10, Math.min(Math.sqrt(capacity) * 2, 50));
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.borderRadius = "50%";
    el.style.backgroundColor = "#378ADD";
    el.style.opacity = "0.7";
    el.style.border = "1px solid #fff";

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(coordinates)
      .setPopup(
        new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
          `<strong>${name}</strong><br/>${capacity} hm³ reservoir capacity`
        )
      )
      .addTo(map.current!);

    el.addEventListener("mouseenter", () => marker.togglePopup());
    el.addEventListener("mouseleave", () => marker.togglePopup());

    markersRef.current.push(marker);
  }, []);

  const showAllDams = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(false);
    setCurrentYear(null);
    clearMarkers();
    damsRef.current.forEach(addMarker);
  }, [clearMarkers, addMarker]);

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
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}