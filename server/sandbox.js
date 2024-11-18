/* eslint-disable no-console, no-process-exit */
const avenuedelabrique = require("./websites/avenuedelabrique");
const dealabs = require("./websites/dealabs");
const vinted = require("./websites/vinted");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function sandbox(website, id = null) {
  try {
    console.log(`🕵️‍♀️  browsing ${website} website`);

    if (id != null) {
      website = `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${id}&status_ids[]=6,1&brand_ids[]=89162`;
      // website = `https://www.vinted.fr/catalog?search_text=${id}`;
    }

    let deals;
    switch (website) {
      case "https://www.dealabs.com/groupe/lego":
        deals = await dealabs.scrape(website);
        break;
      case "https://www.avenuedelabrique.com/nouveautes-lego":
        deals = await avenuedelabrique.scrape(website);
        break;
      case `https://www.vinted.fr/api/v2/catalog/items?page=1&per_page=96&search_text=${id}&status_ids[]=6,1&brand_ids[]=89162`:
        deals = await vinted.scrape(website, id);
        break;
      default:
        deals = await dealabs.scrape(website);
        break;
    }

    console.log(deals);
    console.log("done");
    process.exit(0);
  } catch (e) {
    console.error("Erreur dans la fonction sandbox:", e);
    process.exit(1);
  }
}

async function main() {
  console.log("📝 Veuillez sélectionner le site à scrapper :\n");
  console.log("\t1. Dealabs");
  console.log("\t2. Avenue de la Brique");
  console.log("\t3. Vinted\n");

  const siteChoice = await askQuestion("Numéro --> ");
  let website;
  let id = null;

  switch (siteChoice) {
    case "1":
      website = "https://www.dealabs.com/groupe/lego";
      break;
    case "2":
      website = "https://www.avenuedelabrique.com/nouveautes-lego";
      break;
    case "3":
      website = "https://www.vinted.fr";
      id = await askQuestion(
        "Veuillez sélectionner l'ID du Lego souhaité \n ID --> "
      );
      break;
    default:
      console.log("Choix invalide, utilisation de Dealabs par défaut.\n");
      website = "https://www.dealabs.com";
  }

  rl.close();
  sandbox(website, id || null);
}

main();
