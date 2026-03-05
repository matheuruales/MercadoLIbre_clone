/* ═══════════════════════════════════
   NAVBAR — feature/luis/navbar
═══════════════════════════════════ */
const searchForm    = document.querySelector(".ml-navbar__search");
const searchInput   = document.querySelector(".ml-navbar__search-input");
const locationButton = document.querySelector(".ml-navbar__location");
const cartButton    = document.querySelector(".ml-navbar__cart");
const menuToggle    = document.querySelector(".ml-navbar__menu-toggle");
const menu          = document.querySelector(".ml-navbar__menu");
const MIN_CHARS_FOR_SUGGESTIONS = 2;
const MAX_SUGGESTIONS = 8;

let allProducts = [];
let suggestionItems = [];
let activeSuggestionIndex = -1;
let suggestionDebounceId = null;

const suggestionsList = document.createElement("ul");
suggestionsList.className = "ml-navbar__search-suggestions";
suggestionsList.hidden = true;
searchForm?.appendChild(suggestionsList);

function normalizeForSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getOrCreateCountElement() {
  let countEl = document.querySelector(".products-count");
  if (!countEl && grid) {
    countEl = document.createElement("p");
    countEl.className = "products-count";
    grid.before(countEl);
  }
  return countEl;
}

function renderProducts(products) {
  if (!grid) return;
  grid.innerHTML = "";

  const countEl = getOrCreateCountElement();
  if (countEl) {
    countEl.textContent = `${products.length} productos encontrados`;
  }

  if (!products.length) return;

  const fragment = document.createDocumentFragment();
  products.forEach((product, index) => {
    fragment.appendChild(createCard(product, index));
  });
  grid.appendChild(fragment);
}

