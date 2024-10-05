// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

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

let isDiscountFiltered = false;
let isCommentedFiltered = false;
let isHotDealFiltered = false;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sortBy = document.querySelector('#sort-select');
const sectionDeals= document.querySelector('#deals');
const sectionVinted = document.querySelector('#vinted');
const spanNbDeals = document.querySelector('#nbDeals');
const spanNbSales = document.querySelector('#nbSales');
const spanAvg = document.querySelector("#avg");
const spanP5 = document.querySelector("#p5");
const spanP25 = document.querySelector("#p25");
const spanP50 = document.querySelector("#p50");
const spanP95 = document.querySelector("#p95");


const discountButton = document.getElementById("discountButton");
const commentedButton = document.getElementById("commentedButton");
const hotDealButton = document.getElementById("hotDealButton");


/**
 * Set global value
 * @param {Array} result - deals to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentDeals = ({result, meta}) => {
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
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
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
      return {currentDeals, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentDeals, currentPagination};
  }
};


/**
 * Render list of deals
 * @param  {Array} deals
 */
const renderDeals = deals => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = deals
    .map(deal => {
      return `
      <div class="deal" id=${deal.uuid}>
        <span>${deal.id}</span>
        <a href="${deal.link}">${deal.title}</a>
        <span>${deal.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionDeals.innerHTML = '<h2>Deals</h2>';
  sectionDeals.appendChild(fragment);
};


/**
 * Render list of deals
 * @param  {Array} sales
 */
const renderVintedSales = sales => {
  vintedSales = sales.result;
  console.log("sales : ", sales.result);
  //console.log("lego : ", parseInt(selectLegoSetIds.value));
  
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = vintedSales
    .map(sale => {
      return `
      <div class="sale" id=${sale.uuid}>
        <span>${parseInt(selectLegoSetIds.value)}</span>
        <a href="${sale.link}">${sale.title}</a>
        <span>${sale.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionVinted.innerHTML = '<h2>Vinted Sales</h2>';
  sectionVinted.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render lego set ids selector
 * @param  {Array} lego set ids
 */
const renderLegoSetIds = deals => {
  const ids = getIdsFromDeals(deals);
  const options =  [
    '<option value=""></option>', // Option vide
    ...ids.map(id => `<option value="${id}">${id}</option>`)
  ].join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
  console.log("nb sales : ", vintedSales.length);
  spanNbSales.innerHTML = vintedSales.length;

  spanAvg.innerHTML = parseFloat(AvgPrice(vintedSales)).toFixed(2);
  spanP5.innerHTML = Percentile(vintedSales, 0.05);
  spanP25.innerHTML = Percentile(vintedSales, 0.25);
  spanP50.innerHTML = Percentile(vintedSales, 0.5);
  spanP95.innerHTML = Percentile(vintedSales, 0.95);
};


const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of deals to display
 */
selectShow.addEventListener('change', async (event) => {
  let page = currentPagination.currentPage;
  const showNbDeals = parseInt(event.target.value)
  
  let test = page * showNbDeals;

  if(test > spanNbDeals.textContent){
    page = spanNbDeals.textContent / showNbDeals;
    page = Math.ceil(page); // always round the page up

  }
  const deals = await fetchDeals(page, showNbDeals);

  RemoveAllFilters();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


/**
 * Select the number of deals to display
 */
selectLegoSetIds.addEventListener('change', async() => {
  let selectedLegoId = selectLegoSetIds.value;
  console.log("lego id : ", selectedLegoId);

  sectionVinted.innerHTML = '';
  
  // Vérifiez si une option valide est sélectionnée
  if (selectedLegoId) {
    try {
      // Appeler fetchVintedFromId avec la valeur sélectionnée
      const sales = await fetchVintedFromId(selectedLegoId);
      console.log("Fetched Sales Data:", sales);
      renderVintedSales(sales); // Appelle la fonction pour rendre les ventes
      renderIndicators(currentPagination);
    } catch (error) {
      console.error("Error fetching sales data:", error);
    }
  }

});


/**
 * Select the page to display
 */
selectPage.addEventListener('change', async (event) => {
  let page = parseInt(event.target.value);
  let test = page * currentDeals.length;

  if(test > spanNbDeals.textContent){
    page = spanNbDeals.textContent / currentDeals.length;
    page = Math.ceil(page);

  }

  const deals = await fetchDeals(page, parseInt(selectShow.value));
  
  RemoveAllFilters();
  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


document.addEventListener('DOMContentLoaded', async () => {
  const deals = await fetchDeals();
  //const sales = await fetchVintedFromId();
  //renderVintedSales(sales);

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


/**
 * Sort by the value choosen
 */
sortBy.addEventListener('change', async (event) => {

  const sortValue = event.target.value; 

  switch(sortValue) {
    case "price-asc":
      currentDeals = currentDeals.sort((a,b) => SortByPrice(a,b, "inc"));
      break;
    case "price-desc":
      currentDeals = currentDeals.sort((a,b) => SortByPrice(a,b, "dec"));
      break;
    case "date-asc":
      currentDeals = currentDeals.sort((a,b) => SortByDate(a,b, "inc"));
      break;
    case "date-desc":
        currentDeals = currentDeals.sort((a,b) => SortByDate(a,b, "dec"));
        break;
    default:
      currentDeals = currentDeals.sort((a,b) => SortByPrice(a,b, "dec"));
      break;
  }
  RemoveAllFilters();
  render(currentDeals, currentPagination);
});



async function onClickBestDiscount(){
  RemoveAllFilters("discount");

  if(isDiscountFiltered){
    const deals = await fetchDeals(parseInt(selectPage.value), parseInt(selectShow.value)); 
    setCurrentDeals(deals);
    isDiscountFiltered = false; 
    discountButton.style.backgroundColor = "";
  }
  else{
    let deals_filtered = [];

    currentDeals.forEach(deal => {
      if(deal.discount >= 50){
        deals_filtered.push(deal);
      }
    }) 

    isDiscountFiltered = true;
    discountButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);

}


async function onClickMostCommented(){
  RemoveAllFilters("commented");

  if(isCommentedFiltered){
    const deals = await fetchDeals(parseInt(selectPage.value), parseInt(selectShow.value)); 
    setCurrentDeals(deals);
    isCommentedFiltered = false; 
    commentedButton.style.backgroundColor = "";
  }
  else{
    let deals_filtered = [];

    currentDeals.forEach(deal => {
      if(deal.comments >= 15){
        deals_filtered.push(deal);
      }
    })

    isCommentedFiltered = true;
    commentedButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);

}

async function onClickHotDeals(){
  await RemoveAllFilters("hotDeal");

  if(isHotDealFiltered){
    const deals = await fetchDeals(parseInt(selectPage.value), parseInt(selectShow.value)); 
    setCurrentDeals(deals);
    isHotDealFiltered = false; 
    hotDealButton.style.backgroundColor = "";
  }
  else{
    let deals_filtered = [];

    currentDeals.forEach(deal => {
      if(deal.temperature >= 100){
        deals_filtered.push(deal);
      }
    })
  
    isHotDealFiltered = true;
    hotDealButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
  }
  render(currentDeals, currentPagination);

}

async function RemoveAllFilters(filterToKeep = null) {
  const deals = await fetchDeals(parseInt(selectPage.value), parseInt(selectShow.value)); 
  setCurrentDeals(deals);

  if (filterToKeep !== "discount") {
    isDiscountFiltered = false;
    discountButton.style.backgroundColor = "";
  }
  
  if (filterToKeep !== "commented") {
    isCommentedFiltered = false;
    commentedButton.style.backgroundColor = "";
  }
  
  if (filterToKeep !== "hotDeal") {
    isHotDealFiltered = false;
    hotDealButton.style.backgroundColor = ""; 
  }
}

function SortByPrice(a, b, order) {
  switch (order) {
    case "inc":
      return a.price - b.price;
    case "dec":
      return b.price - a.price;
    default:
      return a.price - b.price;  // increase by default
  }
}

function SortByDate(a, b, order) {
  switch (order) {
    case "inc":
      return new Date(b.published) - new Date(a.published);
    case "dec":
      return new Date(a.published) - new Date(b.published);
    default:
      return new Date(b.published) - new Date(a.published);  // increase by default
  }
}

function AvgPrice(data) {
  if(data !== null && data !== undefined && data.length !== 0){
    let total_price = 0;
    data.forEach(d => {
      total_price += parseFloat(d.price);
    });
    
    return total_price / data.length;
  }
  else return 0;
}


function Percentile(data, p){
  if(data !== null && data !== undefined && data.length !== 0){
    const k = data.length;
    let n = (k-1) * p; // because index starts at 0
    n = Math.ceil(n); // always rounds up
    let data_sorted = data.sort((a,b) => SortByPrice(a,b, "inc"));
    return data_sorted[n].price;
  }
  else return 0;
}