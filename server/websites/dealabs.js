const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
//const fetch = import("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = async (data) => {
  const $ = cheerio.load(data, { xmlMode: true });

  const results = $("div.listLayout-main article")
    .map((i, element) => {
      const container = $(element).find("div.js-vue2").attr("data-vue2");

      let title, link, comments, temperature, published, price, retail;

      if (container) {
        const jsonData = JSON.parse(container);
        comments = jsonData.props.thread.commentCount;
        link = jsonData.props.thread.link;
        title = jsonData.props.thread.title;
        temperature = jsonData.props.thread.temperature;
        published = jsonData.props.thread.publishedAt;
        price = jsonData.props.thread.price;
        retail = jsonData.props.thread.nextBestPrice;
        // recup uuid et id !!!!
      }

      const imageContainer = $(element)
        .find("div.threadGrid-image .js-vue2")
        .attr("data-vue2");

      let image;

      if (imageContainer) {
        const jsonData = JSON.parse(imageContainer);
        image = jsonData.props.threadImageUrl;
      }

      return {
        title,
        link,
        comments,
        temperature,
        published,
        price,
        retail,
        image,
      };
    })
    .get();

  // Retourner les résultats encapsulés dans un tableau
  return results;
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns
 */
module.exports.scrape = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
      },
    });

    if (response.ok) {
      const body = await response.text();
      const jsonData = await parse(body); // Ajouter 'await' ici pour attendre le résultat

      // Enregistrer les données dans un fichier JSON
      fs.writeFileSync(
        "deals/deals-dealabs.json",
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
      console.log("Données stockées dans deals-dealabs.json\n");

      return jsonData;
    } else {
      console.error(
        `Erreur de réponse : statut ${response.status} - ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Erreur lors de la requête fetch :", error);
  }

  return null;
};
