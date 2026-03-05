const button = document.querySelector("#ping");
const output = document.querySelector("#output");

button?.addEventListener("click", () => {
  output.textContent = "JS cargado correctamente. Puedes empezar a crear módulos.";
});
