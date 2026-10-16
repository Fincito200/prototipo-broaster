"use strict";
// SOLO DEMOSTRACIÓN. La autenticación y autorización reales deben estar en el servidor.
const USERS = [
  { user: "cajera", pass: "Caja123!", role: "caja", name: "Caja" },
  { user: "cocinero", pass: "Cocina123!", role: "cocina", name: "Cocina" },
  { user: "admin", pass: "Admin123!", role: "admin", name: "Administración" },
];
function emoji(name, extra = "") { return `<img class="emoji ${extra}" src="assets/${name}.svg" alt="" aria-hidden="true">`; }
function foodEmoji(category) { return ({ Broaster: "chicken", Mostrito: "chicken", Hamburguesas: "burger", Salchipapas: "fries", Acompañamientos: "fries", Bebidas: "drink" })[category] || "ticket"; }
function pageHeading(title, subtitle, icon) { return `<div class="page-heading"><div><h1>${title}</h1><p class="muted">${subtitle}</p></div>${emoji(icon, "heading-emoji")}</div>`; }
const CREAMS = ["Mayonesa", "Ketchup", "Mostaza", "Tártara", "Golf", "Ocopa", "Aceituna", "Ají"];
const PRODUCT_EMOJIS = [
  ["chicken", "Pollito"], ["burger", "Hamburguesa"], ["fries", "Papas"], ["drink", "Bebida"], ["salad", "Ensalada"], ["chef", "Cocinero"], ["ticket", "Comanda"], ["chart", "Gráfico"],
  ...CREAMS.map((name, n) => ["sauce-" + n, name]),
];
const isProductImage = value => typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value) && value.length < 600000;
function categories() { return [...new Set([...(db.categories || []), ...db.products.map(p => p.category)])]; }
function productArtwork(product) {
  if (isProductImage(product.image)) return '<img class="emoji uploaded-art" src="' + product.image + '" alt="" aria-hidden="true">';
  return emoji(PRODUCT_EMOJIS.some(([id]) => id === product.emoji) ? product.emoji : foodEmoji(product.category));
}
function artworkEditor(product) {
  const selected = isProductImage(product.image) ? "uploaded" : PRODUCT_EMOJIS.some(([id]) => id === product.emoji) ? product.emoji : "auto";
  return '<fieldset class="artwork-editor"><legend>Emoji o imagen del producto</legend><p class="description muted">Elige uno de los emojis o importa una imagen de tu PC.</p><div class="artwork-layout"><div class="artwork-preview" id="artwork-preview">' + productArtwork(product) + '</div><div class="emoji-picker"><label><input type="radio" name="artwork" value="auto" ' + (selected === 'auto' ? 'checked' : '') + '><span>' + emoji(foodEmoji(product.category)) + '<small>Por categoría</small></span></label>' + PRODUCT_EMOJIS.map(([id, name]) => '<label><input type="radio" name="artwork" value="' + id + '" ' + (selected === id ? 'checked' : '') + '><span>' + emoji(id) + '<small>' + esc(name) + '</small></span></label>').join('') + '<label id="uploaded-choice" ' + (selected !== 'uploaded' ? 'hidden' : '') + '><input type="radio" name="artwork" value="uploaded" ' + (selected === 'uploaded' ? 'checked' : '') + '><span>' + emoji('ticket') + '<small>Mi imagen</small></span></label></div></div><input type="hidden" name="imageData" value="' + (isProductImage(product.image) ? product.image : '') + '"><label class="upload-label" for="product-upload">Importar imagen desde mi PC</label><input id="product-upload" type="file" accept="image/png,image/jpeg,image/webp"><p class="description muted">PNG, JPG o WebP · hasta 10 MB. La imagen se optimiza al importar.</p><p id="artwork-message" class="description" role="status" aria-live="polite"></p></fieldset>';
}
function updateArtworkPreview() {
  const form = document.querySelector('#product');
  if (!form) return;
  const selected = form.elements.namedItem('artwork').value;
  document.querySelector('#artwork-preview').innerHTML = productArtwork({ category: form.elements.namedItem('category').value, emoji: selected === 'auto' ? null : selected, image: selected === 'uploaded' ? form.elements.namedItem('imageData').value : null });
}
let selectedCreams = [];
const BURGER_TYPES = ["Carne casera", "Carne San Fernando", "Pollo"];
function isBurger(item) { const p = itemProduct(item); return p.category === "Hamburguesas" || /^hamburguesa\b/i.test(p.name); }
function burgerDetails(item) { return item.portionBurgers?.map((type, n) => (item.qty > 1 ? "Porción " + (n + 1) + ": " : "") + type).join(" · ") || ""; }
function burgerOptions(portion) {
  if (!isBurger(portion.item)) return "";
  return '<fieldset class="creams salad-options"><legend>' + emoji("burger") + ' Tipo de hamburguesa</legend>' + BURGER_TYPES.map((type, n) => '<label class="cream-row" for="burger-' + n + '"><span>' + type + '</span><input id="burger-' + n + '" type="radio" name="burger" value="' + type + '" data-burger ' + (portion.burger === type ? "checked" : "") + '></label>').join("") + "</fieldset>";
}
const SALADS = ["Con ensalada", "Ensalada aparte", "Sin ensalada"];
let creamTarget = "";
const DRINK_BRANDS = ["Coca-Cola", "Inca Kola"];
function itemProduct(item) { return db.products.find(p => p.id === (item.productId || item.id)) || item; }
function isDrink(item) { return itemProduct(item).category === "Bebidas"; }
function isMostrito(item) { const p = itemProduct(item); return p.category === "Mostrito" || /^mostrito\b/i.test(p.name); }
function requiresNoSalad(item) { return isSalchipapa(item) || isMostrito(item); }
function isSalchipapa(item) { const p = itemProduct(item); return p.category === "Salchipapas" || /^salchipapa\b/i.test(p.name); }
function isPersonalSoda(product) { return product.id === "p5" || /^gaseosa personal\b/i.test(product.name); }
function productActions(product) {
  const disabled = !product.active || !hasPrice(product);
  if (isPersonalSoda(product)) return '<div class="brand-choices"><span>Elige la marca para agregar</span>' + DRINK_BRANDS.map((brand, n) => '<button class="drink-brand brand-' + n + '" data-action="add" data-id="' + esc(product.id) + '" data-value="' + brand + '" ' + (disabled ? 'disabled' : '') + '>' + brand + '</button>').join('') + '</div>';
  return '<button data-action="add" data-id="' + esc(product.id) + '" ' + (disabled ? 'disabled' : '') + '>' + (!hasPrice(product) ? 'Falta configurar precio' : product.active ? '＋ Agregar' : 'Agotado') + '</button>';
}
function checkoutChoices(name, title, options) {
  return '<fieldset class="quick-options"><legend>' + title + '</legend><div>' + options.map((option, n) => '<label><input type="radio" name="' + name + '" value="' + option + '" ' + (!n ? 'checked' : '') + '><span>' + option + '</span></label>').join('') + '</div></fieldset>';
}
function portionEditor(portions) {
  if (!portions.length) return cart.length ? '<p class="food-rule">Las bebidas no llevan cremas ni ensalada.</p>' : '';
  const current = portions.find(p => p.key === creamTarget);
  return burgerOptions(current) + '<fieldset class="creams"><legend>' + emoji('sauce-1') + ' Dale su toque</legend><p class="description">' + (portions.length > 1 ? 'Para: ' + esc(current.name) : 'Marca las cremas que quiera el cliente.') + '</p>' + CREAMS.map((cream, n) => '<label class="cream-row" for="cream-' + n + '"><span>' + emoji('sauce-' + n) + esc(cream) + '</span><input type="checkbox" id="cream-' + n + '" name="cream-' + n + '" value="yes" data-cream ' + (current.creams.includes(cream) ? 'checked' : '') + '></label>').join('') + '</fieldset>' + (requiresNoSalad(current.item) ? '<p class="food-rule">' + emoji(foodEmoji(itemProduct(current.item).category)) + '<span>' + (isMostrito(current.item) ? 'El mostrito' : 'La salchipapa') + ' siempre va <b>sin ensalada</b>.</span></p>' : '<fieldset class="creams salad-options"><legend>' + emoji('salad') + ' Ensalada</legend>' + SALADS.map((salad, n) => '<label class="cream-row" for="salad-' + n + '"><span>' + esc(salad) + '</span><input id="salad-' + n + '" type="radio" name="salad" value="' + salad + '" data-salad ' + (current.salad === salad ? 'checked' : '') + '></label>').join('') + '</fieldset>') + (portions.length > 1 ? '<div class="cream-target"><p class="target-label">Elige la porción que quieres personalizar</p><div class="portion-buttons">' + portions.map(p => '<button type="button" data-action="portion" data-value="' + esc(p.key) + '" aria-pressed="' + (p.key === creamTarget) + '">' + esc(p.name) + '</button>').join('') + '</div><div class="portion-summary">' + portions.map(p => '<p><b>' + esc(p.name) + ':</b> ' + (p.creams.map(esc).join(', ') || 'Sin cremas') + ' · ' + esc(p.salad) + (p.burger ? ' · ' + esc(p.burger) : '') + '</p>').join('') + '</div></div>' : '');
}
function creamPortions() {
  return cart.filter(item => !isDrink(item)).flatMap(item => {
    item.portionCreams = Array.from({ length: item.qty }, (_, n) => item.portionCreams?.[n] || []);
    item.portionSalads = Array.from({ length: item.qty }, (_, n) => requiresNoSalad(item) ? "Sin ensalada" : item.portionSalads?.[n] || SALADS[0]);
    if (isBurger(item)) item.portionBurgers = Array.from({ length: item.qty }, (_, n) => BURGER_TYPES.includes(item.portionBurgers?.[n]) ? item.portionBurgers[n] : BURGER_TYPES[0]);
    return item.portionCreams.map((creams, n) => ({ item, index: n, burger: item.portionBurgers?.[n], salad: item.portionSalads[n], key: item.id + ":" + n, name: item.name + (item.qty > 1 ? " · Porción " + (n + 1) : ""), creams }));
  });
}
function saladDetails(item) {
  return item.portionSalads?.map((salad, n) => (item.qty > 1 ? "Porción " + (n + 1) + ": " : "") + salad).join(" · ") || "";
}
function creamDetails(item) {
  return item.portionCreams?.map((creams, n) => (item.qty > 1 ? "Porción " + (n + 1) + ": " : "") + (creams.join(", ") || "Sin cremas")).join(" · ") || "";
}
const KEY = "broaster_demo_v1";
const initial = {
  menuVersion: 6,
  products: [
    {
      id: "p1",
      name: "Broaster alita",
      category: "Broaster",
      description: "Pollo crujiente con papas y ensalada",
      price: 18,
      active: true,
    },
    {
      id: "p2",
      name: "Alitas BBQ",
      category: "Broaster",
      description: "6 alitas con salsa BBQ y papas",
      price: 22,
      active: true,
    },
    {
      id: "p3",
      name: "Hamburguesa clásica",
      category: "Hamburguesas",
      description: "Hamburguesa clásica de la casa",
      price: 16,
      active: true,
    },
    {
      id: "p4",
      name: "Salchipapa clásica",
      category: "Salchipapas",
      description: "Papas doradas y salchichas",
      price: 12,
      active: true,
    },
    {
      id: "p5",
      name: "Gaseosa personal",
      category: "Bebidas",
      description: "Botella de 500 ml",
      price: 4,
      active: true,
    },
    {
      id: "p6",
      name: "Combo familiar",
      category: "Broaster",
      description: "4 porciones de pollo con papas",
      price: 65,
      active: true,
    },
  ],
  orders: [],
};
const MENU_VARIANTS = [
  { id: "hamburguesa-royal", name: "Hamburguesa royal", category: "Hamburguesas" },
  ...["pecho", "pierna", "encuentro"].map(cut => ({ id: "broaster-" + cut, name: "Broaster " + cut, category: "Broaster" })),
  { id: "salchipapa-royal", name: "Salchipapa royal", category: "Salchipapas" },
  ...["alita", "pecho", "pierna", "encuentro"].map(cut => ({ id: "mostrito-" + cut, name: "Mostrito " + cut, category: "Mostrito" })),
].map(product => ({ ...product, description: product.id === "hamburguesa-royal" ? "Hamburguesa de carne casera, carne San Fernando o pollo, con queso y huevo" : product.id === "salchipapa-royal" ? "Papas, hot dogs ahumados, queso, huevo y jamón" : product.category === "Mostrito" ? "Arroz chaufa con papas fritas y presa de " + product.name.split(" ").pop() : product.name, price: null, active: true }));
initial.products.push(...structuredClone(MENU_VARIANTS));
const MENU_PRICES = { p1: 10, "broaster-pecho": 12, "broaster-pierna": 11, "broaster-encuentro": 12, p3: 7, "hamburguesa-royal": 10, p4: 7, "salchipapa-royal": 10, "mostrito-alita": 13, "mostrito-pecho": 13, "mostrito-pierna": 13, "mostrito-encuentro": 13 };
function applyMenuPrices(products) {
  for (const product of products) {
    const matched = initial.products.find(p => p.name.toLocaleLowerCase("es") === product.name.toLocaleLowerCase("es") && p.category === product.category);
    const price = MENU_PRICES[product.id] ?? MENU_PRICES[matched?.id];
    if (price !== undefined) product.price = price;
  }
}
applyMenuPrices(initial.products);
function upgradeMenu(data) {
  if (data.menuVersion >= 6) return data;
  if (!(data.menuVersion >= 2)) {
  const legacyNames = { p1: ["Broaster clásico", "Broaster alita"], p3: ["Hamburguesa especial", "Hamburguesa clásica"], p4: ["Salchipapa", "Salchipapa clásica"] };
  data.products = data.products.map(product => {
    const updated = { ...product };
    const rename = legacyNames[product.id];
    if (rename && product.name === rename[0]) updated.name = rename[1];
    if (updated.category === "Alitas") updated.category = "Broaster";
    if (updated.id === "p4" && updated.name === "Salchipapa clásica" && updated.category === "Acompañamientos") updated.category = "Salchipapas";
    return updated;
  });
  for (const variant of initial.products) {
    if (!data.products.some(p => p.id === variant.id || (p.name.toLocaleLowerCase("es") === variant.name.toLocaleLowerCase("es") && p.category === variant.category))) {
      data.products.push(structuredClone(variant));
    }
  }
  }
  for (const product of data.products) {
    const cut = /^Mostrito (alita|pecho|pierna|encuentro)$/i.exec(product.name);
    if (product.category === "Mostrito" && cut) product.description = "Arroz chaufa con papas fritas y presa de " + cut[1].toLowerCase();
  }
  for (const product of data.products) {
    if (product.id === "salchipapa-royal" || (product.category === "Salchipapas" && /^salchipapa royal$/i.test(product.name))) product.description = "Papas, hot dogs ahumados, queso, huevo y jamón";
  }
  for (const product of data.products) {
    if (product.id === "hamburguesa-royal" || (product.category === "Hamburguesas" && /^hamburguesa royal$/i.test(product.name))) product.description = "Hamburguesa de carne casera, carne San Fernando o pollo, con queso y huevo";
  }
  applyMenuPrices(data.products);
  data.menuVersion = 6;
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Reintentar al guardar un cambio. */ }
  return data;
}
const hasPrice = product => Number.isFinite(product.price) && product.price > 0;
let session = null,
  cart = [],
  category = "Todos",
  editing = null,
  filterDate = today(),
  additional = null;
