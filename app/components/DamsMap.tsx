"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import  {DamFeature}  from "@/types";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
console.log("TOKEN:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);

export default function DamsMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-8.2, 39.6],
      zoom: 6,
    });

    map.current.on("load", () => {
      fetch("/data/dams.geojson")
        .then((response) => response.json())
        .then((geojson) => {
          geojson.features.forEach((feature: DamFeature) => {
            const { coordinates } = feature.geometry;
            const { name, basin, district, municipality } =
              feature.properties;

            new mapboxgl.Marker()
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
  }, []); 

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}