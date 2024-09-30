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

let isDiscountFiltered = false;
let isCommentedFiltered = false;

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectLegoSetIds = document.querySelector('#lego-set-id-select');
const sectionDeals= document.querySelector('#deals');
const spanNbDeals = document.querySelector('#nbDeals');

const discountButton = document.getElementById("discountButton");
const commentedButton = document.getElementById("commentedButton");


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
  const options = ids.map(id => 
    `<option value="${id}">${id}</option>`
  ).join('');

  selectLegoSetIds.innerHTML = options;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbDeals.innerHTML = count;
};

const render = (deals, pagination) => {
  renderDeals(deals);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderLegoSetIds(deals)
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

  setCurrentDeals(deals);
  render(currentDeals, currentPagination);
});


async function onClickBestDiscount(){
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
    console.log("deals : ", currentDeals);
    console.log("deals filtered : ", deals_filtered);
  
    isDiscountFiltered = true;
    discountButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
    //setCurrentDeals(deals);
  }
  render(currentDeals, currentPagination);

}


async function onClickMostCommented(){
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
    console.log("deals : ", currentDeals);
    console.log("deals filtered : ", deals_filtered);
  
    isCommentedFiltered = true;
    commentedButton.style.backgroundColor = "lightblue";
    currentDeals = deals_filtered;
    //setCurrentDeals(deals);
  }
  render(currentDeals, currentPagination);

}

function RemoveAllFilters() {
  isDiscountFiltered = false;
  discountButton.style.backgroundColor = "";

  isCommentedFiltered = false;
  commentedButton.style.backgroundColor = "";
}