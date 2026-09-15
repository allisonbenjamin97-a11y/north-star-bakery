const bakeryProducts = [
  { id: "sourdough", name: "Signature Sourdough", price: 8, description: "Slow-fermented loaf with a star-shaped score." },
  { id: "croissant", name: "Butter Croissant", price: 4, description: "Flaky morning pastry made in small batches." },
  { id: "cinnamon-roll", name: "Cinnamon Roll", price: 5, description: "Soft roll finished with vanilla glaze." },
  { id: "honey-oat", name: "Honey Oat Loaf", price: 9, description: "Whole oats with a light touch of local honey." }
];

const storageKeys = {
  favorites: "northStarFavorites",
  customerName: "northStarCustomerName"
};

const validationRules = {
  minimumNameLength: 2,
  minimumDetailsLength: 10,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

function loadFavorites() {
  try {
    const savedFavorites = JSON.parse(localStorage.getItem(storageKeys.favorites) || "[]");
    return Array.isArray(savedFavorites) ? savedFavorites : [];
  } catch (error) {
    return [];
  }
}

function saveFavorites(favorites) {
  localStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
}

function renderProducts() {
  const container = document.getElementById("product-list");
  if (!container) return;
  const favorites = loadFavorites();
  container.innerHTML = bakeryProducts.map((product) => `
    <article class="product-card">
      <h3>${product.name}</h3><p>${product.description}</p><p class="price">$${product.price}</p>
      <button type="button" class="favorite-button" data-product-id="${product.id}" aria-pressed="${favorites.includes(product.id)}">
        ${favorites.includes(product.id) ? "Remove Favorite" : "Save Favorite"}
      </button>
    </article>`).join("");
  container.querySelectorAll(".favorite-button").forEach((button) => button.addEventListener("click", toggleFavorite));
  updateFavoriteSummary();
}

function toggleFavorite(event) {
  const id = event.currentTarget.dataset.productId;
  const favorites = loadFavorites();
  const updatedFavorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
  saveFavorites(updatedFavorites);
  renderProducts();
}

function updateFavoriteSummary() {
  const summary = document.getElementById("favorite-summary");
  if (!summary) return;
  const selected = bakeryProducts.filter((product) => loadFavorites().includes(product.id));
  summary.textContent = selected.length ? `Saved: ${selected.map((product) => product.name).join(", ")}` : "You have not saved any favorites yet.";
  const storageStatus = document.getElementById("storage-status");
  if (storageStatus) {
    storageStatus.textContent = selected.length
      ? `${selected.length} favorite${selected.length === 1 ? "" : "s"} saved on this device and ready to restore after refresh.`
      : "Favorites you select will be saved on this device.";
  }
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(`${fieldId.replace("full-name", "name").replace("item-details", "details")}-error`);
  if (error) error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
}

function validateForm() {
  const name = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const requestType = document.getElementById("request-type").value;
  const details = document.getElementById("item-details").value.trim();
  const errors = {
    name: name.length < validationRules.minimumNameLength ? "Please enter your full name using at least two characters." : "",
    email: !validationRules.emailPattern.test(email) ? "Please enter a valid email address, such as name@example.com." : "",
    request: !requestType ? "Please choose a request type." : "",
    details: details.length < validationRules.minimumDetailsLength ? "Please provide at least 10 characters about your order or question." : ""
  };
  showError("full-name", errors.name); showError("email", errors.email);
  document.getElementById("request-error").textContent = errors.request;
  document.getElementById("request-type").setAttribute("aria-invalid", errors.request ? "true" : "false");
  showError("item-details", errors.details);
  return !Object.values(errors).some(Boolean);
}

function prepareForm() {
  const form = document.getElementById("preorder-form");
  if (!form) return;
  const nameField = document.getElementById("full-name");
  const savedName = localStorage.getItem(storageKeys.customerName) || "";
  nameField.value = savedName;
  const rememberedName = document.getElementById("remembered-name");
  if (savedName && rememberedName) {
    rememberedName.textContent = `Welcome back, ${savedName}. Your name was restored from this device.`;
    rememberedName.hidden = false;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    document.getElementById("form-status").hidden = true;
    if (!validateForm()) return;
    localStorage.setItem(storageKeys.customerName, nameField.value.trim());
    const status = document.getElementById("form-status");
    status.textContent = "Your request is ready for bakery confirmation. Your name has been saved for next time.";
    status.hidden = false;
  });
}

document.addEventListener("DOMContentLoaded", () => { renderProducts(); prepareForm(); });
