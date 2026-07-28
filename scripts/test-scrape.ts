import * as cheerio from "cheerio";

async function main() {
  const res = await fetch("https://cnpgb.apambiente.pt/lista_barragens?page=0");
  const html = await res.text();
  const $ = cheerio.load(html);

  const results: { name: string; url: string }[] = [];

  $("h4 a").each((_, el) => {
    const name = $(el).text().trim();
    const url = $(el).attr("href");
    if (name && url) results.push({ name, url });
  });

  console.log(`Found ${results.length} entries`);
  console.log(results.slice(0, 5)); // just the first 5, to eyeball
}

main();