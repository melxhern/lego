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

let sortPriceState = 0; // 0: no sort, 1: ascending, 2: descending
let sortDateState = 0; // 0: no sort, 1: ascending, 2: descending

// instantiate the selectors
const selectShow = document.querySelector("#show-select");
const selectPage = document.querySelector("#page-select");
const selectLegoSetIds = document.querySelector("#lego-set-id-select");
const sectionDeals = document.querySelector("#deals");
const sectionVinted = document.querySelector("#vinted");
const sectionFavorites = document.querySelector("#favorites");
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
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({ result, meta }) => {
  currentDeals = result;
  currentPagination = meta;
};

/**
 * Fetch deals from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchDeals = async (page = 1, size = 6) => {
  try {
    const response = await fetch(
      `https://lego-api-blue.vercel.app/deals?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { currentDeals, currentPagination };
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return { currentDeals, currentPagination };
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
      `https://lego-api-blue.vercel.app/sales?id=${id}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return { currentDeals, currentPagination };
    }

    return body.data;
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
  const template = `
  <div class="sort-bar" style="align-items:center;" >
    <span>Sort By : </span>
    <button class="sort-button" onclick="SortingPrice()" >
      Price <span id="price-sort-icon"><img src="https://img.icons8.com/ios-filled/50/sort.png" width="14" height="14" /></span>
    </button>
    <button class="sort-button" onclick="SortingDate()">
      Date <span id="date-sort-icon"><img src="https://img.icons8.com/ios-filled/50/sort.png" width="14" height="14" /></span>
    </button>
  </div>

  <div class="deals-container">
    ${deals
      .map((deal) => {
        const isFavorite = favorites.has(deal.uuid);
        const heartIcon = isFavorite
          ? `<img width="24" height="24" class="heart-icon" src="https://img.icons8.com/sf-regular-filled/48/hearts.png" alt="hearts-filled" onclick="event.stopPropagation(); RemoveFromFavorite('${deal.uuid}')"/>`
          : `<img width="24" height="24" class="heart-icon" src="https://img.icons8.com/sf-regular/48/hearts.png" alt="hearts" onclick="event.stopPropagation(); AddToFavorite('${deal.uuid}')"/>`;

        return `
          <div class="deal-card" id="${deal.uuid}" onclick="openPopup(${
          deal.id
        })">
            <div class="deal-image">
              <img src="${deal.photo}" alt="${deal.title}" />
            </div>  
            <div class="deal-info"> 
              <div class="card-header">
                <div>${heartIcon}</div>
                <div class="deal-date" style="display:flex;">
                  <span class="icon-clock" style="display:inline-flex;">
                    <svg width="20px" height="20px" viewBox="0 0 24 24" fill="#888888"><path d="M12,0c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12S18.6,0,12,0Zm0,22c-5.5,0-10-4.5-10-10S6.5,2,12,2s10,4.5,10,10S17.5,22,12,22ZM10.9,3.9l-.4,8.2.1.9,6.1,5.4,1-1L12.6,13l-.4-8.1Z"/></svg>
                  </span>
                  <span style="margin-left: 0.2rem;">${DealReleaseDate(
                    deal
                  )}</span>
                </div>
              </div>
              <div class="card-body">
                <div class="deal-title" onclick="event.stopPropagation();"><a href="${
                  deal.link
                }" target="_blank">${deal.title}</a></div>
                <div class="deal-prices"> 
                  <div class="deal-price">${deal.price} €</div>
                  <div class="deal-retail">${deal.retail} €</div>
                  <div class="deal-discount">-${deal.discount}%</div>
                </div>
                <div style="display:flex;">
                  <img class="deal-comments" width="22" height="22" src="https://img.icons8.com/windows/32/messaging-.png" alt="messaging-" style="display:inline-flex; margin-right: 0.2rem;"/>
                  <span class="deal-comments">${deal.comments}</span>

                </div>
              </div>
            </div>
          </div>
        `;
      })
      .join("")}
  </div>
`;

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
  vintedSales = sales.result;

  const fragment = document.createDocumentFragment();
  const div = document.createElement("div");
  const template = `
    ${vintedSales
      .map((sale) => {
        return `
              <div class="deal-card" id="${sale.uuid}">
                <div class="card-body">
                  <div class="deal-title"><a href="${
                    sale.link
                  }" target="_blank">${sale.title}</a></div>
                  <div class="deal-price">${sale.price}</div>
                  <div class="deal-date">${new Date(
                    sale.published * 1000
                  ).toLocaleDateString()}</div>
                </div>
              </div>
            `;
      })
      .join("")}
  `;

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionVinted.innerHTML = `<h2 style="font-family: 'LegoFont'; font-size: 3rem;">VINTED SALES</h2>`;
  sectionVinted.appendChild(fragment);
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = (pagination) => {
  const { currentPage, pageCount } = pagination;
  const options = Array.from(
    { length: pageCount },
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join("");

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = (pagination) => {
  const { count } = pagination;

  spanNbDeals.innerHTML = count;
  spanNbSales.innerHTML = vintedSales.length;

  spanAvg.innerHTML = parseFloat(AvgPrice(vintedSales)).toFixed(2);
  spanP5.innerHTML = Percentile(vintedSales, 0.05);
  spanP25.innerHTML = Percentile(vintedSales, 0.25);
  spanP50.innerHTML = Percentile(vintedSales, 0.5);
  spanP95.innerHTML = Percentile(vintedSales, 0.95);

  spanLifetime.innerHTML = LifetimeValue(vintedSales) + " days";
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
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

  if (test > spanNbDeals.textContent) {
    page = spanNbDeals.textContent / showNbDeals;
    page = Math.ceil(page); // always round the page up
  }
  const deals = await fetchDeals(page, showNbDeals);

  RemoveAllFilters();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});

const updateSortIcons = () => {
  // Met à jour l'icône en fonction de l'état de tri
  const priceIcon = document.getElementById("price-sort-icon");
  const dateIcon = document.getElementById("date-sort-icon");

  priceIcon.src =
    sortPriceState === 1
      ? "https://img.icons8.com/ios-filled/50/up.png"
      : sortPriceState === 2
      ? "https://img.icons8.com/ios-filled/50/down.png"
      : "https://img.icons8.com/ios-filled/50/sort.png";

  dateIcon.src =
    sortDateState === 1
      ? "https://img.icons8.com/ios-filled/50/up.png"
      : sortDateState === 2
      ? "https://img.icons8.com/ios-filled/50/down.png"
      : "https://img.icons8.com/ios-filled/50/sort.png";
};

/**
 * Select the page to display
 */
