const button = document.querySelector("#ping");
const output = document.querySelector("#output");

button?.addEventListener("click", () => {
  output.textContent = "JS cargado correctamente. Puedes empezar a crear mÃ³dulos.";
});

const searchForm = document.querySelector(".ml-navbar__search");
const searchInput = document.querySelector(".ml-navbar__search-input");
const locationButton = document.querySelector(".ml-navbar__location");
const cartButton = document.querySelector(".ml-navbar__cart");
const menuToggle = document.querySelector(".ml-navbar__menu-toggle");
const menu = document.querySelector(".ml-navbar__menu");

searchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = searchInput?.value.trim();

  if (!query) {
    return;
  }

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

  if (menuToggle) {
    menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }
});
