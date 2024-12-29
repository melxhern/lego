// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
"use strict";

/**
Description of the available api
GET https://lego-api-blue.vercel.app/deals

Search for specific deals

This endpoint accepts the following optional query string parameters:

- `page` - page of deals to return
- `size` - number of deals to return

GET https://lego-api-blue.vercel.app/sales

Search for current Vinted sales for a given lego set id

This endpoint accepts the following optional query string parameters:

- `id` - lego set id to return
*/

// current deals on the page
let currentDeals = [];
let currentPagination = {};

let vintedSales = [];
let favorites = new Set();

let isDiscountFiltered = false;
let isCommentedFiltered = false;
let isHotDealFiltered = false;

let sortPriceState = 0; // 0: no sort, 1: ascending, -1: descending
let sortDateState = 0; // 0: no sort, 1: ascending, -1: descending

// instantiate the selectors
const selectShow = document.querySelector("#show-select");
const selectPage = document.querySelector("#page-select");
const selectLegoSetIds = document.querySelector("#lego-set-id-select");
const sectionDeals = document.querySelector("#deals");
const sectionVinted = document.querySelector("#vinted");
const sectionFavorites = document.querySelector("#favorites");
const sectionOptions = document.querySelector("#options");
const sectionDetails = document.querySelector("#deal-details");
const sectionDealEvaluation = document.querySelector("#deal-evaluation");
const spanNbDeals = document.querySelector("#nbDeals");
const spanNbSales = document.querySelector("#nbSales");
const spanAvg = document.querySelector("#avg");
const spanP5 = document.querySelector("#p5");
const spanP25 = document.querySelector("#p25");
const spanP50 = document.querySelector("#p50");
const spanP95 = document.querySelector("#p95");
const spanLifetime = document.querySelector("#lifetime");

const discountButton = document.getElementById("discountButton");
const commentedButton = document.getElementById("commentedButton");
const hotDealButton = document.getElementById("hotDealButton");

const popupOverlay = document.getElementById("popupOverlay");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination info
 */
const setCurrentDeals = (response) => {
  const { currentDeals: deals, currentPagination: pagination } = response;

  currentDeals = deals || []; // Si pas de deals, tableau vide par défaut
  currentPagination = pagination || {
    // Si pas de pagination, structure par défaut
    page: 1,
    size: 20,
    total: 0,
  };
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=20] - size of the page
 * @return {Object}
 */
const fetchDeals = async ({
  page = 1,
  size = 20,
  filterBy = null,
  sortBy = null,
  order = -1,
} = {}) => {
  try {
    const response = await fetch(
      `https://pink-brick-server.vercel.app/deals/search?limit=${size}&page=${page}&filterBy=${filterBy}&sortBy=${sortBy}&order=${order}`
    );

    const body = await response.json();

    // Vérifiez si 'results' existe et contient des données
    if (!body.results || !Array.isArray(body.results)) {
      console.error("No results found in the response: ", body);
      return { currentDeals: [], currentPagination: { page, size, total: 0 } };
    }

    return {
      currentDeals: body.results,
      currentPagination: {
        page: body.page,
        size: body.limit,
        total: body.total,
      },
    };
  } catch (error) {
    console.error("Error fetching deals:", error);
    return { currentDeals: [], currentPagination: { page, size, total: 0 } };
  }
};

/**
 * Fetch deal from api
 * @return {Object}
 */
const fetchDealFromId = async (id = null) => {
  try {
    const response = await fetch(
      `https://pink-brick-server.vercel.app/deals/${id}`
    );

    const body = await response.json();

    // Vérifiez si 'value' existe et contient des données
    if (!body.value) {
      console.error("No results found in the response: ", body);
      return null;
    }

    return body.value;
  } catch (error) {
    console.error("Error fetching deals:", error);
    return null;
  }
};

/**
 * Fetch deals from api
 * @param  {Number}  [id = null] - id of the lego to fetch Vinted Sales
 * @return {Object}
 */
