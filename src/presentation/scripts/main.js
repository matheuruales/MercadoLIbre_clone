/* ═══════════════════════════════════
   HERO SLIDER
═══════════════════════════════════ */
(function () {
  const track  = document.getElementById("sliderTrack");
  const dotsEl = document.getElementById("sliderDots");
  const prev   = document.getElementById("sliderPrev");
  const next   = document.getElementById("sliderNext");
  if (!track) return;

  const slides = track.querySelectorAll("img");
  const total  = slides.length;
  let current  = 0;
  let timer;

  slides.forEach((_, i) => {
    const btn = document.createElement("button");
    btn.className = "dot" + (i === 0 ? " active" : "");
    btn.setAttribute("aria-label", "Ir a slide " + (i + 1));
    btn.addEventListener("click", () => goTo(i));
    dotsEl.appendChild(btn);
  });

  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dotsEl.querySelectorAll(".dot").forEach((d, i) =>
      d.classList.toggle("active", i === current)
    );
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), 5000);
  }

  prev?.addEventListener("click", () => goTo(current - 1));
  next?.addEventListener("click", () => goTo(current + 1));

  // Pausa al pasar el mouse
  track.parentElement.addEventListener("mouseenter", () => clearInterval(timer));
  track.parentElement.addEventListener("mouseleave", resetTimer);

  resetTimer();
})();

/* ═══════════════════════════════════
   NAVBAR — feature/luis/navbar
═══════════════════════════════════ */
const searchForm    = document.querySelector(".ml-navbar__search");
const searchInput   = document.querySelector(".ml-navbar__search-input");
const locationButton = document.querySelector(".ml-navbar__location");
const cartButton    = document.querySelector(".ml-navbar__cart");
const menuToggle    = document.querySelector(".ml-navbar__menu-toggle");
const menu          = document.querySelector(".ml-navbar__menu");

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput?.value.trim();
  if (!query) return;
  console.log("Buscar productos:", query);
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

    grid.innerHTML = "";

    const countEl = document.createElement("p");
    countEl.className = "products-count";
    countEl.textContent = `${data.products.length} productos encontrados`;
    grid.before(countEl);

    const fragment = document.createDocumentFragment();
    data.products.forEach((p, i) => fragment.appendChild(createCard(p, i)));
    grid.appendChild(fragment);
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
