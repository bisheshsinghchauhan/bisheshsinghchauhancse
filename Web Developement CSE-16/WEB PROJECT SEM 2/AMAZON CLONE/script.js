const products = [
  {
    id: 1,
    name: "Smartphone",
    category: "electronics",
    price: 14999,
    rating: "★★★★☆",
    image: "📱",
    desc: "Latest smartphone with powerful battery and camera"
  },
  {
    id: 2,
    name: "Laptop",
    category: "electronics",
    price: 55999,
    rating: "★★★★★",
    image: "💻",
    desc: "High performance laptop for work and study"
  },
  {
    id: 3,
    name: "Headphones",
    category: "electronics",
    price: 1999,
    rating: "★★★★☆",
    image: "🎧",
    desc: "Wireless headphones with noise cancellation"
  },
  {
    id: 4,
    name: "Smart Watch",
    category: "electronics",
    price: 2999,
    rating: "★★★★☆",
    image: "⌚",
    desc: "Fitness tracking and calling smartwatch"
  },
  {
    id: 5,
    name: "Men's Jacket",
    category: "fashion",
    price: 2499,
    rating: "★★★★☆",
    image: "🧥",
    desc: "Stylish winter jacket for men"
  },
  {
    id: 6,
    name: "Running Shoes",
    category: "fashion",
    price: 3499,
    rating: "★★★★★",
    image: "👟",
    desc: "Comfortable running shoes for daily use"
  },
  {
    id: 7,
    name: "Coffee Maker",
    category: "home",
    price: 4299,
    rating: "★★★★☆",
    image: "☕",
    desc: "Automatic coffee maker for home and office"
  },
  {
    id: 8,
    name: "Table Lamp",
    category: "home",
    price: 899,
    rating: "★★★☆☆",
    image: "💡",
    desc: "Modern LED table lamp with adjustable brightness"
  }
];

let cart = [];

const productContainer = document.getElementById("productContainer");
const cartCount = document.getElementById("cartCount");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartSidebar = document.getElementById("cartSidebar");

function displayProducts(productList) {
  productContainer.innerHTML = "";

  if (productList.length === 0) {
    productContainer.innerHTML = "<h3>No products found</h3>";
    return;
  }

  productList.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";

    productCard.innerHTML = `
      <div class="product-img">${product.image}</div>
      <h3>${product.name}</h3>
      <p>${product.desc}</p>
      <div class="rating">${product.rating}</div>
      <div class="price">₹${product.price}</div>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;

    productContainer.appendChild(productCard);
  });
}

function addToCart(id) {
  const product = products.find(item => item.id === id);
  const existingProduct = cart.find(item => item.id === id);

  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  updateCart();
}

function updateCart() {
  cartCount.innerText = cart.reduce((total, item) => total + item.quantity, 0);

  cartItems.innerHTML = "";

  let total = 0;
  
  cart.forEach(item => {
    total += item.price * item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    cartItem.innerHTML = `
      <h4>${item.image} ${item.name}</h4>
      <p>Price: ₹${item.price}</p>
      <p>Quantity: ${item.quantity}</p>
      <button onclick="removeFromCart(${item.id})">Remove</button>
    `;

    cartItems.appendChild(cartItem);
  });

  cartTotal.innerText = total;
}

function removeFromCart(id) {
  const item = cart.find(product => product.id === id);

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter(product => product.id !== id);
  }

  updateCart();
}

function toggleCart() {
  cartSidebar.classList.toggle("active");
}

function checkout() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  alert("Order placed successfully!");
  cart = [];
  updateCart();
  toggleCart();
}

function searchProducts() {
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const selectedCategory = document.getElementById("categorySelect").value;

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchText);
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  displayProducts(filteredProducts);
}

document.getElementById("searchInput").addEventListener("input", searchProducts);
document.getElementById("categorySelect").addEventListener("change", searchProducts);

displayProducts(products);