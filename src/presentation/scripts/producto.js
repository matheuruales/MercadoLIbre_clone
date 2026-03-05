// PÁGINA DE PRODUCTO - FUNCIONALIDADES

document.addEventListener('DOMContentLoaded', function() {
  // GALLERY FUNCTIONALITY
  const thumbnails = document.querySelectorAll('.ml-gallery__thumbnail');
  const mainImage = document.querySelector('.ml-gallery__main img');

  thumbnails.forEach((thumbnail, index) => {
    if (index < 7) { // Solo las primeras 7 imágenes
      thumbnail.addEventListener('click', function() {
        // Remover clase activa de todos
        thumbnails.forEach(t => t.classList.remove('ml-gallery__thumbnail--active'));
        
        // Agregar clase activa al clickeado
        this.classList.add('ml-gallery__thumbnail--active');
        
        // Cambiar imagen principal
        const thumbnailImg = this.querySelector('img');
        if (thumbnailImg) {
          mainImage.src = thumbnailImg.src;
          mainImage.alt = thumbnailImg.alt;
        }
      });
    }
  });

  // ADD TO CART BUTTON
  const addToCartBtn = document.querySelector('.ml-btn--secondary');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', function() {
      const quantity = document.querySelector('#quantity').value;
      alert(`Se agregaron ${quantity} unidad(es) al carrito`);
    });
  }

  // BUY NOW BUTTON
  const buyNowBtn = document.querySelector('.ml-btn--primary');
  if (buyNowBtn) {
    buyNowBtn.addEventListener('click', function() {
      alert('Redirigiendo a checkout...');
    });
  }

  // QUANTITY SELECTOR
  const quantitySelect = document.querySelector('#quantity');
  if (quantitySelect) {
    quantitySelect.addEventListener('change', function() {
      console.log(`Cantidad seleccionada: ${this.value}`);
    });
  }
});
