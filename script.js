/* NovaShop — Catálogo de demostración. Edita esta lista para cambiar los productos. */
const products = [
  { id: 1, name: 'Audífonos Pro', category: 'Tecnología', price: 149900, oldPrice: 189900, image: 'assets/headphones.svg', description: 'Un diseño moderno para acompañarte con tu música favorita, dondequiera que vayas.' },
  { id: 2, name: 'Smartwatch Active', category: 'Tecnología', price: 229900, oldPrice: 289900, image: 'assets/watch.svg', description: 'Un accesorio actual para complementar tu rutina y llevar el estilo en tu muñeca.' },
  { id: 3, name: 'Lámpara Minimal', category: 'Hogar', price: 89900, oldPrice: null, image: 'assets/lamp.svg', description: 'Líneas suaves y un estilo sencillo que combinan con tus espacios favoritos.' },
  { id: 4, name: 'Mochila Urban', category: 'Accesorios', price: 119900, oldPrice: 149900, image: 'assets/backpack.svg', description: 'Una mochila de estilo urbano para llevar lo esencial con comodidad.' },
  { id: 5, name: 'Tenis Street', category: 'Moda', price: 199900, oldPrice: 249900, image: 'assets/sneakers.svg', description: 'Un toque casual para tus combinaciones de todos los días.' },
  { id: 6, name: 'Cámara Compacta', category: 'Tecnología', price: 329900, oldPrice: 399900, image: 'assets/camera.svg', description: 'Inspirada en los momentos que vale la pena recordar y compartir.' },
  { id: 7, name: 'Sudadera Essential', category: 'Moda', price: 129900, oldPrice: null, image: 'assets/hoodie.svg', description: 'Un básico versátil con una silueta cómoda y un estilo relajado.' },
  { id: 8, name: 'Taza Premium', category: 'Hogar', price: 49900, oldPrice: 59900, image: 'assets/mug.svg', description: 'Un detalle especial para disfrutar tus momentos de café o té.' }
];

const FREE_SHIPPING_THRESHOLD = 150000;
const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const getProduct = id => products.find(product => product.id === id);
const discountOf = product => product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
const normalize = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

function readStorage(key, fallback) {
  try {
    const result = JSON.parse(localStorage.getItem(key));
    return Array.isArray(result) ? result : fallback;
  } catch { return fallback; }
}
function writeStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* La navegación privada puede bloquear el almacenamiento. */ }
}

let cart = readStorage('novashop-cart', [])
  .filter(item => item && getProduct(Number(item.id)) && Number.isInteger(item.qty) && item.qty > 0)
  .map(item => ({ id: Number(item.id), qty: Math.min(item.qty, 99) }));