function read() {
  try {
    const x = JSON.parse(localStorage.getItem(KEY));
    return x && Array.isArray(x.products) && Array.isArray(x.orders)
      ? upgradeMenu(x)
      : structuredClone(initial);
  } catch {
    return structuredClone(initial);
  }
}
let db = read();
// Ejemplos solicitados para revisar Cocina. Se agregan una sola vez por navegador.
function loadKitchenExamples() {
  if (db.kitchenExamplesCreated) return;
  const specs = [
    { mode: "Recojo", ref: "Luis", note: "Pedido de prueba · Recojo a nombre de Luis", payment: "Efectivo", lines: [{ id: "p1", qty: 1, creams: [["Mayonesa", "Ají"]], salads: ["Ensalada aparte"] }] },
    { mode: "Mesa", ref: "Mesa 3", note: "Pedido de prueba · Mesa 3", payment: "Yape", lines: [{ id: "p3", qty: 1, creams: [["Ketchup", "Mostaza"]], salads: ["Con ensalada"], burgers: ["Carne casera"] }] },
    { mode: "Delivery", ref: "Ana", note: "Pedido de prueba · Delivery para Ana", payment: "Plin", lines: [{ id: "p4", qty: 1, creams: [["Mayonesa", "Tártara", "Golf"]], salads: ["Sin ensalada"] }] },
    { mode: "Mesa", ref: "Mesa 5", note: "Pedido de prueba · Dos hamburguesas royal y una salchipapa clásica", payment: "Tarjeta", lines: [{ id: "hamburguesa-royal", qty: 2, creams: [["Mayonesa", "Ketchup"], ["Tártara", "Ají"]], salads: ["Ensalada aparte", "Sin ensalada"], burgers: ["Pollo", "Carne San Fernando"] }, { id: "p4", qty: 1, creams: [["Mayonesa", "Ocopa"]], salads: ["Sin ensalada"] }] },
  ];
  if (specs.some(spec => spec.lines.some(line => !db.products.some(p => p.id === line.id && hasPrice(p))))) return;
  let number = Math.max(0, ...db.orders.map(o => o.number));
  const now = Date.now();
  const examples = specs.map((spec, index) => ({
    id: crypto.randomUUID(), number: ++number, parent: null,
    created: new Date(now - (specs.length - index - 1) * 60000).toISOString(), date: today(),
    mode: spec.mode, ref: spec.ref, note: spec.note, payment: spec.payment,
    paid: false, status: "Pendiente", demo: true,
    items: spec.lines.map(line => {
      const p = db.products.find(product => product.id === line.id);
      return { id: p.id, productId: p.id, name: p.name, category: p.category, price: p.price, qty: line.qty,
        portionCreams: structuredClone(line.creams), portionSalads: structuredClone(line.salads),
        ...(line.burgers ? { portionBurgers: structuredClone(line.burgers) } : {}) };
    }),
  }));
  db.orders.push(...examples);
  db.kitchenExamplesCreated = true;
  save();
}
loadKitchenExamples();

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
    return true;
  } catch {
    alert("No se pudo guardar. Revisa el almacenamiento del navegador.");
    db = read();
    return false;
  }
}
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const money = (n) =>
  n == null ? "Precio pendiente" : new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    n,
  );
