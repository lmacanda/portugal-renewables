import fs from "fs";
import * as cheerio from "cheerio";
import { DamFeature } from "../types";

interface CnpgbEntry {
  name: string;
  url: string;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/[-\s]+/g, " ") // collapse hyphens/whitespace into single spaces
    .trim();
}

interface ScrapedDetail {
  name: string;
  mwCapacity: number | null;
  imageUrl: string | null;
}

async function scrapeDetail(url: string): Promise<{ mwCapacity: number | null; imageUrl: string | null }> {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // MW capacity: look for "Potência total Instalada - 240 MW" in the page text
  const pageText = $.text();
  const mwMatch = pageText.match(/Potência total Instalada\s*-\s*([\d.,]+)\s*MW/i);
  const mwCapacity = mwMatch ? parseFloat(mwMatch[1].replace(",", ".")) : null;

  // First real photo (skip logos/drawings)
  let imageUrl: string | null = null;
$("img").each((_, el) => {
  if (imageUrl) return;
  const lazySrc = $(el).attr("data-lazy");
  if (lazySrc && lazySrc.includes("/galerias/imagens/")) {
    imageUrl = lazySrc;
  }
});
  return { mwCapacity, imageUrl };
}

async function main() {
  const cnpgbList: CnpgbEntry[] = JSON.parse(
    fs.readFileSync("data/raw/cnpgb-urls.json", "utf-8")
  );
  const geojson = JSON.parse(
    fs.readFileSync("public/data/dams.geojson", "utf-8")
  );

  const cnpgbByNormalizedName = new Map(
    cnpgbList.map((entry) => [normalize(entry.name), entry.url])
  );

  const results: ScrapedDetail[] = [];

  for (const feature of geojson.features as DamFeature[]) {
    const key = normalize(feature.properties.name);
    const url = cnpgbByNormalizedName.get(key);

    if (!url) continue; // no CNPGB match, skip (small açudes etc.)

    console.log(`Scraping ${feature.properties.name}...`);
    const detail = await scrapeDetail(url);
    results.push({ name: feature.properties.name, ...detail });

    await new Promise((resolve) => setTimeout(resolve, 10000)); 
  }

  fs.writeFileSync(
    "data/raw/cnpgb-details.json",
    JSON.stringify(results, null, 2)
  );

  const withMw = results.filter((r) => r.mwCapacity !== null).length;
  const withImage = results.filter((r) => r.imageUrl !== null).length;
  console.log(`Scraped ${results.length} dams: ${withMw} with MW capacity, ${withImage} with photos`);
}

main();