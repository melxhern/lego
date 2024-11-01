/* eslint-disable no-console, no-process-exit */
const avenuedelabrique = require("./websites/avenuedelabrique");
const dealabs = require("./websites/dealabs");

async function sandbox(
  //website = "https://www.avenuedelabrique.com/nouveautes-lego"
  website = "https://www.dealabs.com"
) {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    // //const deals = await avenuedelabrique.scrape(website);
    // const deals = await dealabs.scrape(website);

    if (dealabs && typeof dealabs.scrape === "function") {
      const deals = await dealabs.scrape(website);
      console.log(deals);
    } else {
      console.error("L'objet 'dealabs' ou la fonction 'scrape' est manquant");
    }

    //console.log(deals);
    console.log("done");
    process.exit(0);
  } catch (e) {
    console.error("Erreur dans la fonction sandbox:", e);
    process.exit(1);
  }
}

const [, , eshop] = process.argv;

sandbox(eshop);