let favorites = [...new Set(readStorage('novashop-favorites', []).map(Number))].filter(id => getProduct(id));
let activeCategory = 'Todos';
let onlyFavorites = false;
let onlyOffers = false;
let query = '';
let sort = 'default';
let toastTimer;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function announce(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

function visibleProducts() {
  let list = products.filter(product =>
    (activeCategory === 'Todos' || product.category === activeCategory) &&
    (!query || normalize(`${product.name} ${product.category}`).includes(normalize(query))) &&
    (!onlyFavorites || favorites.includes(product.id)) &&
    (!onlyOffers || product.oldPrice > product.price)
  );
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  if (sort === 'discount') list.sort((a, b) => discountOf(b) - discountOf(a));
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return list;
}

function productCard(product) {
  const isFavorite = favorites.includes(product.id);
  return `<article class="product-card">
    <div class="product-picture" data-action="details" data-id="${product.id}" role="button" tabindex="0" aria-label="Ver detalles de ${product.name}">
      <img src="${product.image}" alt="Ilustración de ${product.name}" width="640" height="520">
      ${product.oldPrice ? `<span class="discount-label">−${discountOf(product)}%</span>` : ''}
      <button type="button" class="favorite-product ${isFavorite ? 'is-favorite' : ''}" data-action="favorite" data-id="${product.id}" aria-label="${isFavorite ? 'Quitar' : 'Agregar'} ${product.name} ${isFavorite ? 'de' : 'a'} favoritos" aria-pressed="${isFavorite}">${icon('heart')}</button>
    </div>
    <div class="product-body">
      <span class="product-category">${product.category}</span>
      <h3 class="product-title"><button type="button" data-action="details" data-id="${product.id}">${product.name}</button></h3>
      <div class="product-prices"><span class="current-price">${money(product.price)}</span>${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
      <button type="button" class="add-button" data-action="add" data-id="${product.id}">${icon('plus')} Añadir al carrito</button>
    </div>
  </article>`;
}

function renderProducts() {
  const list = visibleProducts();
  $('#products').innerHTML = list.map(productCard).join('');
  $('#products').hidden = !list.length;
  $('#emptyResults').hidden = Boolean(list.length);
  const label = onlyFavorites ? ' favorito' : onlyOffers ? ' en oferta' : '';
  $('#resultsText').textContent = `${list.length} producto${list.length === 1 ? '' : 's'}${label}${onlyFavorites && list.length !== 1 ? 's' : ''} encontrado${list.length === 1 ? '' : 's'}`;
  $$('.filter').forEach(button => {
    const active = button.dataset.category === activeCategory;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  $('#favoritesToggle').classList.toggle('is-active', onlyFavorites);
  $('#favoritesToggle').setAttribute('aria-pressed', String(onlyFavorites));
  $('#favoritesToggle').setAttribute('aria-label', onlyFavorites ? 'Mostrar todos los productos' : 'Ver mis favoritos');
}

function updateCounters() {
  const quantity = cart.reduce((sum, item) => sum + item.qty, 0);
  $('#cartCount').textContent = quantity;
  $('#cartCount').hidden = quantity === 0;
  $('#favoritesCount').textContent = favorites.length;
  $('#favoritesCount').hidden = favorites.length === 0;
}

function updateCatalog() { updateCounters(); renderProducts(); }
function saveCart() { writeStorage('novashop-cart', cart); updateCounters(); renderCart(); }
function saveFavorites() { writeStorage('novashop-favorites', favorites); updateCatalog(); refreshDetailFavorite(); }

function addToCart(id) {
  const product = getProduct(id);
  if (!product) return;
  const existing = cart.find(item => item.id === id);
  if (existing && existing.qty >= 99) return announce('Límite de 99 unidades por producto.');
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  saveCart();
  announce(`${product.name} añadido al carrito`);
}
function changeQuantity(id, change) {
  const existing = cart.find(item => item.id === id);
  if (!existing) return;
  existing.qty += change;
  if (existing.qty <= 0) cart = cart.filter(item => item.id !== id);
  else existing.qty = Math.min(existing.qty, 99);
  saveCart();
}
function removeCartItem(id) { cart = cart.filter(item => item.id !== id); saveCart(); }
function toggleFavorite(id) {
  const product = getProduct(id);
  if (!product) return;
  if (favorites.includes(id)) { favorites = favorites.filter(x => x !== id); announce(`${product.name} eliminado de favoritos`); }
  else { favorites.push(id); announce(`${product.name} guardado en favoritos`); }
  saveFavorites();
}

function renderCart() {
  const sum = cart.reduce((total, item) => total + getProduct(item.id).price * item.qty, 0);
  const count = cart.reduce((total, item) => total + item.qty, 0);
  $('#cartTitleCount').textContent = `(${count})`;
  $('#subtotal').textContent = money(sum);
  $('#checkoutButton').disabled = count === 0;
  $('#downloadList').disabled = count === 0;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - sum);
  $('#shippingProgress').innerHTML = `<div class="shipping-message">${icon(sum >= FREE_SHIPPING_THRESHOLD ? 'check' : 'truck')}<span>${sum >= FREE_SHIPPING_THRESHOLD ? '<strong>¡Alcanzaste el envío gratis!</strong>' : count ? `Te faltan <strong>${money(remaining)}</strong> para el envío gratis` : `Agrega productos para obtener <strong>envío gratis desde ${money(FREE_SHIPPING_THRESHOLD)}</strong>`}</span></div><div class="progress-track"><div class="progress-fill" style="width:${Math.min(100, sum / FREE_SHIPPING_THRESHOLD * 100)}%"></div></div>`;

  if (!cart.length) {
    $('#cartItems').innerHTML = `<div class="cart-empty"><div class="cart-empty-icon">${icon('bag')}</div><h3>Tu carrito está vacío</h3><p>Explora nuestra selección y agrega tus nuevos favoritos.</p><button type="button" class="button button-dark" data-action="continue-shopping">Explorar productos</button></div>`;
    return;
  }
  $('#cartItems').innerHTML = cart.map(item => {
    const product = getProduct(item.id);
    return `<div class="cart-line"><img src="${product.image}" alt="${product.name}" width="86" height="91"><div><div class="cart-line-title">${product.name}</div><div class="cart-line-cat">${product.category}</div><div class="cart-line-price">${money(product.price * item.qty)}</div><div class="cart-line-bottom"><div class="quantity-widget"><button type="button" data-action="decrease" data-id="${item.id}" aria-label="Quitar una unidad de ${product.name}">${icon('minus')}</button><span>${item.qty}</span><button type="button" data-action="increase" data-id="${item.id}" aria-label="Agregar una unidad de ${product.name}">${icon('plus')}</button></div><button type="button" class="remove-button" data-action="remove" data-id="${item.id}" aria-label="Eliminar ${product.name}">${icon('trash')}</button></div></div></div>`;
  }).join('');
}

function refreshDetailFavorite() {
  const button = $('#detailFavorite');
  if (!button) return;
  const fav = favorites.includes(Number(button.dataset.id));
  button.classList.toggle('is-favorite', fav);
  button.setAttribute('aria-pressed', String(fav));
  button.setAttribute('aria-label', fav ? 'Quitar de favoritos' : 'Agregar a favoritos');
}
function openProduct(id) {
  const product = getProduct(id);
  if (!product) return;
  $('#productDetail').innerHTML = `<div class="detail-inner"><img src="${product.image}" alt="Ilustración de ${product.name}" width="640" height="520"><div class="detail-text"><span class="section-kicker">${product.category.toUpperCase()}</span><h2 id="detailTitle">${product.name}</h2><p class="detail-description">${product.description}</p><div class="detail-price">${money(product.price)}${product.oldPrice ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>${product.oldPrice ? `<div class="product-category" style="margin-top:8px">Ahorra ${money(product.oldPrice - product.price)}</div>` : ''}<div class="detail-actions"><button type="button" class="button button-dark" data-action="add" data-id="${id}">${icon('plus')} Añadir al carrito</button><button type="button" id="detailFavorite" class="icon-button detail-fav" data-action="favorite" data-id="${id}" aria-label="Agregar a favoritos" aria-pressed="false">${icon('heart')}</button></div></div></div>`;
  refreshDetailFavorite();
  $('#productDialog').showModal();
}
function closeDialog(id) { const dialog = document.getElementById(id); if (dialog?.open) dialog.close(); }

function setCategory(category) {
  activeCategory = category;
  onlyFavorites = false;
  onlyOffers = false;
  updateCatalog();
}
function resetFilters() {
  activeCategory = 'Todos';
  onlyFavorites = false;
  onlyOffers = false;
  query = '';
  sort = 'default';
  $('#sort').value = 'default';
  $('#search').value = '';
  $('#mobileSearch').value = '';
  updateCatalog();
}
function downloadCartList() {
  if (!cart.length) return;
  const lines = ['NOVASHOP — LISTA DE PRODUCTOS', 'Este documento no es un comprobante de compra ni un pedido confirmado.', '', ...cart.map(item => {
    const p = getProduct(item.id);
    return `${p.name} | ${item.qty} unidad(es) | ${money(p.price * item.qty)}`;
  }), '', `Subtotal: ${money(cart.reduce((sum, item) => sum + getProduct(item.id).price * item.qty, 0))}`, 'Envío e impuestos adicionales (si aplican) no incluidos.'];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'NovaShop_lista_de_productos.txt';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce('Lista del carrito descargada');
}

// Delegación para que los botones dinámicos funcionen tras filtrar.
document.addEventListener('click', event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const id = Number(control.dataset.id);
  switch (control.dataset.action) {
    case 'add': addToCart(id); break;
    case 'details': if (event.target.closest('.favorite-product')) return; openProduct(id); break;
    case 'favorite': toggleFavorite(id); break;
    case 'increase': changeQuantity(id, 1); break;
    case 'decrease': changeQuantity(id, -1); break;
    case 'remove': removeCartItem(id); break;
    case 'continue-shopping': closeDialog('cartDialog'); $('#productos').scrollIntoView({ behavior: 'smooth' }); break;
  }
});

document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.product-picture')) {
    event.preventDefault(); openProduct(Number(event.target.dataset.id));
  }
  if (event.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName) && !$$('dialog[open]').length) {
    event.preventDefault(); (matchMedia('(max-width:700px)').matches ? $('#mobileSearch') : $('#search')).focus();
  }
});

