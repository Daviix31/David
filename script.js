const products=[
{id:1,name:"Audífonos Pro",cat:"Tecnología",price:149900,old:189900,emoji:"🎧"},
{id:2,name:"Smartwatch Active",cat:"Tecnología",price:229900,old:289900,emoji:"⌚"},
{id:3,name:"Lámpara Minimal",cat:"Hogar",price:89900,old:null,emoji:"💡"},
{id:4,name:"Mochila Urban",cat:"Accesorios",price:119900,old:149900,emoji:"🎒"},
{id:5,name:"Tenis Street",cat:"Moda",price:199900,old:249900,emoji:"👟"},
{id:6,name:"Cámara Compacta",cat:"Tecnología",price:329900,old:399900,emoji:"📷"},
{id:7,name:"Sudadera Essential",cat:"Moda",price:129900,old:null,emoji:"🧥"},
{id:8,name:"Taza Premium",cat:"Hogar",price:49900,old:59900,emoji:"☕"}
];
let cart=JSON.parse(localStorage.getItem("novashop-cart")||"[]"), category="Todos";
const money=n=>new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:0}).format(n);
function render(){
 const q=document.getElementById("search").value.toLowerCase();
 const list=products.filter(p=>(category==="Todos"||p.cat===category)&&p.name.toLowerCase().includes(q));
 document.getElementById("products").innerHTML=list.map(p=>`<article class="card"><div class="pic"><button class="heart" onclick="showToast('Añadido a favoritos ❤️')">♡</button><div class="emoji">${p.emoji}</div></div><div class="info"><div class="cat">${p.cat}</div><div class="name">${p.name}</div><div class="price">${money(p.price)} ${p.old?`<span class="old">${money(p.old)}</span>`:""}</div><button class="btn primary add" onclick="add(${p.id})">Añadir al carrito</button></div></article>`).join("")||"<p>No encontramos productos.</p>";
}
function add(id){const item=cart.find(x=>x.id===id);item?item.qty++:cart.push({id,qty:1});save();showToast("Producto añadido al carrito");}
function save(){localStorage.setItem("novashop-cart",JSON.stringify(cart));renderCart();document.getElementById("count").textContent=cart.reduce((a,x)=>a+x.qty,0)}
function renderCart(){
 const el=document.getElementById("cartitems"); if(!cart.length){el.innerHTML='<div class="empty">Tu carrito está vacío 🛒</div>';document.getElementById("total").textContent=money(0);return}
 let total=0;el.innerHTML=cart.map(x=>{const p=products.find(p=>p.id===x.id);total+=p.price*x.qty;return `<div class="cartitem"><div class="cartthumb">${p.emoji}</div><div style="flex:1"><b>${p.name}</b><div>${money(p.price)}</div><div class="qty"><button onclick="change(${p.id},-1)">−</button>${x.qty}<button onclick="change(${p.id},1)">+</button><button style="margin-left:auto;border:0;background:none;cursor:pointer" onclick="removeItem(${p.id})">🗑️</button></div></div></div>`}).join("");document.getElementById("total").textContent=money(total)}
function change(id,d){const x=cart.find(x=>x.id===id);x.qty+=d;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);save()}
function removeItem(id){cart=cart.filter(x=>x.id!==id);save()}
function openCart(){document.getElementById("overlay").classList.add("open");renderCart()}
function closeCart(){document.getElementById("overlay").classList.remove("open")}
function checkout(){if(!cart.length)return showToast("Agrega productos primero");showToast("Demo: conecta aquí tu pasarela de pago");}
function showToast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");category=b.dataset.cat;render()});
document.getElementById("search").addEventListener("input",render);render();save();
