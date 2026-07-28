import fs from "fs";
import { DamFeature } from "../types";

interface CnpgbEntry {
  name: string;
  url: string;
}

const cnpgbList: CnpgbEntry[] = JSON.parse(
  fs.readFileSync("data/raw/cnpgb-urls.json", "utf-8")
);

const geojson = JSON.parse(
  fs.readFileSync("public/data/dams.geojson", "utf-8")
);

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strips accents (á → a, ç → c, etc.)
    .replace(/\(.*?\)/g, "") // drops parenthetical notes like "(Travassos)"
    .trim();
}

const cnpgbByNormalizedName = new Map(
  cnpgbList.map((entry) => [normalize(entry.name), entry.url])
);

let matched = 0;
const unmatched: string[] = [];

geojson.features.forEach((feature: DamFeature) => {
  const key = normalize(feature.properties.name);
  if (cnpgbByNormalizedName.has(key)) {
    matched++;
  } else {
    unmatched.push(feature.properties.name);
  }
});

console.log(`Matched: ${matched} / ${geojson.features.length}`);
console.log("Unmatched:", unmatched);