function applySearch(query) {
  const normalizedQuery = normalizeForSearch(query);
  if (!normalizedQuery) {
    renderProducts(allProducts);
    return;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  const scoredProducts = allProducts
    .map((product) => {
      const title = normalizeForSearch(product.title);
      const brand = normalizeForSearch(product.brand);
      const category = normalizeForSearch(product.category);
      const description = normalizeForSearch(product.description);
      const searchable = `${title} ${brand} ${category} ${description}`;

      const allTermsMatch = terms.every((term) => searchable.includes(term));
      if (!allTermsMatch) return null;

      let score = 0;
      if (title === normalizedQuery) score += 1000;
      if (title.startsWith(normalizedQuery)) score += 500;
      if (title.includes(normalizedQuery)) score += 200;
      if (brand.includes(normalizedQuery)) score += 120;
      if (category.includes(normalizedQuery)) score += 80;

      terms.forEach((term) => {
        if (title.includes(term)) score += 30;
        if (brand.includes(term)) score += 20;
        if (category.includes(term)) score += 10;
        if (description.includes(term)) score += 5;
      });

      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);

  renderProducts(scoredProducts);
}

function closeSuggestions() {
  activeSuggestionIndex = -1;
  suggestionsList.hidden = true;
}

function openSuggestions() {
  suggestionsList.hidden = false;
}

function performSearch(query) {
  const targetUrl = new URL(window.location.href);
  if (query) {
    targetUrl.searchParams.set("search", query);
  } else {
    targetUrl.searchParams.delete("search");
  }
  window.history.replaceState({}, "", targetUrl);
  applySearch(query);
}

function getSuggestions(query) {
  const normalizedQuery = normalizeForSearch(query);
  if (normalizedQuery.length < MIN_CHARS_FOR_SUGGESTIONS) return [];

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (!terms.length) return [];

  const candidates = allProducts
    .map((product) => {
      const title = normalizeForSearch(product.title);
      const brand = normalizeForSearch(product.brand);
      const category = normalizeForSearch(product.category);
      const searchable = `${title} ${brand} ${category}`;
      const allTermsMatch = terms.every((term) => searchable.includes(term));

      if (!allTermsMatch) return null;

      let score = 0;
      if (title === normalizedQuery) score += 200;
      if (title.startsWith(normalizedQuery)) score += 120;
      if (title.includes(normalizedQuery)) score += 80;
      if (brand.includes(normalizedQuery)) score += 35;
      if (category.includes(normalizedQuery)) score += 25;

      return {
        type: "Producto",
        value: product.title,
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS);

  const seen = new Set();
  return candidates.filter((item) => {
    const key = normalizeForSearch(item.value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function renderSuggestions() {
  suggestionsList.innerHTML = "";
  if (!suggestionItems.length) {
    closeSuggestions();
    return;
  }

  suggestionsList.innerHTML = suggestionItems
    .map((item, index) => {
      const activeClass = index === activeSuggestionIndex ? " is-active" : "";
      return `
        <li>
          <button type="button" class="ml-navbar__suggestion-item${activeClass}" data-index="${index}">
            <span class="ml-navbar__suggestion-label">${escapeHtml(item.value)}</span>
            <span class="ml-navbar__suggestion-type">${item.type}</span>
          </button>
        </li>
      `;
    })
    .join("");

  openSuggestions();
}

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput?.value.trim() ?? "";
  const activeSuggestion = suggestionItems[activeSuggestionIndex];
  const finalQuery = activeSuggestion?.value ?? query;
  if (searchInput) searchInput.value = finalQuery;
  performSearch(finalQuery);
  closeSuggestions();
});

searchInput?.addEventListener("input", () => {
  window.clearTimeout(suggestionDebounceId);
  suggestionDebounceId = window.setTimeout(() => {
    suggestionItems = getSuggestions(searchInput.value);
    activeSuggestionIndex = suggestionItems.length ? 0 : -1;
    renderSuggestions();
  }, 200);
});

searchInput?.addEventListener("focus", () => {
  suggestionItems = getSuggestions(searchInput.value);
  activeSuggestionIndex = suggestionItems.length ? 0 : -1;
  renderSuggestions();
});

searchInput?.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSuggestions();
    return;
  }

  if (suggestionsList.hidden || !suggestionItems.length) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex + 1) % suggestionItems.length;
    renderSuggestions();
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    activeSuggestionIndex = (activeSuggestionIndex - 1 + suggestionItems.length) % suggestionItems.length;
    renderSuggestions();
  }
});

suggestionsList.addEventListener("click", (event) => {
  const option = event.target.closest("[data-index]");
  if (!option) return;

  const index = Number(option.dataset.index);
  const selected = suggestionItems[index];
  if (!selected) return;

  if (searchInput) searchInput.value = selected.value;
  performSearch(selected.value);
  closeSuggestions();
});

document.addEventListener("pointerdown", (event) => {
  if (!searchForm?.contains(event.target)) {
    closeSuggestions();
  }
});

locationButton?.addEventListener("click", () => {
  console.log("Selector de ubicación clicado");
});

cartButton?.addEventListener("click", () => {
  console.log("Carrito clicado");
});

menuToggle?.addEventListener("click", () => {
  const isOpen = menu?.classList.toggle("ml-navbar__menu--open") ?? false;
  menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
});

/* ═══════════════════════════════════
   PRODUCTS — feature/matheu/ui-styles
═══════════════════════════════════ */
const API_URL    = "https://dummyjson.com/products?limit=194&skip=0";
const USD_TO_COP = 4200;

const grid     = document.getElementById("product-grid");
const errorMsg = document.getElementById("error-msg");
const retryBtn = document.getElementById("retry-btn");

function formatCOP(usd) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(usd * USD_TO_COP));
}

function getInstallments(usdPrice) {
  const cop = usdPrice * USD_TO_COP;
  if (cop < 80000) return null;
  const opts = [3, 6, 9, 12];
  const n = opts[Math.floor(Math.random() * opts.length)];
  return { n, cuotaUSD: usdPrice / n };
}

function renderStars(rate) {
  const r    = Math.min(5, Math.max(0, rate));
  const full = Math.floor(r);
  const half = r - full >= 0.4 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
}

function getShipping(index) {
  const opts = [
    { text: "Envío gratis",                free: true  },
    { text: "Llega gratis mañana",         free: true  },
    { text: "Llega gratis el sábado",      free: true  },
    { text: "Envío gratis a todo el país", free: true  },
    { text: "Envío a domicilio",           free: false },
  ];
  return opts[index % opts.length];
}

function seededRand(seed) {
  return ((seed * 1664525 + 1013904223) & 0x7fffffff) / 0x7fffffff;
}

