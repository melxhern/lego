const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");

/**
 * Parse webpage data response
 * @param  {String} data - html response
 * @return {Object} deal
 */
const parse = async (data, id) => {
  console.log("ici ");

  const results = data.items.map((item) => ({
    legoId: id,
    title: item.title,
    price: item.total_item_price,
    link: item.url,
    favorites: item.favourite_count,
    image: item.photo ? item.photo.url : null,
  }));

  return results;
};

/**
 * Scrape a given url page
 * @param {String} url - url to parse
 * @returns
 */
module.exports.scrape = async (url, id) => {
  try {
    console.log(
      "url ------> ",
      `https://www.vinted.fr/catalog?search_text=${id}`
    );
    const { csrfToken, cookies } = await extractCsrfTokenAndCookies();
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 OPR/114.0.0.0",
        Accept: "application/json, text/plain, */*",
        "Accept-Language": "fr",
        Connection: "keep-alive",
        Referer: `https://www.vinted.fr/catalog?search_text=${id}&status_ids[]=6,1&brand_ids[]=89162`,
        "X-Csrf-Token": csrfToken,
        Cookie: cookies,
      },
    });

    if (response.ok) {
      const data = await response.json();
      const jsonData = await parse(data, id);

      // Enregistrer les données dans un fichier JSON
      fs.writeFileSync(
        "deals/deals-vinted.json",
        JSON.stringify(jsonData, null, 2),
        "utf-8"
      );
      console.log("Données stockées dans deals-vinted.json\n");

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

async function extractCsrfTokenAndCookies() {
  const response = await fetch("https://www.vinted.fr/", {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36",
    },
  });
  const cookies = response.headers.get("set-cookie");
  const text = await response.text();
  const csrfTokenMatch = text.match(/"CSRF_TOKEN":"([^"]+)"/);
  return {
    csrfToken: csrfTokenMatch ? csrfTokenMatch[1] : null,
    cookies,
  };
}