$$('[data-go-category]').forEach(button => button.addEventListener('click', () => {
  query = '';
  $('#search').value = '';
  $('#mobileSearch').value = '';
  setCategory(button.dataset.goCategory);
  $('#productos').scrollIntoView({ behavior: 'smooth' });
}));
$$('[data-category]').forEach(button => button.addEventListener('click', () => setCategory(button.dataset.category)));
$$('[data-close]').forEach(button => button.addEventListener('click', () => closeDialog(button.dataset.close)));
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => {
  if (event.target === dialog) dialog.close();
}));

function onSearchInput(event) {
  query = event.target.value.trim();
  const other = event.target.id === 'search' ? $('#mobileSearch') : $('#search');
  other.value = event.target.value;
  renderProducts();
}
$('#search').addEventListener('input', onSearchInput);
$('#mobileSearch').addEventListener('input', onSearchInput);
$('#sort').addEventListener('change', event => { sort = event.target.value; renderProducts(); });
$('#favoritesToggle').addEventListener('click', () => {
  onlyFavorites = !onlyFavorites;
  onlyOffers = false;
  activeCategory = 'Todos';
  updateCatalog();
  $('#productos').scrollIntoView({ behavior: 'smooth' });
  if (onlyFavorites && !favorites.length) announce('Aún no tienes favoritos. Usa el corazón para guardar productos.');
});
$('#cartToggle').addEventListener('click', () => { renderCart(); $('#cartDialog').showModal(); });
$('#clearFilters').addEventListener('click', resetFilters);
$('#showOffers').addEventListener('click', () => {
  onlyOffers = true;
  onlyFavorites = false;
  activeCategory = 'Todos';
  query = '';
  $('#search').value = '';
  $('#mobileSearch').value = '';
  updateCatalog();
  $('#productos').scrollIntoView({ behavior: 'smooth' });
});
$('#checkoutButton').addEventListener('click', () => announce('Demo: para aceptar pagos reales se necesita integrar una pasarela de pago.'));
$('#downloadList').addEventListener('click', downloadCartList);

const menuToggle = $('#menuToggle');
const mobileNav = $('#mobileNav');
menuToggle.addEventListener('click', () => {
  const opening = mobileNav.hidden;
  mobileNav.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Cerrar menú' : 'Abrir menú');
  menuToggle.innerHTML = icon(opening ? 'close' : 'menu');
});
$$('#mobileNav a').forEach(link => link.addEventListener('click', () => {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menú');
  menuToggle.innerHTML = icon('menu');
}));
window.addEventListener('resize', () => { if (innerWidth > 960) { mobileNav.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Abrir menú'); menuToggle.innerHTML = icon('menu'); } });

$('#year').textContent = new Date().getFullYear();
updateCatalog();
renderCart();
