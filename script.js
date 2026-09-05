const pages = document.querySelectorAll('.page');
const navs = document.querySelectorAll('.nav');
const toast = document.getElementById('toast');

function showPage(id){
  pages.forEach(p => p.classList.toggle('active', p.id === id));
  navs.forEach(n => n.classList.toggle('active', n.dataset.page === id));
  window.scrollTo({top:0, behavior:'smooth'});
}

document.querySelectorAll('[data-page]').forEach(el => {
  el.addEventListener('click', () => showPage(el.dataset.page));
});

document.querySelectorAll('.game-info button').forEach(btn => {
  btn.addEventListener('click', () => {
    toast.textContent = 'INICIANDO JUEGO...';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  });
});

document.querySelectorAll('.settings-list input').forEach(input => {
  input.addEventListener('change', () => {
    toast.textContent = input.checked ? 'AJUSTE ACTIVADO' : 'AJUSTE DESACTIVADO';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1200);
  });
});

setTimeout(() => {
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}, 700);

// Mejoras interactivas para móviles
document.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('touchstart', () => btn.classList.add('touching'), {passive:true});
  btn.addEventListener('touchend', () => btn.classList.remove('touching'), {passive:true});
});

const mobileMenu = document.querySelector('.mobile-menu');
const nav = document.querySelector('.bottom-nav');
if (mobileMenu && nav) {
  mobileMenu.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
  });
  document.querySelectorAll('.nav').forEach(n => n.addEventListener('click', () => nav.classList.remove('mobile-open')));
}

// Permite deslizar las tarjetas de juegos cómodamente en pantallas táctiles.
const gameGrid = document.querySelector('.game-grid');
if (gameGrid) {
  gameGrid.addEventListener('wheel', e => {
    if (window.innerWidth <= 800 && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      gameGrid.scrollLeft += e.deltaY;
    }
  }, {passive:true});
}
