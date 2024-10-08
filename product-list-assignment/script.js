const barMenu = document.getElementById("bar");
const closeBtn = document.getElementById("close");
const nav = document.getElementById("navbar");
let productDiv = document.querySelector(".main-product-list-section");
let categoryListDiv = document.querySelector(".main-category-list");
const loader = document.getElementById("loader");
const content = document.getElementById("content");
const error = document.getElementById("error-page");
const pagination = document.getElementById("pagination");
const sortDropdown = document.getElementById("sort");

const totalResultsElement = document.getElementById("total-results");
const totalItemsElement = document.getElementById("total-items");
const cartItemsElement = document.getElementsByClassName(
  "cart-items-count-badge"
);
const cartItemsElementArray = Array.from(cartItemsElement);
const listUrl = "https://fakestoreapi.com/products";

let allCategory = [];
let productListData = [];
let filteredProductListData = [];
let cart = {};
let searchedText = "";
let currentPage = 1;
const itemsPerPage = 6;

// for navigation hamburger menu hide show
if (barMenu) {
  barMenu.addEventListener("click", () => {
    nav.classList.add("active");
  });
}
if (closeBtn) {
  closeBtn.addEventListener("click", () => {
    nav.classList.remove("active");
  });
}

// for loader
window.addEventListener("load", () => {
  const loader = document.querySelector(".loader");
  loader.classList.add("loader-hidden");

  loader.addEventListener("transitionend", () => {
    document.body.removeChild("loader");
  });
});

// api fetching
let fetchProductData = async (checked = []) => {
  loader.style.display = "flex";
  content.style.display = "none";
  error.style.display = "none";
  try {
    let product = await fetch(listUrl);
    productListData = await product.json();
    setupFilters();
    filterProductList();
    setupSort();
  } catch (error) {
    console.error(error);
    error.style.display = "flex";
  } finally {
    loader.style.display = "none";
    if (error.style.display === "none") {
      content.style.display = "flex";
    }
  }
};

// for filter from checkbox
function setupFilters() {
  const categories = [...new Set(productListData.map((item) => item.category))]; // Get unique categories
  categoryListDiv.innerHTML = categories
    .map(
      (category) => `
        <label>
            <input type="checkbox" class="filter-checkbox" value="${category}">
            ${category.charAt(0).toUpperCase() + category.slice(1)}
        </label>
    `
    )
    .join("");

  document.querySelectorAll(".filter-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", filterProductList);
  });
}

function filterProductList() {
  const selectedCategories = [
    ...document.querySelectorAll(".filter-checkbox:checked"),
  ].map((checkbox) => checkbox.value);
  filteredProductListData = selectedCategories.length === 0 ? productListData : productListData.filter((item) =>
    selectedCategories.includes(item.category)
  );

  if(searchedText){
    filteredProductListData = productListData.filter(product=>
      product.title.toLowerCase().includes(searchedText.toLowerCase())
    )
  }

  const sortOption = sortDropdown.value;
  if (sortOption === "price-asc") {
    filteredProductListData.sort((a, b) => a.price - b.price);
  } else if (sortOption === "price-desc") {
    filteredProductListData.sort((a, b) => b.price - a.price);
  }

  currentPage = 1;
  setupPagination();
  displayData(currentPage);
}

function setupSort() {
  sortDropdown.addEventListener("change", function () {
    filterProductList();
  });
}

function searchProduct(searchText) {
  searchedText = searchText;
  filterProductList();
}

function displayData(page) {
  const start = (page - 1) * itemsPerPage;
  const end = page * itemsPerPage;
  const paginatedData = filteredProductListData.slice(start, end);
  totalResultsElement.textContent = `${filteredProductListData.length} Results`;

  productDiv.innerHTML = paginatedData
    .map(
      (element) =>
        `<div class="single-product">
               <div><img class="image-product" src=${
                 element.image
               } width="200px" height="300px"></div>
                <div class="product-info">
                <div class="product-title-info">
                <a  href="/productDetail.html" onclick='setProductToLocalStorage("${
                  element.id
                }")'>${element.title}</a>
                <p>$ ${element.price}</p>
                </div>
                <div>
                <button 
                            class="add-to-cart-button ${
                              cart[element.id] ? "added" : ""
                            }"  
                             data-id="${element.id}" 
                             onclick="cartItemChange(${element.id})">
                             ${
                               cart[element.id]
                                 ? "Added to Cart"
                                 : "Add to Cart"
                             }
                </button>
                </div>
                </div>
            </div>`
    )
    .join("");
}

//for pagination
function setupPagination() {
  const totalPages = Math.ceil(filteredProductListData.length / itemsPerPage);
  pagination.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const activeClass = i === currentPage ? "active" : "";
    pagination.innerHTML += `<p class="${activeClass}" onclick="changePage(${i})">${i}</p>`;
  }
  if (currentPage < totalPages) {
    pagination.innerHTML +=
      '<p onclick="changePage(' + (currentPage + 1) + ')">Next</p>';
  } else {
    pagination.innerHTML += '<p class="disabled">Next</p>';
  }
}

// pagination page change
const changePage = function (page) {
  if (
    page < 1 ||
    page > Math.ceil(filteredProductListData.length / itemsPerPage)
  )
    return;
  currentPage = page;
  displayData(currentPage);
  setupPagination();
};

//cart button click
const cartItemChange = function (id) {
  const button = document.querySelector(`button[data-id="${id}"]`);
  if (cart[id]) {
    delete cart[id];
    button.textContent = "Add to Cart";
    button.classList.remove("added");
  } else {
    cart[id] = true;
    button.textContent = "Added to Cart";
    button.classList.add("added");
  }
  cartItemsElementArray.forEach((element) => {
    element.textContent = `${Object.keys(cart).length}`;
  });
};

fetchProductData();
