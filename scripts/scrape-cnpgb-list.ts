// scripts/scrape-cnpgb-list.ts
import fs from "fs";
import * as cheerio from "cheerio";

async function scrapePage(pageNum: number): Promise<{ name: string; url: string }[]> {
  const res = await fetch(`https://cnpgb.apambiente.pt/lista_barragens?page=${pageNum}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: { name: string; url: string }[] = [];

  $("h4 a").each((_, el) => {
    const name = $(el).text().trim();
    const url = $(el).attr("href");
    if (name && url) {
      results.push({ name, url: `https://cnpgb.apambiente.pt${url}` });
    }
  });

  return results;
}

async function main() {
  const allDams: { name: string; url: string }[] = [];

  for (let page = 0; page <= 8; page++) {
    console.log(`Scraping page ${page}...`);
    const dams = await scrapePage(page);
    allDams.push(...dams);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  fs.writeFileSync("data/raw/cnpgb-urls.json", JSON.stringify(allDams, null, 2));
  console.log(`Saved ${allDams.length} dam URLs`);
}

main();