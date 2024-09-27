let mainProducts = document.querySelector(".main-products");
let productsTotals = document.querySelector(".total");
let basketTableBody = document.querySelector(".table-body");
let showModalBody = document.querySelector(".modal-body-content");

let baskets = JSON.parse(localStorage.getItem("basket")) || [];

async function getProductsFromApi() {
    const response = await fetch('https://fakestoreapi.com/products');
    return await response.json();
}

document.addEventListener("DOMContentLoaded", async function () {
    mainProducts.innerHTML = `<img class="loading-img" src="./images/Loading_gif.gif" alt="">`;
    const products = await getProductsFromApi();
    ShowProducts(products);
    ShowBaskets(products);
});

function ShowProducts(products) {
    mainProducts.innerHTML = "";
    products.forEach(product => {
        mainProducts.innerHTML += `
            <div class="product">
                <div class="product-img"><img src="${product.image}" alt=""></div>
                <p class="product-name">${product.title.length > 25 ? product.title.substring(0, 25).concat("...") : product.title}</p>
                <span class="product-price">$${product.price}</span>
                <button class="product-btn" data-bs-toggle="modal" data-bs-target="#productModal" 
                   data-image="${product.image}" 
                   data-title="${product.title}" 
                   data-price="${product.price}"
                   data-id="${product.id}"
                   data-desc="${product.description}"
                   data-categ="${product.category}"
                   data-rate="${product.rating.rate}">
                   Show More</button>
                <i class="add-favori fa-solid fa-heart"></i>
                <i class="add-basket fa-solid fa-cart-shopping" 
                   data-image="${product.image}" 
                   data-price="${product.price}"
                   data-id="${product.id}"></i>
            </div>`;
    });

    document.querySelectorAll('.product-btn').forEach(button => {
        button.addEventListener('click', function () {
            const { image, title, price, desc, categ, rate } = this.dataset;
            AboutProduct(image, Number(price), title, desc, categ, Number(rate));
        });
    });

    document.querySelectorAll('.add-basket').forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute("data-id");
            AddBasket(products, productId, this);
        });
    });
}

function AboutProduct(productImg, productPrice, productTitle, productDesc, productCategory, productRate) {
    showModalBody.innerHTML = `
    <div class="d-flex justify-content-center align-items-center p-5"><img class="modal-img" src="${productImg}" alt=""></div>
    <div class="p-5">
        <h3><b>${productTitle}</b></h3>
        <p>$${productPrice}</p>
        <p>${productDesc}</p>
        <p>Category - ${productCategory}</p>
        <p>Rating - ${productRate} <i class="fa-solid fa-star"></i></p>
    </div>`;
}

function AddBasket(products, productId, element) {
    const existingProduct = baskets.find(basket => basket.id === productId);
    if (!existingProduct) {
        element.classList.add("active");
        baskets.push({ id: productId, count: 1 });
    } else {
        element.classList.remove("active");
        DeleteBasketRow(productId);
    }
    localStorage.setItem("basket", JSON.stringify(baskets));
    ShowBaskets(products);
}

basketTableBody.addEventListener('change', function (event) {
    if (event.target.matches('input[type="number"]')) {
        const productId = event.target.closest('tr').id;
        const productPrice = Number(event.target.closest('tr').querySelector('td:nth-child(3)').textContent.replace('$', ''));
        UpdateProductTotal(event.target, productPrice, productId);
    }
});

function ShowBaskets(products) {
    basketTableBody.innerHTML = "";
    baskets.forEach(basket => {
        let product = products.find((p) => p.id == basket.id);

        if (product) {
            basketTableBody.innerHTML += `
            <tr id="${product.id}"> 
                <td><img src="${product.image}" alt=""></td>
                <td class="input"><input type="number" value="${basket.count}" min="1" max="10" style="width: 50px;"></td>
                <td>$${product.price.toFixed(2)}</td>
                <td class="product-total">$${(product.price * basket.count).toFixed(2)}</td>
                <td><button class="delete-btn" data-id="${product.id}">X</button></td>
            </tr>`;
        }
    });
    UpdateTotalPrice();

    const deleteButtons = basketTableBody.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function () {
            const productId = this.getAttribute("data-id");
            DeleteBasketRow(productId);
        });
    });

    const addBasketButtons = document.querySelectorAll('.add-basket');
    addBasketButtons.forEach(button => {
        const productId = button.dataset.id;
        const isInBasket = baskets.some(basket => basket.id === productId);
        if (isInBasket) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    });
}

function DeleteBasketRow(productId) {
    baskets = baskets.filter(basket => basket.id !== productId);
    console.log(productId);
    localStorage.setItem("basket", JSON.stringify(baskets));
    ShowBaskets();
    document.querySelectorAll('.add-basket').forEach(button => {
        if (button.dataset.id === productId) {
            button.classList.remove("active");
        }
    });
}

function UpdateProductTotal(input, productPrice, productId) {
    const quantity = Number(input.value);
    const productTotal = quantity * productPrice;
    const row = input.closest('tr');
    row.querySelector('.product-total').textContent = `$${productTotal.toFixed(2)}`;

    const basketItem = baskets.find(basket => basket.id === productId);
    if (basketItem) {
        basketItem.count = quantity;
        localStorage.setItem("basket", JSON.stringify(baskets));
    }
    UpdateTotalPrice();
}

function UpdateTotalPrice() {
    const total = Array.from(basketTableBody.querySelectorAll('.product-total'))
        .reduce((acc, curr) => acc + Number(curr.textContent.replace('$', '')), 0);
    productsTotals.textContent = `$${total.toFixed(2)}`;
}
