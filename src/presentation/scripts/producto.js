// ═══════════════════════════════════
// PÁGINA DE PRODUCTO - CARGA DINÁMICA
// ═══════════════════════════════════

const API_URL = 'https://dummyjson.com/products';

// ═══════════════════════════════════
// FUNCIONES AUXILIARES
// ═══════════════════════════════════

function formatCOP(usd) {
  const cop = Math.round(usd * 4100);
  return '$ ' + cop.toLocaleString('es-CO');
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}

function seededRand(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getInstallments(priceUSD) {
  if (priceUSD < 60) return null;
  if (priceUSD < 150) return { n: 3, cuotaUSD: priceUSD / 3 };
  if (priceUSD < 300) return { n: 6, cuotaUSD: priceUSD / 6 };
  return { n: 9, cuotaUSD: priceUSD / 9 };
}

function getShipping(id) {
  const free = seededRand(id * 11) > 0.3;
  return {
    free,
    text: free ? 'Envío gratis' : 'Envío disponible'
  };
}

// ═══════════════════════════════════
// OBTENER ID DE LA URL
// ═══════════════════════════════════

function getProductIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

// ═══════════════════════════════════
// CARGAR PRODUCTO DESDE LA API
// ═══════════════════════════════════

async function loadProduct() {
  const productId = getProductIdFromURL();
  
  if (!productId) {
    console.error('No se encontró ID de producto en la URL');
    window.location.href = 'index.html';
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${productId}`);
    if (!response.ok) throw new Error('Producto no encontrado');
    
    const product = await response.json();
    renderProduct(product);
  } catch (error) {
    console.error('Error al cargar el producto:', error);
    alert('Error al cargar el producto. Serás redirigido al inicio.');
    window.location.href = 'index.html';
  }
}

// ═══════════════════════════════════
// RENDERIZAR PRODUCTO
// ═══════════════════════════════════

function renderProduct(product) {
  const discount = Math.round(product.discountPercentage);
  const originalUSD = product.price / (1 - product.discountPercentage / 100);
  const installments = getInstallments(product.price);
  const shipping = getShipping(product.id);
  const reviewCount = Math.floor(seededRand(product.id * 7) * 800) + 50;
  const soldCount = Math.floor(seededRand(product.id * 13) * 900) + 100;

  // TITLE
  document.title = `${product.title} | Mercado Libre`;
  const title = document.querySelector('.ml-product-title');
  if (title) title.textContent = product.title;

  // GALLERY
  const images = product.images?.length ? product.images : [product.thumbnail];
  const mainImage = document.querySelector('.ml-gallery__main img');
  const thumbsContainer = document.querySelector('.ml-gallery__thumbs');
  
  if (mainImage) {
    mainImage.src = images[0];
    mainImage.alt = product.title;
  }

  if (thumbsContainer) {
    thumbsContainer.innerHTML = '';
    images.slice(0, 7).forEach((src, i) => {
      const btn = document.createElement('button');
      btn.className = `ml-gallery__thumbnail ${i === 0 ? 'ml-gallery__thumbnail--active' : ''}`;
      btn.setAttribute('aria-label', `Imagen ${i + 1}`);
      
      const img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.onerror = () => { img.src = 'https://dummyimage.com/80x80/f5f5f5/aaa&text=+'; };
      
      btn.appendChild(img);
      btn.addEventListener('click', () => {
        mainImage.src = src;
        document.querySelectorAll('.ml-gallery__thumbnail').forEach(t => 
          t.classList.remove('ml-gallery__thumbnail--active')
        );
        btn.classList.add('ml-gallery__thumbnail--active');
      });
      
      thumbsContainer.appendChild(btn);
    });

    if (images.length > 7) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'ml-gallery__thumbnail';
      moreBtn.setAttribute('aria-label', 'Ver más');
      const moreSpan = document.createElement('span');
      moreSpan.className = 'ml-gallery__more';
      moreSpan.textContent = `+${images.length - 7}`;
      moreBtn.appendChild(moreSpan);
      thumbsContainer.appendChild(moreBtn);
    }
  }

  // SALES / NEW
  const salesEl = document.querySelector('.ml-rating__sales');
  if (salesEl) salesEl.textContent = `+${soldCount} vendidos`;

  // CATEGORY BADGE
  const badgeRank = document.querySelector('.ml-badge-rank');
  if (badgeRank) badgeRank.textContent = `${product.category}`;

  // RATING STARS
  const starsValue = document.querySelector('.ml-stars');
  const starsIcon = document.querySelector('.ml-stars-icon');
  const reviewsCount = document.querySelector('.ml-reviews-count');
  
  if (starsValue) starsValue.textContent = product.rating.toFixed(1);
  if (starsIcon) starsIcon.textContent = renderStars(product.rating);
  if (reviewsCount) reviewsCount.textContent = `(${reviewCount})`;

  // PRICE
  const priceEl = document.querySelector('.ml-price');
  if (priceEl) priceEl.textContent = formatCOP(product.price);

  const installmentsEl = document.querySelector('.ml-installments');
  if (installmentsEl && installments) {
    installmentsEl.textContent = `${installments.n} cuotas de ${formatCOP(installments.cuotaUSD)} con 0% interés`;
  }

  // SHIPPING
  const shippingTitle = document.querySelector('.ml-shipping__title');
  if (shippingTitle && shipping.free) {
    shippingTitle.innerHTML = '<span class="ml-shipping__free">Llega gratis</span> el sábado';
  } else if (shippingTitle) {
    shippingTitle.textContent = 'Envío disponible';
  }

  // STOCK
  const stockAvailable = document.querySelector('.ml-stock__available');
  const stockQuantity = document.querySelector('#quantity');
  
  const maxStock = Math.min(product.stock || 5, 10);
  
  if (stockAvailable) {
    stockAvailable.textContent = `(${maxStock} disponibles)`;
  }

  if (stockQuantity) {
    stockQuantity.innerHTML = '';
    for (let i = 1; i <= maxStock; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = `${i} unidad${i > 1 ? 'es' : ''}`;
      if (i === 1) option.selected = true;
      stockQuantity.appendChild(option);
    }
  }

  // BRAND (if needed)
  const brandEl = document.querySelector('.ml-product-brand');
  if (brandEl && product.brand) {
    brandEl.textContent = product.brand;
  }
}

// ═══════════════════════════════════
// FUNCIONALIDADES INTERACTIVAS
// ═══════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {
  // Cargar producto
  loadProduct();

  // BOTÓN VOLVER
  const backBtn = document.querySelector('.ml-breadcrumb__back');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'index.html';
    });
  }

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
