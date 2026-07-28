import fs from "fs";
import { DamFeature } from "../types";

interface ScrapedDetail {
  name: string;
  mwCapacity: number | null;
  imageUrl: string | null;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[-\s]+/g, " ")
    .trim();
}

const details: ScrapedDetail[] = JSON.parse(
  fs.readFileSync("data/raw/cnpgb-details.json", "utf-8")
);
const geojson = JSON.parse(
  fs.readFileSync("public/data/dams.geojson", "utf-8")
);

const detailsByName = new Map(
  details.map((d) => [normalize(d.name), d])
);

geojson.features.forEach((feature: DamFeature) => {
  const key = normalize(feature.properties.name);
  const detail = detailsByName.get(key);

  feature.properties.mwCapacity = detail?.mwCapacity ?? null;
  feature.properties.imageUrl = detail?.imageUrl ?? null;
});

fs.writeFileSync(
  "public/data/dams.geojson",
  JSON.stringify(geojson, null, 2)
);

console.log("Merged CNPGB data into dams.geojson");