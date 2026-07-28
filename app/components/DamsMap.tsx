"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { DamFeature } from "@/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function DamsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

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
          geojson.features.forEach((feature: DamFeature) => {
            const { coordinates } = feature.geometry;
            const { name, basin, district, municipality, capacity } =
              feature.properties;

            const el = document.createElement("div");
            const size = Math.max(10, Math.min(Math.sqrt(capacity) * 2, 50));
            el.style.width = `${size}px`;
            el.style.height = `${size}px`;
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "#378ADD";
            el.style.opacity = "0.7";
            el.style.border = "1px solid #fff";

            new mapboxgl.Marker({ element: el })
              .setLngLat(coordinates)
              .setPopup(
                new mapboxgl.Popup().setHTML(
                  `<strong>${name}</strong><br/>${basin}<br/>${municipality}, ${district}`
                )
              )
              .addTo(map.current!);
          });
        });
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}