const esc = (x) =>
  String(x ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const total = (o) => o.items.reduce((s, i) => s + i.price * i.qty, 0);
const app = document.querySelector("#app");
function render() {
  document.body.dataset.role = session?.role || "login";
  document.querySelector("#session").innerHTML = session
    ? `<span class="session-role">${emoji(session.role === "cocina" ? "chef" : session.role === "admin" ? "chart" : "ticket")}${esc(session.name)}</span><button class="secondary" data-action="logout">Salir</button>`
    : "";
  if (!session) {
    app.innerHTML = `<div class="login-layout"><section class="login-story"><h1>Un buen turno<br>empieza aquí.</h1><p>De la caja a la cocina.<br>Cada pedido, a su punto.</p><div class="mascot-stage">${emoji("chicken", "mascot")}<span>¡Vamos con todo!</span></div><div class="login-pals">${emoji("burger")}${emoji("fries")}${emoji("drink")}<span>El equipo del buen sabor.</span></div></section><section class="login card"><h2>Hola, equipo.</h2><p class="muted">Ingresa para comenzar tu turno.</p><form id="login"><label for="login-user">Usuario</label><input id="login-user" name="user" required autocomplete="username" placeholder="Tu usuario"><label for="login-pass">Contraseña</label><input id="login-pass" name="pass" type="password" required autocomplete="current-password" placeholder="Tu contraseña"><p class="error" id="error" aria-live="polite"></p><button class="full">Comenzar turno <span aria-hidden="true">→</span></button></form><details class="rolehint"><summary>Accesos para probar la demo</summary><p>Caja: <b>cajera / Caja123!</b><br>Cocina: <b>cocinero / Cocina123!</b><br>Administración: <b>admin / Admin123!</b></p></details><p class="description muted">Abre los roles en pestañas del mismo navegador para compartir los pedidos de prueba.</p></section></div>`;
    return;
  }
  if (session.role === "caja") renderCash();
  else if (session.role === "cocina") renderKitchen();
  else renderAdmin();
}
function renderCash() {
  const oldForm = document.querySelector("#checkout");
  const draft = oldForm ? Array.from(new FormData(oldForm).entries()).filter(([key]) => !key.startsWith("cream-") && key !== "salad" && key !== "burger") : [];
  const portions = creamPortions();
  if (!portions.some(p => p.key === creamTarget)) creamTarget = portions[0]?.key || "";
  selectedCreams = portions.find(p => p.key === creamTarget)?.creams || [];
  const cats = ["Todos", ...new Set(db.products.map((p) => p.category))];
  app.innerHTML = `${pageHeading("Que salga algo rico.", "Arma el pedido. Dale su toque. Envíalo a cocina.", "ticket")}<div class="layout"><section><div class="flex tabs">${cats.map((c) => `<button aria-pressed="${category === c}" class="${category === c ? "" : "secondary"}" data-action="category" data-value="${esc(c)}">${emoji(foodEmoji(c))}${esc(c)}</button>`).join("")}</div><div class="grid">${db.products
    .filter((p) => category === "Todos" || p.category === category)
    .map(
      (p) =>
        `<article class="card product ${p.active && hasPrice(p) ? "" : "sold-out"}"><div class="product-art">${productArtwork(p)}<span>${esc(p.category)}</span></div><span class="badge">${esc(p.category)}</span><h2>${esc(p.name)}</h2><p class="muted description">${esc(p.description)}</p><div class="price">${money(p.price)}</div>${productActions(p)}</article>`,
    )
    .join(
      "",
    )}</div></section><aside class="card checkout-panel" id="pedido"><button class="catalog-return secondary" data-action="catalog">← Seguir agregando</button><h2 class="checkout-title">${emoji("ticket")}${additional ? "Adicional del pedido #" + esc(additional) : "Nuevo pedido"}</h2>${cart.length ? cart.map((i) => `<div class="cartline"><b>${esc(i.name)}</b><div class="flex between"><span>${money(i.price * i.qty)}</span><span><button class="secondary" aria-label="Quitar una unidad de ${esc(i.name)}" data-action="minus" data-id="${i.id}">−</button> ${i.qty} <button class="secondary" aria-label="Agregar una unidad de ${esc(i.name)}" data-action="add" data-id="${i.id}">＋</button></span></div></div>`).join("") : `<div class="empty-cart">${emoji("fries")}<p>¿Qué se le antoja?</p><span>Agrega un producto para empezar.</span></div>`}<form id="checkout">${checkoutChoices("mode", "Atención", ["Recojo", "Mesa", "Delivery"])}<label for="order-ref">Mesa o referencia <span class="optional">(opcional)</span></label><input id="order-ref" name="ref" maxlength="80" placeholder="Ej. Mesa 3" autocomplete="off">${portionEditor(portions)}<label for="order-note">Observaciones</label><textarea id="order-note" name="note" maxlength="300" placeholder="Ej. Cremas aparte, sin cebolla"></textarea>${checkoutChoices("payment", "Medio de pago", ["Efectivo", "Yape", "Plin", "Tarjeta"])}<label><input type="checkbox" name="paid" style="width:auto"> Pago confirmado por caja</label><div class="total"><span>Total del pedido</span><strong>${money(total({ items: cart }))}</strong></div><button class="full" ${cart.length ? "" : "disabled"}>Enviar a cocina</button></form><button class="secondary full" data-action="clear">Vaciar pedido</button></aside></div><div class="flex between recent-orders-heading" style="margin-top:30px"><h2 style="margin:0">Pedidos recientes</h2><button class="secondary" data-action="refresh-orders">Actualizar pedidos</button></div><p id="orders-refresh-status" class="description muted" role="status" aria-live="polite"></p>${[...db.orders].reverse().slice(0, 10).map(orderCard).join("") || '<p class="empty">Todavía no hay pedidos.</p>'}`;
  const newForm = document.querySelector("#checkout");
  for (const [key, value] of draft) {
    const field = newForm?.elements.namedItem(key);
    if (field) { if (field.type === "checkbox") field.checked = true; else field.value = value; }
  }
  if (cart.length) app.insertAdjacentHTML("beforeend", `<div class="mobile-order-bar"><span aria-live="polite"><b>${cart.reduce((n, item) => n + item.qty, 0)} productos</b><small>${money(total({ items: cart }))}</small></span><button data-action="checkout">Ver mi pedido →</button></div>`);
}
function serviceLabel(order) {
  return '<div class="service-label" data-service="' + esc(order.mode) + '"><strong>' + esc(order.mode) + '</strong>' + (order.ref ? '<span>' + esc(order.ref) + '</span>' : '') + '</div>';
}
function kitchenItems(order) {
  return '<ul class="kitchen-items">' + order.items.map(item => {
    const count = Math.max(item.portionCreams?.length || 0, item.portionSalads?.length || 0, item.portionBurgers?.length || 0);
    return '<li><h3>' + item.qty + ' × ' + esc(item.name) + '</h3>' + (count ? '<div class="kitchen-portions">' + Array.from({ length: item.qty }, (_, n) => '<section class="kitchen-portion"><h4>Porción ' + (n + 1) + '</h4>' + (item.portionBurgers?.[n] ? '<p><b>Hamburguesa</b><span>' + esc(item.portionBurgers[n]) + '</span></p>' : '') + '<p><b>Cremas</b><span>' + (item.portionCreams?.[n]?.length ? item.portionCreams[n].map(esc).join(', ') : 'Sin cremas') + '</span></p>' + (item.portionSalads?.[n] ? '<p><b>Ensalada</b><span>' + esc(item.portionSalads[n]) + '</span></p>' : '') + '</section>').join('') + '</div>' : '') + '</li>';
  }).join('') + '</ul>';
}
function orderCard(o) {
  return `<article class="order" data-status="${esc(o.status)}"><div class="flex between"><b>#${o.number}${o.parent ? " · Adicional de #" + o.parent : ""}</b><span class="badge status-badge">${esc(o.status)}</span></div>${session.role === "cocina" ? serviceLabel(o) : ""}<p class="muted">${new Date(o.created).toLocaleString("es-PE")} · ${esc(o.mode)} · ${esc(o.ref)}</p>${session.role === "cocina" ? kitchenItems(o) : `<ul>${o.items.map((i) => `<li><b>${i.qty} × ${esc(i.name)}</b> — ${money(i.price * i.qty)}${i.portionCreams ? `<br><span class="description"><b>Cremas:</b> ${esc(creamDetails(i))}</span>` : ""}${i.portionBurgers ? `<br><span class="description"><b>Hamburguesa:</b> ${esc(burgerDetails(i))}</span>` : ""}${i.portionSalads ? `<br><span class="description"><b>Ensalada:</b> ${esc(saladDetails(i))}</span>` : ""}</li>`).join("")}</ul>`}${!o.items.some(i => i.portionCreams) && Array.isArray(o.creams) ? `<p><b>Cremas:</b> ${o.creams.length ? o.creams.map(esc).join(", ") : "Sin cremas"}</p>` : ""}${o.note ? `<p><b>Observaciones:</b> ${esc(o.note)}</p>` : ""}<div class="flex between"><b>${money(total(o))}</b><span>${o.paid ? "Pagado" : "Pago pendiente"} · ${esc(o.payment)}</span></div><div class="flex" style="margin-top:12px">${session.role === "cocina" ? (o.status === "Pendiente" ? `<button data-action="status" data-id="${o.id}" data-value="En preparación">Comenzar preparación</button>` : o.status === "En preparación" ? `<button data-action="status" data-id="${o.id}" data-value="Listo">Marcar listo</button>` : "") : session.role === "caja" ? `${!o.paid ? `<button class="secondary" data-action="paid" data-id="${o.id}">Confirmar pago</button>` : ""}${o.status === "Listo" ? `<button data-action="status" data-id="${o.id}" data-value="Entregado">Registrar entrega</button>` : ""}<button class="secondary" data-action="additional" data-id="${o.id}">Agregar adicional</button>` : ""}</div></article>`;
}
function renderKitchen() {
  let orders = db.orders
    .filter((o) => o.status !== "Entregado")
    .sort((a, b) => a.number - b.number);
  app.innerHTML = `<div class="flex between kitchen-heading">${pageHeading("Cada pedido, a su punto.", "Prepara por orden de llegada y avisa cuando esté listo.", "chef")}<button class="secondary" data-action="refresh">Actualizar cola</button></div><div class="kitchen-board">${["Pendiente", "En preparación", "Listo"].map((status, index) => `<section class="kitchen-lane lane-${index}"><div class="lane-heading"><h2>${status}</h2><span>${orders.filter(o => o.status === status).length}</span></div>${orders.filter(o => o.status === status).map(orderCard).join("") || `<div class="lane-empty">${emoji(index === 1 ? "chef" : index === 2 ? "chicken" : "ticket")}<p>${index === 0 ? "Todo al día." : index === 1 ? "La cocina está en pausa." : "Aquí van los pedidos listos."}</p></div>`}</section>`).join("")}</div>`;
}
function renderAdmin() {
  const orders = db.orders.filter((o) => o.date === filterDate);
  app.innerHTML = `${pageHeading("Tu negocio, sobre la mesa.", "La carta, los pedidos y las cuentas del día.", "chart")}<div class="flex"><input aria-label="Fecha del reporte" type="date" id="date" value="${filterDate}" style="width:auto"><button data-action="export">Exportar CSV para Excel</button></div><div class="grid stats"><div class="card">Comandas registradas<strong>${orders.length}</strong></div><div class="card">Importe de pedidos<strong>${money(orders.reduce((s, o) => s + total(o), 0))}</strong></div><div class="card">Cobrado en pedidos de esta fecha<strong>${money(orders.filter((o) => o.paid).reduce((s, o) => s + total(o), 0))}</strong></div></div><p class="muted description">Los adicionales cuentan como comandas separadas. Los importes son pedidos y cobros registrados, no ganancias ni un cierre contable. No se calculan costos o gastos en esta demo.</p><section class="card"><h2>Historial del ${esc(filterDate)}</h2><div class="scroll"><table><thead><tr><th>Pedido</th><th>Hora</th><th>Detalle</th><th>Total</th><th>Estado</th><th>Pago</th></tr></thead><tbody>${orders.map((o) => `<tr><td>#${o.number}${o.parent ? " / adicional #" + o.parent : ""}</td><td>${new Date(o.created).toLocaleTimeString("es-PE")}</td><td>${o.items.map((i) => `${i.qty} × ${esc(i.name)}`).join("<br>")}</td><td>${money(total(o))}</td><td>${esc(o.status)}</td><td>${o.paid ? "Pagado" : "Pendiente"}</td></tr>`).join("")}</tbody></table></div>${orders.length ? "" : '<p class="empty">Sin pedidos para esta fecha.</p>'}</section><div class="flex between" style="margin:28px 0 14px"><h2 style="margin:0">Administrar carta</h2><button data-action="new">Nuevo producto</button></div><div class="grid">${db.products.map((p) => `<div class="card admin-product">${productArtwork(p)}<span class="badge">${esc(p.category)}</span><h2 style="margin-top:12px">${esc(p.name)}</h2><p>${money(p.price)} · ${p.active ? "Disponible" : "Agotado"}</p><button class="secondary" data-action="edit" data-id="${p.id}">Editar producto</button></div>`).join("")}</div><div id="editor"></div>`;
  if (editing) renderEditor();
}
function renderEditor() {
  let p =
    editing === "new"
      ? {
          name: "",
          description: "",
          price: "",
          category: "Broaster",
          active: true,
        }
      : db.products.find((p) => p.id === editing);
  document.querySelector("#editor").innerHTML =
    `<section class="card" style="margin-top:24px"><h2>${editing === "new" ? "Nuevo producto" : "Editar producto"}</h2><form id="product"><div class="editgrid"><div><label>Nombre</label><input name="name" value="${esc(p.name)}" maxlength="80" required></div><div><label for="product-category">Categoría</label><select id="product-category" name="category" required>${categories().map(c => `<option value="${esc(c)}" ${c === p.category ? "selected" : ""}>${esc(c)}</option>`).join("")}</select><button type="button" class="secondary create-category" data-action="showcategory">＋ Crear categoría</button><div class="category-create" id="category-create" hidden><label for="new-category">Nombre de la nueva categoría</label><input id="new-category" maxlength="40" placeholder="Ej. Postres"><div class="flex"><button type="button" data-action="savecategory">Crear categoría</button><button type="button" class="secondary" data-action="cancelcategory">Cancelar</button></div><p id="category-message" class="description" role="status"></p></div></div><div><label>Precio en soles</label><input name="price" type="number" min="0.01" max="10000" step="0.01" value="${p.price ?? ""}" required></div><div><label>Disponibilidad</label><select name="active"><option value="yes" ${p.active ? "selected" : ""}>Disponible</option><option value="no" ${p.active ? "" : "selected"}>Agotado</option></select></div></div>${artworkEditor(p)}<label>Descripción</label><textarea name="description" maxlength="250">${esc(p.description)}</textarea><div class="flex" style="margin-top:15px"><button type="submit">Guardar producto</button><button type="button" class="secondary" data-action="closeedit">Cancelar</button></div></form></section>`;
}
function exportCSV() {
  const rows = [
    [
      "Pedido",
      "Adicional de",
      "Fecha",
      "Hora",
      "Producto",
      "Cantidad",
      "Precio unitario",
      "Subtotal",
      "Total pedido solo primera fila",
      "Estado",
      "Pago",
      "Medio",
      "Referencia",
      "Observaciones",
      "Cremas",
      "Ensalada",
      "Tipo de hamburguesa",
    ],
  ];
  db.orders
    .filter((o) => o.date === filterDate)
    .forEach((o) =>
      o.items.forEach((i, n) =>
        rows.push([
          o.number,
          o.parent || "",
          o.date,
          new Date(o.created).toLocaleTimeString("es-PE"),
          i.name,
          i.qty,
          i.price.toFixed(2),
          (i.qty * i.price).toFixed(2),
          n === 0 ? total(o).toFixed(2) : "",
          o.status,
          o.paid ? "Pagado" : "Pendiente",
          o.payment,
          o.ref,
          o.note,
          i.portionCreams ? creamDetails(i) : Array.isArray(o.creams) ? (o.creams.join(", ") || "Sin cremas") : "",
          saladDetails(i),
          burgerDetails(i),
        ]),
      ),
    );
  const quote = (v) =>
    '"' +
    String(/^[=+\-@\t\r]/.test(String(v)) ? "'" + v : v).replace(/"/g, '""') +
    '"';
  const blob = new Blob(
    ["\uFEFF" + rows.map((r) => r.map(quote).join(";")).join("\r\n")],
    { type: "text/csv;charset=utf-8;" },
  );
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = `pedidos-${filterDate}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
document.addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  if (e.target.id === "login") {
    const u = USERS.find(
      (u) => u.user === f.get("user").trim() && u.pass === f.get("pass"),
    );
    if (!u) {
      document.querySelector("#error").textContent =
        "Usuario o contraseña incorrectos.";
      return;
    }
    session = u;
    db = read();
    render();
    return;
  }
  if (!session) return;
  if (e.target.id === "checkout" && session.role === "caja" && cart.length) {
    db = read();
    if (cart.some((i) => !db.products.find((p) => p.id === (i.productId || i.id) && p.active && hasPrice(p)))) {
      alert("Un producto ya no está disponible. Revisa la carta.");
      return;
    }
    creamPortions();
    const number = Math.max(0, ...db.orders.map((o) => o.number)) + 1;
    db.orders.push({
      id: crypto.randomUUID(),
      number,
      parent: additional,
      created: new Date().toISOString(),
      date: today(),
      items: structuredClone(cart),
      mode: f.get("mode"),
      ref: f.get("ref").trim(),
      note: f.get("note").trim(),

      payment: f.get("payment"),
      paid: f.has("paid"),
      status: "Pendiente",
    });
    if (save()) {
      e.target.reset();
      cart = [];
      selectedCreams = [];
      additional = null;
      render();
      alert(`Pedido #${number} guardado en esta demo.`);
    }
  }
  if (e.target.id === "product" && session.role === "admin") {
    const price = Number(f.get("price"));
    if (
      !Number.isFinite(price) ||
      price <= 0 ||
      !f.get("name").trim() ||
      !f.get("category").trim()
    )
      return;
    db = read();
    if (!categories().includes(f.get("category"))) return;
    const artwork = f.get("artwork");
    const p = {
      emoji: PRODUCT_EMOJIS.some(([id]) => id === artwork) ? artwork : null,
      image: artwork === "uploaded" && isProductImage(f.get("imageData")) ? f.get("imageData") : null,
      id: editing === "new" ? crypto.randomUUID() : editing,
      name: f.get("name").trim(),
      category: f.get("category").trim(),
      description: f.get("description").trim(),
      price,
      active: f.get("active") === "yes",
    };
    const idx = db.products.findIndex((x) => x.id === p.id);
    if (idx < 0) db.products.push(p);
    else db.products[idx] = p;
    if (save()) {
      editing = null;
      render();
    }
  }
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  const { action, id, value } = b.dataset;
  if (action === "logout") {
    session = null;
    selectedCreams = [];
    creamTarget = "";
    cart = [];
    additional = null;
    editing = null;
    render();
    return;
  }
  if (!session) return;
  if (["showcategory", "cancelcategory", "savecategory"].includes(action)) {
    if (session.role !== "admin") return;
    const box = document.querySelector('#category-create');
    if (!box) return;
    if (action === 'showcategory') { box.hidden = false; document.querySelector('#new-category').focus(); return; }
    if (action === 'cancelcategory') { box.hidden = true; return; }
    const name = document.querySelector('#new-category').value.trim().replace(/\s+/g, ' ');
    const message = document.querySelector('#category-message');
    if (!name) { message.textContent = 'Escribe el nombre de la categoría.'; return; }
    db = read();
    const key = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
    const existing = categories().find(c => key(c) === key(name));
    const chosen = existing || name;
    if (!existing) { db.categories = [...new Set([...(db.categories || []), name])]; if (!save()) return; }
    const select = document.querySelector('#product-category');
    if (!Array.from(select.options).some(o => o.value === chosen)) select.add(new Option(chosen, chosen));
    select.value = chosen;
    box.hidden = true;
    document.querySelector('#new-category').value = '';
    updateArtworkPreview();
    select.focus();
    return;
  }
  if (action === "refresh-orders") {
    if (session.role !== "caja") return;
    db = read();
    render();
    const message = document.querySelector("#orders-refresh-status");
    if (message) message.textContent = "Pedidos actualizados a las " + new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
    return;
  }
  if (action === "refresh") {
    db = read();
    render();
    return;
  }
  if (
    ["add", "minus", "clear", "category", "additional", "paid"].includes(
      action,
    ) &&
    session.role !== "caja"
  )
    return;
  if (
    ["edit", "new", "closeedit", "export"].includes(action) &&
    session.role !== "admin"
  )
    return;
  if (["checkout", "catalog", "portion"].includes(action)) {
    if (session.role !== "caja") return;
    if (action === "portion") { creamTarget = value; render(); return; }
    document.querySelector(action === "checkout" ? "#pedido" : ".tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  if (action === "category") category = value;
  if (action === "add") {
    const existing = cart.find(item => item.id === id);
    const p = db.products.find(p => p.id === (existing?.productId || id) && p.active && hasPrice(p));
    if (!p) return;
    const brand = existing?.brand || value;
    if (isPersonalSoda(p) && !DRINK_BRANDS.includes(brand)) return;
    const lineId = isPersonalSoda(p) ? p.id + (brand === "Coca-Cola" ? "-coca" : "-inca") : p.id;
    const i = cart.find(item => item.id === lineId);
    if (i) i.qty++;
    else cart.push({ id: lineId, productId: p.id, category: p.category, brand: isPersonalSoda(p) ? brand : null, name: p.name + (isPersonalSoda(p) ? " · " + brand : ""), price: p.price, qty: 1 });
  }
  if (action === "minus") {
    const i = cart.find((i) => i.id === id);
    if (i) i.qty--;
    cart = cart.filter((i) => i.qty > 0);
  }
  if (action === "clear") {
    document.querySelector("#checkout")?.reset();
    creamTarget = "";
    selectedCreams = [];
    cart = [];
    additional = null;
  }
  if (action === "additional") {
    if (cart.length && !confirm("Vaciar el carrito para crear este adicional?"))
      return;
    const o = db.orders.find((o) => o.id === id);
    selectedCreams = [];
    creamTarget = "";
    document.querySelector("#checkout")?.reset();
    additional = o.parent || o.number;
    cart = [];
    window.scrollTo(0, 0);
  }
  if (action === "paid") {
    if (!confirm("¿Confirmas que recibiste el pago de esta comanda?")) return;
    db = read();
    const o = db.orders.find((o) => o.id === id);
    if (o) o.paid = true;
    save();
  }
  if (action === "status") {
    db = read();
    const o = db.orders.find((o) => o.id === id);
    if (!o) return;
    const allowed =
      (session.role === "cocina" &&
        ((o.status === "Pendiente" && value === "En preparación") ||
          (o.status === "En preparación" && value === "Listo"))) ||
      (session.role === "caja" &&
        o.status === "Listo" &&
        value === "Entregado");
    if (!allowed) return;
    if (value === "En preparación") {
      const first = db.orders
        .filter((o) => o.status === "Pendiente")
        .sort((a, b) => a.number - b.number)[0];
      if (first?.id !== id) {
        alert("Comienza por la comanda pendiente más antigua.");
        return;
      }
    }
    o.status = value;
    save();
  }
  if (action === "edit") editing = id;
  if (action === "new") editing = "new";
  if (action === "closeedit") editing = null;
  if (action === "export") {
    exportCSV();
    return;
  }
  render();
  if (action === "edit" || action === "new")
    document.querySelector("#editor").scrollIntoView({ behavior: "smooth" });
});
document.addEventListener("change", (e) => {
  if (e.target.matches("[data-cream]") && session?.role === "caja") {
    const portion = creamPortions().find(p => p.key === creamTarget);
    if (portion) {
      portion.creams.splice(0, portion.creams.length, ...CREAMS.filter((cream, index) => document.querySelector(`#cream-${index}`)?.checked));
      render();
      document.querySelector("#" + e.target.id)?.focus({ preventScroll: true });
    }
  }
  if (e.target.matches("[data-burger]") && session?.role === "caja") {
    const portion = creamPortions().find(p => p.key === creamTarget);
    if (portion && isBurger(portion.item) && BURGER_TYPES.includes(e.target.value)) {
      portion.item.portionBurgers[portion.index] = e.target.value;
      render();
      document.querySelector("#" + e.target.id)?.focus({ preventScroll: true });
    }
  }
  if (e.target.matches("[data-salad]") && session?.role === "caja") {
    const portion = creamPortions().find(p => p.key === creamTarget);
    if (portion && !requiresNoSalad(portion.item) && SALADS.includes(e.target.value)) {
      portion.item.portionSalads[portion.index] = e.target.value;
      render();
      document.querySelector("#" + e.target.id)?.focus({ preventScroll: true });
    }
  }
  if (e.target.id === "cream-target" && session?.role === "caja") {
    creamTarget = e.target.value;
    render();
    document.querySelector("#cream-target")?.focus({ preventScroll: true });
  }
  if (e.target.id === "date" && session?.role === "admin") {
    filterDate = e.target.value;
    render();
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === KEY) {
    db = read();
    const form = document.querySelector("#checkout");
    const fields = form ? Array.from(new FormData(form).entries()) : null;
    render();
    if (fields) {
      const restored = document.querySelector("#checkout");
      for (const [k, v] of fields) {
        const el = restored?.elements.namedItem(k);
        if (el) {
          if (el.type === "checkbox") el.checked = true;
          else el.value = v;
        }
      }
    }
  }
});
render();

let artworkUpload = 0;
document.addEventListener('change', async e => {
  if (session?.role !== 'admin') return;
  if (e.target.name === 'artwork' || e.target.id === 'product-category') { updateArtworkPreview(); return; }
  if (e.target.id !== 'product-upload') return;
  const form = e.target.closest('form');
  const file = e.target.files?.[0];
  if (!file || !form) return;
  const message = document.querySelector('#artwork-message');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) { message.textContent = 'Elige una imagen PNG, JPG o WebP de hasta 10 MB.'; e.target.value = ''; return; }
  const token = ++artworkUpload;
  const submit = form.querySelector('[type=submit]');
  submit.disabled = true;
  message.textContent = 'Importando imagen…';
  let url;
  try {
    url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    if (document.querySelector('#product') !== form || token !== artworkUpload) return;
    const scale = Math.min(1, 384 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL('image/webp', 0.85);
    if (!isProductImage(image)) throw new Error('Invalid image');
    form.elements.namedItem('imageData').value = image;
    document.querySelector('#uploaded-choice').hidden = false;
    form.querySelector('[name=artwork][value=uploaded]').checked = true;
    updateArtworkPreview();
    message.textContent = 'Imagen lista. Guarda el producto para aplicar el cambio.';
  } catch { if (document.querySelector('#product') === form && token === artworkUpload) message.textContent = 'No se pudo leer esta imagen. Prueba con otra.'; }
  finally { if (url) URL.revokeObjectURL(url); if (document.querySelector('#product') === form && token === artworkUpload) submit.disabled = false; }
});
