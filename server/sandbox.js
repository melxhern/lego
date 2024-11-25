/* eslint-disable no-console, no-process-exit */
const avenuedelabrique = require("./websites/avenuedelabrique");
const dealabs = require("./websites/dealabs");
const vinted = require("./websites/vinted");
const fs = require("fs");
const mongo = require("./mongo");

async function sandbox() {
  let website;
  try {
    console.log(`🕵️‍♀️  browsing DEALABS`);
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
      deals.map((deal) => deal.legoId).filter((legoId) => legoId !== null)
    );

    fs.writeFileSync(
      "deals/deals.json",
      JSON.stringify(deals, null, 2),
      "utf-8"
    );
    let mongoDeals = await mongo.run(deals, "deals");

    let sales = [];
    let nb = 1;

    for (const id of dealIds) {
      page = 1;
      hasMorePage = true;
      console.log(`-------- nb : ${nb} --------`);
      while (hasMorePage) {
        website = `https://www.vinted.fr/api/v2/catalog/items?page=${page}&per_page=96&search_text=${id}&status_ids[]=6,1&brand_ids[]=89162`;
        console.log(`📝  scrapping ${website} `);
        temp = await vinted.scrape(website, id);

        if (temp !== null && temp.length !== 0) {
          sales = sales.concat(temp);
          page++;
        } else hasMorePage = false;
      }

      fs.writeFileSync(
        `deals/sales.json`,
        JSON.stringify(sales, null, 2),
        "utf-8"
      );

      mongoDeals = await mongo.run(sales, "sales");

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
