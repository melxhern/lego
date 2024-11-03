const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const cheerio = require("cheerio");
const fs = require("fs");

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = (data) => {
  const $ = cheerio.load(data, { xmlMode: true });

  const results = $("div.prods a")
    .map((i, element) => {
      const price = parseFloat($(element).find("span.prodl-prix span").text());

      const discount = Math.abs(
        parseInt($(element).find("span.prodl-reduc").text())
      );

      return {
        discount,
        price,
        title: $(element).attr("title"),
      };
    })
    .get();

  return results;
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns
 */
module.exports.scrape = async (url) => {
  const response = await fetch(url);

  if (response.ok) {
    const body = await response.text();
    const jsonData = await parse(body);

    // Enregistrer les données dans un fichier JSON
    fs.writeFileSync(
      "deals/deals-avenuedelabrique.json",
      JSON.stringify(jsonData, null, 2),
      "utf-8"
    );
    console.log("Données stockées dans deals-avenuedelabrique.json\n");

    return jsonData;
  } else {
    console.error(
      `Erreur de réponse : statut ${response.status} - ${response.statusText}`
    );
  }
  return null;
};
