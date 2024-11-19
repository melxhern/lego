/* eslint-disable no-console, no-process-exit */
const avenuedelabrique = require("./websites/avenuedelabrique");
const dealabs = require("./websites/dealabs");
const vinted = require("./websites/vinted");
const fs = require("fs");
const mongo = require("./mongo");

async function sandbox() {
  let website;
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);
    let deals = [];
    let page = 1;
    let hasMorePage = true;
    while (hasMorePage) {
      website = `https://www.dealabs.com/groupe/lego?hide_expired=true&page=${page}`;
      console.log(`📝  scrapping ${website} `);

      temp = await dealabs.scrape(website);
      if (temp !== null && temp.length !== 0) {
        deals = deals.concat(temp);
        page++;
      } else hasMorePage = false;
    }
    const dealIds = new Set(
      deals.map((deal) => deal.id).filter((id) => id !== null)
    );

    fs.writeFileSync(
      "deals/dealabs.json",
      JSON.stringify(deals, null, 2),
      "utf-8"
    );
    let mongoDeals = await mongo.run(deals, "dealabs");

    let nb = 1;
    for (const id of dealIds) {
      page = 1;
      hasMorePage = true;
      deals = [];
      while (hasMorePage) {
        website = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=96&search_text=${id}&status_ids[]=6,1&brand_ids[]=89162`;
        console.log(`📝  scrapping ${website} `);
        temp = await vinted.scrape(website, id);

        if (temp !== null && temp.length !== 0) {
          deals = deals.concat(temp);
          page++;
        } else hasMorePage = false;
      }

      console.log(`-------- nb : ${nb} --------`);
      fs.writeFileSync(
        `deals/vinted/${id}.json`,
        JSON.stringify(deals, null, 2),
        "utf-8"
      );

      if (deals.length !== 0) {
        mongoDeals = await mongo.run(deals, id);
      } else {
        console.log("deals est vide");
      }

      nb++;
    }

    console.log("done");
    process.exit(0);
  } catch (e) {
    console.error("Erreur dans la fonction sandbox:", e);
    process.exit(1);
  }
}

sandbox();