selectPage.addEventListener("change", async (event) => {
  let page = parseInt(event.target.value);
  let test = page * currentDeals.length;

  if (test > spanNbDeals.textContent) {
    page = spanNbDeals.textContent / currentDeals.length;
    page = Math.ceil(page);
  }

  const deals = await fetchDeals(page, parseInt(selectShow.value));

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
function SortingPrice() {
  sortDateState = 0;

  switch (sortPriceState) {
    case 0:
      currentDeals = currentDeals.sort((a, b) => SortByPrice(a, b, "inc"));
      sortPriceState = 1;
      break;

    case 1:
      currentDeals = currentDeals.sort((a, b) => SortByPrice(a, b, "dec"));
      sortPriceState = 2;
      break;

    default: // reset to default order
      currentDeals = currentDeals.sort((a, b) => a.rowIndex - b.rowIndex);
      sortPriceState = 0;
      break;
  }
  RemoveAllFilters();
  render(currentDeals, currentPagination);

  // Appliquer les icônes après le rendu
  const icon = document.querySelector("#price-sort-icon");
  if (icon) {
    if (sortPriceState === 1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-up.png" alt="sort-up"/>'; // Flèche vers le haut
    } else if (sortPriceState === 2) {
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
function SortingDate() {
  sortPriceState = 0;
  //currentDeals = currentDeals.sort((a, b) => a.rowIndex - b.rowIndex);

  switch (sortDateState) {
    case 0:
      currentDeals = currentDeals.sort((a, b) => SortByDate(a, b, "inc"));
      sortDateState = 1;

      break;
    case 1:
      currentDeals = currentDeals.sort((a, b) => SortByDate(a, b, "dec"));
      sortDateState = 2;

      break;

    default: // reset to default order
      currentDeals = currentDeals.sort((a, b) => a.rowIndex - b.rowIndex);
      sortDateState = 0;
      break;
  }
  RemoveAllFilters();
  render(currentDeals, currentPagination);

  // Appliquer les icônes après le rendu
  const icon = document.querySelector("#date-sort-icon");
  if (icon) {
    if (sortDateState === 1) {
      icon.innerHTML =
        '<img width="12" height="12" src="https://img.icons8.com/ios-filled/50/sort-up.png" alt="sort-up"/>'; // Flèche vers le haut
    } else if (sortDateState === 2) {
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
    const deals = await fetchDeals(
      parseInt(selectPage.value),
      parseInt(selectShow.value)
    );
    setCurrentDeals(deals);
    isDiscountFiltered = false;
    discountButton.classList.remove("active");
    //discountButton.style.backgroundColor = "";
  } else {
    let deals_filtered = [];

    currentDeals.forEach((deal) => {
      if (deal.discount >= 50) {
        deals_filtered.push(deal);
      }
    });

    isDiscountFiltered = true;
    discountButton.classList.add("active");
    //discountButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);
}

async function onClickMostCommented() {
  RemoveAllFilters("commented");

  if (isCommentedFiltered) {
    const deals = await fetchDeals(
      parseInt(selectPage.value),
      parseInt(selectShow.value)
    );
    setCurrentDeals(deals);
    isCommentedFiltered = false;
    commentedButton.classList.remove("active");
    //commentedButton.style.backgroundColor = "";
  } else {
    let deals_filtered = [];

    currentDeals.forEach((deal) => {
      if (deal.comments >= 15) {
        deals_filtered.push(deal);
      }
    });

    isCommentedFiltered = true;
    commentedButton.classList.add("active");
    //commentedButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);
}

async function onClickHotDeals() {
  await RemoveAllFilters("hotDeal");

  if (isHotDealFiltered) {
    const deals = await fetchDeals(
      parseInt(selectPage.value),
      parseInt(selectShow.value)
    );
    setCurrentDeals(deals);
    isHotDealFiltered = false;
    hotDealButton.classList.remove("active");
    //hotDealButton.style.backgroundColor = "";
  } else {
    let deals_filtered = [];

    currentDeals.forEach((deal) => {
      if (deal.temperature >= 100) {
        deals_filtered.push(deal);
      }
    });

    isHotDealFiltered = true;
    hotDealButton.classList.add("active");
    //hotDealButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);
}

async function RemoveAllFilters(filterToKeep = null) {
  const deals = await fetchDeals(
    parseInt(selectPage.value),
    parseInt(selectShow.value)
  );
  setCurrentDeals(deals);

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

function SortByDate(a, b, order) {
  switch (order) {
    case "inc":
      return new Date(b.published * 1000) - new Date(a.published * 1000);
    case "dec":
      return new Date(a.published * 1000) - new Date(b.published * 1000);
    default:
      return new Date(b.published * 1000) - new Date(a.published * 1000); // increase by default
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
    const differenceInHours = Math.floor(differenceInDays / (1000 * 3600));
    date = differenceInHours + " hours ago";
  }

  return date;
}

const renderFavorites = () => {
  // Filtrer les deals dont les IDs sont dans `favorites`
  const favoriteDeals = currentDeals.filter((deal) => favorites.has(deal.uuid));

  // Appelle `renderDeals` avec la liste des deals favoris
  renderDeals(favoriteDeals, true);

  // Met à jour le contenu de `sectionFavorites`
  //sectionFavorites.innerHTML = "Here are your favorite deals!";
};

function AddToFavorite(uuid) {
  favorites.add(uuid);
  renderDeals(currentDeals);
  renderFavorites();
}

function RemoveFromFavorite(uuid) {
  favorites.delete(uuid);
  renderDeals(currentDeals);
  renderFavorites();
}

async function openPopup(id) {
  // let selectedLegoId = selectLegoSetIds.value;

  sectionVinted.innerHTML = "";

  // Vérifiez si une option valide est sélectionnée
  if (id) {
    try {
      // openPopup();
      // Appeler fetchVintedFromId avec la valeur sélectionnée
      const sales = await fetchVintedFromId(id);
      renderVintedSales(sales, id); // Appelle la fonction pour rendre les ventes
      renderIndicators(currentPagination);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
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

  if (category === "deals") {
    dealsButton.classList.add("active");
    favoritesButton.classList.remove("active");
    sectionDeals.style.display = "block";
    sectionFavorites.style.display = "none";
    render(currentDeals, currentPagination);
  } else {
    favoritesButton.classList.add("active");
    dealsButton.classList.remove("active");
    sectionDeals.style.display = "none";
    sectionFavorites.style.display = "block";
    renderFavorites();
    RemoveAllFilters();
  }
}