function createCard(product, index) {
  const discount    = Math.round(product.discountPercentage);
  const originalUSD = product.price / (1 - product.discountPercentage / 100);
  const installments = getInstallments(product.price);
  const shipping    = getShipping(index);
  const reviewCount = Math.floor(seededRand(product.id * 7) * 800) + 50;

  const article = document.createElement("article");
  article.className = "product-card";

  article.innerHTML = `
    <a href="#" class="product-card__link">
      <figure class="product-card__media">
        <img
          src="${product.thumbnail}"
          alt="${product.title}"
          loading="lazy"
          onerror="this.src='https://dummyimage.com/200x200/f5f5f5/aaa&text=Sin+imagen'"
        />
      </figure>
      <div class="product-card__body">
        <p class="product-card__category">${product.category}</p>
        <h2 class="product-card__title">${product.title}</h2>
        <div class="product-card__rating">
          <span class="product-card__stars">${renderStars(product.rating)}</span>
          <span class="product-card__rating-count">(${reviewCount})</span>
        </div>
        <div class="product-card__pricing">
          <p class="product-card__original-price">${formatCOP(originalUSD)}</p>
          <div class="product-card__price-row">
            <p class="product-card__price">${formatCOP(product.price)}</p>
            <span class="product-card__discount">${discount}% OFF</span>
          </div>
          ${installments
            ? `<p class="product-card__installments">en ${installments.n} cuotas de ${formatCOP(installments.cuotaUSD)}</p>`
            : ""}
        </div>
        <p class="product-card__shipping${shipping.free ? " product-card__shipping--free" : ""}">${shipping.text}</p>
        ${product.brand ? `<p class="product-card__brand">${product.brand}</p>` : ""}
      </div>
    </a>
  `;

  return article;
}

function showSkeletons(count = 10) {
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card";
    grid.appendChild(sk);
  }
}

async function loadProducts() {
  errorMsg.hidden = true;
  showSkeletons(20);

  try {
    const res  = await fetch(API_URL);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();

    allProducts = Array.isArray(data.products) ? data.products : [];

    const queryFromUrl = new URL(window.location.href).searchParams.get("search") ?? "";
    if (searchInput) {
      searchInput.value = queryFromUrl;
    }
    performSearch(queryFromUrl);
  } catch (err) {
    console.error("Error:", err);
    grid.innerHTML = "";
    errorMsg.hidden = false;
  }
}

retryBtn?.addEventListener("click", loadProducts);
loadProducts();

// View switching for home and developer portfolios
const viewHome = document.querySelector("#view-home");
const viewDev1 = document.querySelector("#view-dev1");
const viewDev2 = document.querySelector("#view-dev2");
const viewDev3 = document.querySelector("#view-dev3");

const views = {
  home: viewHome,
  dev1: viewDev1,
  dev2: viewDev2,
  dev3: viewDev3,
};

const showView = (viewName) => {
  Object.entries(views).forEach(([name, element]) => {
    if (!element) return;
    const isActive = name === viewName;
    element.hidden = !isActive;
    element.classList.toggle("view--active", isActive);
  });
};

showView("home");

// CV Devs dropdown behavior
const devsMenuItem = document.querySelector(".ml-navbar__menu-item--dropdown");
const devsToggle = devsMenuItem?.querySelector(
  ".ml-navbar__menu-link--cv-devs"
);
const devsOptions = devsMenuItem?.querySelectorAll(".ml-navbar__dropdown-item");

let devsDropdownOpen = false;

const setDevsDropdownState = (isOpen) => {
  devsDropdownOpen = isOpen;

  if (!devsMenuItem || !devsToggle) return;

  devsMenuItem.classList.toggle(
    "ml-navbar__menu-item--dropdown-open",
    isOpen
  );
  devsToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
};

const openDevsDropdown = () => setDevsDropdownState(true);
const closeDevsDropdown = () => setDevsDropdownState(false);

devsToggle?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (devsDropdownOpen) {
    closeDevsDropdown();
  } else {
    openDevsDropdown();
  }
});

devsToggle?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();

    if (!devsDropdownOpen) {
      openDevsDropdown();
    }

    const firstOption = devsOptions?.[0];
    if (firstOption instanceof HTMLElement) {
      firstOption.focus();
    }
  }
});

devsOptions?.forEach((option) => {
  option.addEventListener("click", (event) => {
    event.stopPropagation();

    const devKey = option.getAttribute("data-dev");
    if (devKey && devKey in views) {
      showView(devKey);
    }

    closeDevsDropdown();
  });

  option.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeDevsDropdown();
      devsToggle?.focus();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!devsDropdownOpen || !devsMenuItem) {
    return;
  }

  if (event.target instanceof Node && !devsMenuItem.contains(event.target)) {
    closeDevsDropdown();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && devsDropdownOpen) {
    closeDevsDropdown();
    devsToggle?.focus();
  }
});

// Reset to home view when clicking regular nav links without real href
const navLinks = document.querySelectorAll(".ml-navbar__menu-link");

navLinks.forEach((link) => {
  if (
    link.classList.contains("ml-navbar__menu-link--cv-devs") ||
    link.tagName !== "A"
  ) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href || href === "#") {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showView("home");
      closeDevsDropdown();
    });
  }
});
