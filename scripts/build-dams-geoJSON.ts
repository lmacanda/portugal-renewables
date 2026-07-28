// scripts/build-dams-geojson.ts
import fs from "fs";
import Papa from "papaparse";

interface DamRow {
  albufeira: string;
  bacia: string;
  distrito: string;
  concelho: string;
  ano_ifunc: number;
  tipo_barra: string;
  compax_lag: number;
  longdd: number;
  latdd: number;
}

// 1. Read the raw CSV as text
const csvText = fs.readFileSync("data/raw/dams.csv", "utf-8");

// 2. Parse it into an array of objects, one per row
const { data: rows } = Papa.parse(csvText, {
  header: true,
  dynamicTyping: true, // converts numeric-looking strings to actual numbers
});

// 3. Filter + map into GeoJSON features
const features = (rows as DamRow[])
  .filter((row) => {
    return row.ano_ifunc !== 0; // TODO: your "not built yet" condition goes here
  })
  .map((row) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [row.longdd, row.latdd], // careful: [lon, lat], not [lat, lon]
    },
    properties: {
    name: row.albufeira,
    basin: row.bacia,
    district: row.distrito,
    municipality: row.concelho,
    yearOperational: row.ano_ifunc,
    damType: row.tipo_barra,// 
    capacity: row.compax_lag,
    },
  }));

const geojson = {
  type: "FeatureCollection",
  features,
};

// 4. Write it out

fs.mkdirSync("public/data", { recursive: true });
fs.writeFileSync("public/data/dams.geojson", JSON.stringify(geojson, null, 2));
console.log(`Wrote ${features.length} dams to public/data/dams.geojson`);