const fetchVintedFromId = async (id = null) => {
  try {
    const response = await fetch(
      `https://pink-brick-server.vercel.app/sales/search?legoId=${id}&limit=30&page=1`
    );
    const body = await response.json();

    // Vérifiez si 'results' existe et contient des données
    if (!body.results || !Array.isArray(body.results)) {
      console.error("No results found in the response: ", body);
      return { currentDeals: [], currentPagination: { page, size, total: 0 } };
    }

    return {
      currentDeals: body.results,
      currentPagination: {
        page: body.page,
        size: body.limit,
        total: body.total,
      },
    };
  } catch (error) {
    console.error(error);
    return { currentDeals, currentPagination };
  }
};

/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = (deals, isFavoriteList) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");
  var template = "";
  if (favorites.size == 0 && sectionFavorites.style.display == "block") {
    template = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height:25rem; ">
        <img src="assets/shy.gif" alt="shy animation" width="auto" height="150"></img>
        <p style="font-style:italic;">You don't have any favorites yet...</p>
      </div>
    `;
  } else {
    template = `
   ${
     sectionDeals.style.display == "block"
       ? `<div class="sort-bar" style="align-items:center;" >
            <span>Sort By : </span>
            <button class="sort-button" onclick="SortingPrice()" >
              Price <span id="price-sort-icon"><img src="https://img.icons8.com/ios-filled/50/sort.png" width="14" height="14" /></span>
            </button>
            <button class="sort-button" onclick="SortingDate()">
              Date <span id="date-sort-icon"><img src="https://img.icons8.com/ios-filled/50/sort.png" width="14" height="14" /></span>
            </button>
          </div>`
       : ""
   }
    

    <div class="deals-container">
      ${deals
        .map((deal) => {
          const isFavorite = favorites.has(deal.id);
          const heartIcon = isFavorite
            ? `<img width="24" height="24" class="heart-icon" src="https://img.icons8.com/sf-regular-filled/48/hearts.png" alt="hearts-filled" onclick="event.stopPropagation(); RemoveFromFavorite('${deal.id}')"/>`
            : `<img width="24" height="24" class="heart-icon" src="https://img.icons8.com/sf-regular/48/hearts.png" alt="hearts" onclick="event.stopPropagation(); AddToFavorite('${deal.id}')"/>`;
          const temperatureColor = TemperatureColor(deal.temperature);
          const temperatureIcon = TemperatureIcon(deal.temperature);
          return `
            <div class="deal-card" id="${deal.id}" 
                 onclick="openPopup('${deal._id}', ${deal.legoId})">
              <div class="deal-image">
                <img src="${deal.image}" alt="${deal.title}" />
              </div>
              <div class="deal-info">
                <div class="card-header">
                  <div style="display: flex; align-items: center; gap: 1.5rem;">
                    <div >${heartIcon}</div>
                    <div class="deal-temperature" >
                      <img width="25" height="25" src="${temperatureIcon}" alt="fire-element--v1"/>
                      <span style="color:${temperatureColor};">
                        ${deal.temperature}°</span>
                      <div class="tooltip">
                        <div class="title">Temperature</div>
                        The temperature is the community's rating of the deal: the hotter it is, the better the deal!
                      </div>
                    </div>
                  </div>                  
                  <div class="deal-date" style="display:flex;">
                    <span class="icon-clock" style="display:inline-flex;">
                      <svg width="20px" height="20px" viewBox="0 0 24 24" fill="#888888"><path d="M12,0c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12S18.6,0,12,0Zm0,22c-5.5,0-10-4.5-10-10S6.5,2,12,2s10,4.5,10,10S17.5,22,12,22ZM10.9,3.9l-.4,8.2.1.9,6.1,5.4,1-1L12.6,13l-.4-8.1Z"/></svg>
                    </span>
                    <span style="margin-left: 0.2rem;">
                    ${DealReleaseDate(deal)}</span>
                  </div>
                </div>
                <div class="card-body">
                  <div class="deal-title" "><a>${deal.title}</a></div>
                  <div class="deal-prices">
                    <div class="deal-price">${deal.price} €</div>
                    <div class="deal-retail">${deal.retail} €</div>
                      ${
                        deal.discount && deal.discount !== 0
                          ? `<div class="deal-discount">-${deal.discount}%</div>`
                          : ""
                      }
                  </div>
                  <div style="display:flex; justify-content: space-between; align-items: center;">
                    <div class="deal-comments" style="display:flex; align-items: center;">
                      <img  width="22" height="22" src="https://img.icons8.com/windows/32/messaging-.png" alt="messaging-" style="display:inline-flex; margin-right: 0.2rem;"/>
                      <span >${deal.comments}</span>
                    </div>
                    <button class="deal-external-link" style="display: flex; align-items: center; margin-right: 0.2rem;" 
                      onclick="event.stopPropagation(); 
                      window.open('${deal.link}', '_blank')">
                        <span style="padding-right: 0.5rem;">Go to deal</span>
                        <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/30/external-link.png" alt="external-link"/>
                    </button>
                  </div>               
                </div>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
  }

  div.innerHTML = template;
  fragment.appendChild(div);
  if (isFavoriteList) {
    sectionFavorites.innerHTML = "";
    sectionFavorites.appendChild(fragment);
  } else {
    sectionDeals.innerHTML = "";
    sectionDeals.appendChild(fragment);
  }
};

/**
 * Render list of deals
 * @param  {Array} sales
 */
const renderVintedSales = (sales, id) => {
  vintedSales = sales.currentDeals;

  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");
  console.log(vintedSales.length);
  console.log(vintedSales);
  var template = "";
  if (vintedSales.length > 0) {
    template = `
    ${vintedSales
      .map((sale) => {
        return ` 
              <div class="deal-card" id="${sale.id}">
                <div class="deal-image">
                  <img src="${sale.image}" alt="${sale.title}" />
                </div>
                <div class="deal-info">
                  <div class="card-body" style="margin-left: 2 rem;">
                    <div class="deal-title">
                      <a href="${sale.link}" target="_blank">${sale.title}</a>
                    </div>
                    <div class="deal-price">${sale.price} €</div>
                    <div class="deal-date">
                    ${new Date(sale.published * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            `;
      })
      .join("")}
  `;
  } else {
    template = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; ">
        <img src="assets/sad.gif" alt="sad animation" width="auto" height="150"></img>
        <p style="font-style:italic;">No Vinted sales found for Lego ${id}...</p>
      </div>
    `;
  }

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionVinted.innerHTML = `<h2 style="font-family: 'LegoFont'; font-size: 3rem;">VINTED SALES</h2>`;
  sectionVinted.appendChild(fragment);
};

/**
 * Render list of deals
 * @param  {Array} sales
 */
const renderDealDetails = (deal) => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");
  const temperatureColor = TemperatureColor(deal.temperature);
  const temperatureIcon = TemperatureIcon(deal.temperature);

  const template = `
    <div class="detail-card" id="${deal.id}">
      <div class="detail-image">
        <img src="${deal.image}" alt="${deal.title}" />
      </div>
      <div class="detail-info">
        <div class="detail-card-body" style="margin-left: 2 rem;">
        <div class="deal-temperature" style="margin-left:1rem; gap:0.4rem; margin-bottom: 0.5rem;">
          <img width="25" height="25" src="${temperatureIcon}" alt="fire-element--v1"/>
          <span style="color:${temperatureColor};">${deal.temperature}°</span>
          <img width="25" height="25" src="${temperatureIcon}" alt="fire-element--v1"/>
        </div>
        <div class="detail-date">${DetailReleaseDate(deal)}</div>
          <div class="detail-title">
            <a href="${deal.link}" target="_blank">${deal.title}</a>
          </div>
          <div class="deal-prices" style="display: flex; align-items: baseline; ">
            <div class="deal-price" style="font-size:1.8rem;">${deal.price} €
            </div>
            <div class="deal-retail" style="">${deal.retail} €</div>
            ${
              deal.discount && deal.discount !== 0
                ? `<div class="deal-discount" style=" ">-${deal.discount}%</div>`
                : ""
            }
          </div>          

          <div style="display:flex; align-items: center; margin-top: 1rem;">
            <img class="deal-comments" width="22" height="22" src="https://img.icons8.com/windows/32/messaging-.png" alt="messaging-" style="display:inline-flex; margin-right: 0.2rem;"/>
            <span class="deal-comments">${deal.comments} comments</span>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 2.5rem;">
            <button class="deal-external-link" 
                    style="display: flex; align-items: center; margin-right: 0.2rem;" 
                    onclick="event.stopPropagation(); 
                    window.open('${deal.link}', '_blank')">
              <span style="padding-right: 0.5rem;">Go to deal</span>
              <img width="25" height="25" src="https://img.icons8.com/ios-glyphs/30/external-link.png" alt="external-link"/>
            </button>
          </div>

        </div>
      </div>
    </div>
  `;

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDetails.innerHTML = `<h2 style="font-family: 'LegoFont'; font-size: 3rem;">DEAL INFORMATIONS</h2>`;
  sectionDetails.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = (pagination) => {
  const { page, size, total } = pagination;

  const options = Array.from(
    { length: total / size },
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join("");

  currentPagination = { currentPage: page, total: total, size: size };

  selectPage.innerHTML = options;
  selectPage.selectedIndex = page - 1;
};

/**
 * Render page selector
 */
const renderIndicators = () => {
  spanNbSales.innerHTML = vintedSales.length;

  spanAvg.innerHTML = parseFloat(AvgPrice(vintedSales)).toFixed(2);
  spanP5.innerHTML = Percentile(vintedSales, 0.05);
  spanP25.innerHTML = Percentile(vintedSales, 0.25);
  spanP50.innerHTML = Percentile(vintedSales, 0.5);
  spanP95.innerHTML = Percentile(vintedSales, 0.95);
  spanLifetime.innerHTML = LifetimeValue(vintedSales) + " days";

  const nbsales = vintedSales.length;

  const avg = parseFloat(AvgPrice(vintedSales)).toFixed(2);
  const p5 = Percentile(vintedSales, 0.05);
  const p25 = Percentile(vintedSales, 0.25);
  const p50 = Percentile(vintedSales, 0.5);
  const p95 = Percentile(vintedSales, 0.95);
  const lifetime = LifetimeValue(vintedSales) + " days";

  return {
    nbsales,
    avg,
    p5,
    p25,
    p50,
    p95,
    lifetime,
  };
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  // renderIndicators(pagination);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener("change", async (event) => {
  let page = currentPagination.currentPage;

  const showNbDeals = parseInt(event.target.value);

  let test = page * showNbDeals;

  if (test > currentPagination.total) {
    // if the number of deals to display is greater than the total number of deals
    page = Math.floor(currentPagination.total / showNbDeals); // always round the page down
  }

  const deals = await fetchDeals({ page: page, size: showNbDeals });

  RemoveAllFilters();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

/**
 * Select the page to display
 */
selectPage.addEventListener("change", async (event) => {
  let page = parseInt(event.target.value);

  const deals = await fetchDeals({
    page: page,
    size: parseInt(selectShow.value),
  });

  RemoveAllFilters();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

document.addEventListener("DOMContentLoaded", async () => {
  const deals = await fetchDeals();
  //const sales = await fetchVintedFromId();
  //renderVintedSales(sales);

  setCurrentDeals(deals);
  showCategory("deals");
  //render(currentDeals, currentPagination);
});

/**
 * Sort by the value choosen
 */
async function SortingPrice() {
  sortDateState = 0;
  var deals = null;

  switch (sortPriceState) {
    case 0:
      deals = await fetchDeals({ sortBy: "price", order: 1 });
      setCurrentDeals(deals);
      sortPriceState = 1;
      break;

    case 1:
      deals = await fetchDeals({ sortBy: "price", order: -1 });
      setCurrentDeals(deals);
      sortPriceState = -1;
      break;

    default: // reset to default order
      deals = await fetchDeals({ sortBy: null });
      setCurrentDeals(deals);
      sortPriceState = 0;
      break;
  }
  //RemoveAllFilters();
  render(currentDeals, currentPagination);

  // Appliquer les icônes après le rendu
  const icon = document.querySelector("#price-sort-icon");
  if (icon) {
    if (sortPriceState === 1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-up.png" alt="sort-up"/>'; // Flèche vers le haut
    } else if (sortPriceState === -1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-down.png" alt="sort-down"/>'; // Flèche vers le bas
    } else {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort.png" alt="sort"/>'; // Double flèche
    }
  }
}

/**
 * Sort by the value choosen
 */
async function SortingDate() {
  sortPriceState = 0;
  var deals = null;

  switch (sortDateState) {
    case 0:
      deals = await fetchDeals({ sortBy: "date", order: 1 });
      setCurrentDeals(deals);
      sortDateState = 1;
      break;
    case 1:
      deals = await fetchDeals({ sortBy: "date", order: -1 });
      setCurrentDeals(deals);
      sortDateState = -1;
      break;

    default: // reset to default order
      deals = await fetchDeals({ sortBy: "null", order: 1 });
      setCurrentDeals(deals);
      sortDateState = 0;
      break;
  }
  //RemoveAllFilters();
  render(currentDeals, currentPagination);

  // Appliquer les icônes après le rendu
  const icon = document.querySelector("#date-sort-icon");
  if (icon) {
    if (sortDateState === 1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-up.png" alt="sort-up"/>'; // Flèche vers le haut
    } else if (sortDateState === -1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-down.png" alt="sort-down"/>'; // Flèche vers le bas
    } else {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort.png" alt="sort"/>'; // Double flèche
    }
  }
}

async function onClickBestDiscount() {
  RemoveAllFilters("discount");

  if (isDiscountFiltered) {
    discountButton.classList.remove("active");

    const deals = await fetchDeals({
      page: parseInt(selectPage.value),
      limit: parseInt(selectShow.value),
    });

    setCurrentDeals(deals);
    isDiscountFiltered = false;
    discountButton.classList.remove("active");
  } else {
    discountButton.classList.add("active");
    const deals = await fetchDeals({ filterBy: "best-discount" });
    setCurrentDeals(deals);
    isDiscountFiltered = true;
  }
  render(currentDeals, currentPagination);
}

async function onClickMostCommented() {
  RemoveAllFilters("commented");

  if (isCommentedFiltered) {
    commentedButton.classList.remove("active");
    const deals = await fetchDeals({
      page: parseInt(selectPage.value),
      limit: parseInt(selectShow.value),
    });

    setCurrentDeals(deals);
    isCommentedFiltered = false;
    //commentedButton.style.backgroundColor = "";
  } else {
    commentedButton.classList.add("active");
    const deals = await fetchDeals({ filterBy: "most-commented" });
    setCurrentDeals(deals);

    isCommentedFiltered = true;
  }
  render(currentDeals, currentPagination);
}

async function onClickHotDeals() {
  await RemoveAllFilters("hotDeal");

  if (isHotDealFiltered) {
    hotDealButton.classList.remove("active");
    const deals = await fetchDeals({
      page: parseInt(selectPage.value),
      limit: parseInt(selectShow.value),
    });
    setCurrentDeals(deals);
    isHotDealFiltered = false;

    //hotDealButton.style.backgroundColor = "";
  } else {
    hotDealButton.classList.add("active");
    const deals = await fetchDeals({ filterBy: "hot-deals" });
    setCurrentDeals(deals);

    isHotDealFiltered = true;
  }
  render(currentDeals, currentPagination);
}

async function RemoveAllFilters(filterToKeep = null) {
  if (filterToKeep !== "discount") {
    isDiscountFiltered = false;
    discountButton.classList.remove("active");
    //discountButton.style.backgroundColor = "";
  }

  if (filterToKeep !== "commented") {
    isCommentedFiltered = false;
    commentedButton.classList.remove("active");
    //commentedButton.style.backgroundColor = "";
  }

  if (filterToKeep !== "hotDeal") {
    isHotDealFiltered = false;
    hotDealButton.classList.remove("active");
    //hotDealButton.style.backgroundColor = "";
  }
}

function TemperatureColor(temperature) {
  if (temperature < 0) return "#005498";
  if (temperature < 100) return "#f7641b";
  return "#ce1734";
}

function TemperatureIcon(temperature) {
  if (temperature < 0) return "https://img.icons8.com/fluency/48/winter.png";
  if (temperature < 100)
    return "https://img.icons8.com/emoji/48/sun-behind-cloud.png";
  return "https://img.icons8.com/color/48/fire-element--v1.png";
}

function SortByPrice(a, b, order) {
  switch (order) {
    case "inc":
      return a.price - b.price;
    case "dec":
      return b.price - a.price;
    default:
      return a.price - b.price; // increase by default
  }
}

function AvgPrice(data) {
  if (data !== null && data !== undefined && data.length !== 0) {
    let total_price = 0;
    data.forEach((d) => {
      total_price += parseFloat(d.price);
    });

    return total_price / data.length;
  } else return 0;
}

function Percentile(data, p) {
  if (data !== null && data !== undefined && data.length !== 0) {
    const k = data.length;
    let n = (k - 1) * p; // because index starts at 0
    n = Math.ceil(n); // always rounds up
    let data_sorted = data.sort((a, b) => SortByPrice(a, b, "inc"));
    return data_sorted[n].price;
  } else return 0;
}

function LifetimeValue(data) {
  let oldestValue = 0;

  data.forEach((item) => {
    const released_date = new Date(item.published);
    const current_date = Date.now();
    const timeDifference = current_date - released_date.getTime();
    if (timeDifference > oldestValue) {
      oldestValue = released_date;
    }
  });

  const days = Math.ceil(oldestValue / (1000 * 60 * 60 * 24));
  return days;
}

function DealReleaseDate(deal) {
  var date = "";

  const released_date = new Date(deal.published * 1000);

  const now = new Date();

  const differenceInMilliseconds = now - released_date;

  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 3600 * 24)
  );
  date = differenceInDays + " days ago";

  if (differenceInDays < 1) {
    // Calculate the difference in hours

    const differenceInHours = Math.floor(
      differenceInMilliseconds / (1000 * 3600)
    );
    date = differenceInHours + " hours ago";
  }

  return date;
}

function DetailReleaseDate(deal) {
  let date = "";

  const released_date = new Date(deal.published * 1000);
  const now = new Date();

  const differenceInMilliseconds = now - released_date;
  const differenceInDays = Math.floor(
    differenceInMilliseconds / (1000 * 3600 * 24)
  );

  if (differenceInDays >= 1) {
    // Format: "Published on Month day, year"
    const options = { month: "long", day: "numeric", year: "numeric" };
    date = "Published on " + released_date.toLocaleDateString("en-US", options);
  } else {
    // Calculate the difference in hours and format: "Published X hours ago"
    const differenceInHours = Math.floor(
      differenceInMilliseconds / (1000 * 3600)
    );
    date = "Published " + differenceInHours + " hours ago";
  }

  return date;
}

const renderFavorites = () => {
  // Filtrer les deals dont les IDs sont dans `favorites`
  const favoriteDeals = currentDeals.filter((deal) => favorites.has(deal.id));

  // Appelle `renderDeals` avec la liste des deals favoris
  renderDeals(favoriteDeals, true);

  // Met à jour le contenu de `sectionFavorites`
  //sectionFavorites.innerHTML = "Here are your favorite deals!";
};

function AddToFavorite(id) {
  favorites.add(id);
  renderDeals(currentDeals);
  renderFavorites();
}

function RemoveFromFavorite(id) {
  favorites.delete(id);
  renderDeals(currentDeals);
  renderFavorites();
}

async function openPopup(_id, legoId) {
  // let selectedLegoId = selectLegoSetIds.value;

  sectionVinted.innerHTML = "";

  // Vérifiez si une option valide est sélectionnée
  try {
    // openPopup();
    // Appeler fetchVintedFromId avec la valeur sélectionnée
    const sales = await fetchVintedFromId(legoId);
    const deal = await fetchDealFromId(_id);
    document.getElementById(
      "header-title"
    ).innerHTML = `<h2 style="font-family: 'LegoFont'; margin:0;">LEGO ${legoId}</h2>`;
    renderDealDetails(deal);
    renderVintedSales(sales, legoId); // Appelle la fonction pour render les ventes
    renderIndicators(currentPagination);
    renderDealEvaluation(deal, sales);
  } catch (error) {
    console.error("Error fetching sales data:", error);
  }

  popupOverlay.style.display = "block";
}

closePopup.addEventListener("click", closePopupFunc);

function closePopupFunc() {
  popupOverlay.style.display = "none";
}

popupOverlay.addEventListener("click", function (event) {
  if (event.target === popupOverlay) {
    closePopupFunc();
  }
});

function showCategory(category) {
  const dealsButton = document.getElementById("dealsButton");
  const favoritesButton = document.getElementById("favoritesButton");
  const paginationContainer = document.getElementById("pagination-container");

  if (category === "deals") {
    dealsButton.classList.add("active");
    favoritesButton.classList.remove("active");
    sectionDeals.style.display = "block";
    sectionOptions.style.display = "block";
    sectionFavorites.style.display = "none";
    paginationContainer.style.display = "flex";
    render(currentDeals, currentPagination);
  } else {
    favoritesButton.classList.add("active");
    dealsButton.classList.remove("active");
    sectionDeals.style.display = "none";
    sectionOptions.style.display = "none";
    paginationContainer.style.display = "none";
    sectionFavorites.style.display = "block";
    renderFavorites();
    RemoveAllFilters();
  }
}
const renderDealEvaluation = (deal, sales) => {
  const { nbsales, avg, p5, p25, p50, p95, lifetime } = renderIndicators(sales);

  sectionDealEvaluation.innerHTML = "";

  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");

  if (nbsales === 0) {
    const template = ` 
      <div class="deal-evaluation-container">
        <h2 class="deal-evaluation-title-main">DEAL EVALUATION</h2>
        <div class="deal-evaluation">
          <!-- Error message if no Vinted sales -->
          <div class="deal-evaluation-message">
            <p>Unable to evaluate this deal because there are no Vinted sales available</p>
          </div>
        </div>
      </div>
    `;
    div.innerHTML = template;
    fragment.appendChild(div);
    sectionDealEvaluation.appendChild(fragment);
    return;
  }

  // Calculating the difference in days between the current date and the deal publication date
  const now = new Date();
  const dealDate = new Date(deal.published * 1000);
  const dealAgeInDays = Math.floor((now - dealDate) / (1000 * 3600 * 24));

  // Variables for deal evaluation
  let score = 0;
  let explanation = [];

  // Price lower than retail
  if (deal.price < deal.retail) {
    score += 2;
    explanation.push("Price is lower than retail");
  } else {
    score += 1;
    explanation.push("Price is close to retail");
  }

  // Significant discount (>30%)
  if (deal.discount > 30) {
    score += 3;
    explanation.push(`Significant discount of (${deal.discount}%)`);
  } else if (deal.discount > 0) {
    score += 2;
    explanation.push(`Discount of (${deal.discount}%)`);
  }

  // Temperature (popular deal)
  if (deal.temperature > 80) {
    score += 2;
    explanation.push(`Very popular deal (${deal.temperature}°)`);
  } else if (deal.temperature > 50) {
    score += 1;
    explanation.push(`Deal not that popular (${deal.temperature}°)`);
  }

  // Comparison with Vinted sales
  if (deal.price < avg) {
    score += 2;
    explanation.push("Price is lower than the average sales price");
  } else if (deal.price < p50) {
    score += 1;
    explanation.push("Price is close to the median sales price");
  }

  // Recent sales on Vinted
  if (currentPagination.page === 1 && nbsales > 0) {
    score += 2;
    explanation.push("There have been recent sales on Vinted");
  }

  // Recent deal
  if (dealAgeInDays <= 30) {
    score += 2;
    explanation.push("This deal is recent");
  }

  // Final result
  let dealWorthIt = false;
  let finalMessage = "";

  if (score >= 10) {
    dealWorthIt = true;
    finalMessage = "This is a great deal!";
  } else if (score >= 6) {
    dealWorthIt = true;
    finalMessage = "This deal is okay";
  } else {
    dealWorthIt = false;
    finalMessage = "This deal is not very appealing";
  }

  const template = ` 
    <div class="deal-evaluation-container">
      <h2 class="deal-evaluation-title-main">DEAL EVALUATION</h2>
      <div class="deal-evaluation">
        <!-- Score section -->
        <div class="deal-evaluation-score">
          <div class="deal-evaluation-icon">
            <i class="fas fa-check-circle" style="color: ${
              dealWorthIt ? "#4CAF50" : "#F44336"
            };"></i>
          </div>
          <div class="deal-evaluation-summary">
            <h4 class="deal-evaluation-summary-text">${finalMessage}</h4>
          </div>
        </div>

        <!-- Criteria section as a list -->
        <div class="deal-evaluation-criteria">
          <ul class="deal-evaluation-criteria-list">
            ${explanation.map((item) => `<li>${item}</li>`).join("")}
          </ul>
        </div>

        <!-- Final section with color -->
        <div class="deal-evaluation-final-message ${
          dealWorthIt ? "deal-evaluation-positive" : "deal-evaluation-negative"
        }">
          <p>${
            dealWorthIt
              ? "Go for it, it's a great deal!"
              : "This deal is not very appealing."
          }</p>
        </div>
      </div>
    </div>
  `;

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDealEvaluation.appendChild(fragment);
};
