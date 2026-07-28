import * as cheerio from "cheerio";

async function main() {
  const res = await fetch("https://cnpgb.apambiente.pt/content/alqueva");
  const html = await res.text();
  const $ = cheerio.load(html);

  $("img.lazy").each((_, el) => {
    console.log($.html(el));
  });
}

main();