/* Genera todas las páginas estáticas de site/ a partir de data/products.json
   Uso:  node scripts/build.js            */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'site');
const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8'));
const cats = data.categories;
const catBy = Object.fromEntries(cats.map(c => [c.slug, c]));
const products = data.products.map((p, i) => ({
  ...p,
  pos: i,
  catName: catBy[p.cat].name,
  img: 'img/productos/' + p.images[0],
  off: p.price && p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
}));
const bySlug = Object.fromEntries(products.map(p => [p.slug, p]));

/* ---------- Datos de marca ---------- */
const BRAND = 'Elanill0';
const WA = '34605505120';
const WA_PRETTY = '+34 605 505 120';
const EMAIL = 'juam9219@gmail.com';
const FB = 'https://www.facebook.com/elanill0';
const SITE = 'https://elanill0.com';
const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

/* ---------- Iconos ---------- */
const I = {
  search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  wa: (s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.4l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200c0 1.300.9 2.500 1 2.700.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.7 3.100.6.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z"/></svg>`,
  fb: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M14 8V6.500c0-.7.3-1 1-1h2V2h-3c-3 0-4.500 1.800-4.500 4.500V8H7v3.500h2.500V22H14V11.500h2.800L17.200 8H14Z"/></svg>`,
  mail: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>`,
  pin: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21Z"/><circle cx="12" cy="9.500" r="2.500"/></svg>`,
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4 12.500 5 5L20 6.500"/></svg>'
};

/* ---------- Estructura común ---------- */
const NAV = [
  ['coleccion-anillos.html', 'Anillos'],
  ['coleccion-collares.html', 'Collares'],
  ['coleccion-pulseras.html', 'Pulseras'],
  ['coleccion-pendientes.html', 'Pendientes'],
  ['tienda.html', 'Tienda'],
  ['sobre-nosotros.html', 'Sobre nosotros'],
  ['cuidado-del-acero.html', 'Cuidado del acero'],
  ['contacto.html', 'Contacto']
];

function head({ title, desc, file, image, extra = '' }) {
  const full = file === 'index.html' ? `${BRAND} · Joyas de acero inoxidable` : `${title} · ${BRAND}`;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(full)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${esc(SITE + '/' + (image || 'img/marca/logo.webp'))}">
<link rel="icon" type="image/png" href="img/marca/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="styles.css">
${extra}</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
`;
}

function header(file) {
  const nav = NAV.map(([href, label]) => {
    const cur = href === file || (file.startsWith('producto-') && href === `coleccion-${bySlug[file.slice(9, -5)]?.cat}.html`);
    return `<a href="${href}"${cur ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  return `<header class="site-header">
  <div class="wrap">
    <div class="topbar">
      <div class="top-left">
        <form class="search" action="tienda.html" method="get" role="search">
          <button type="submit" aria-label="Buscar">${I.search}</button>
          <label><small>BUSCAR</small><input type="search" name="q" placeholder="Busco..." aria-label="Buscar productos"></label>
        </form>
        <a class="top-wa" href="${wa('Hola, quisiera información sobre vuestras joyas.')}" target="_blank" rel="noopener">
          ${I.wa(22)}
          <span><small>WHATSAPP</small>${WA_PRETTY}</span>
        </a>
      </div>
      <a class="brand" href="index.html" aria-label="${BRAND}, inicio"><img src="img/marca/logo.webp" width="84" height="84" alt="${BRAND} · Joyas únicas y modernas"></a>
      <div class="top-right">
        <a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook de ${BRAND}">${I.fb(24)}</a>
        <a href="${wa('Hola, quisiera información sobre vuestras joyas.')}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${I.wa(24)}</a>
        <a href="mailto:${EMAIL}" aria-label="Escríbenos un email">${I.mail(24)}</a>
      </div>
    </div>
    <nav class="main-nav" aria-label="Principal">${nav}</nav>
  </div>
</header>
<main id="contenido">
`;
}

function footer() {
  return `</main>
<footer>
  <div class="wrap">
    <div class="foot-box">
      <div class="foot-cols">
        <div class="f-brand">
          <a href="index.html" aria-label="${BRAND}, inicio"><img src="img/marca/logo.webp" width="92" height="92" alt="${BRAND}"></a>
          <p>${BRAND} es una tienda online de joyas de acero inoxidable: anillos, collares, pulseras y pendientes pensados para el día a día. Compra por WhatsApp.</p>
        </div>
        <div class="f-contact">
          <h3>Contacto</h3>
          <a href="mailto:${EMAIL}">${I.mail(14)} ${EMAIL}</a>
          <a href="${wa('Hola, quisiera información sobre vuestras joyas.')}" target="_blank" rel="noopener">${I.wa(14)} ${WA_PRETTY}</a>
          <a href="contacto.html">${I.pin(14)} Madrid, España</a>
          <div class="social">
            <a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb(14)}</a>
          </div>
        </div>
        <div class="f-col"><h3>Tienda</h3>
          <a href="coleccion-anillos.html">Anillos</a><a href="coleccion-collares.html">Collares</a><a href="coleccion-pulseras.html">Pulseras</a><a href="coleccion-pendientes.html">Pendientes</a><a href="tienda.html">Todos los productos</a></div>
        <div class="f-col"><h3>Empresa</h3>
          <a href="sobre-nosotros.html">Sobre nosotros</a><a href="cuidado-del-acero.html">Cuidado del acero</a><a href="colecciones.html">Colecciones</a><a href="contacto.html">Contacto</a></div>
        <div class="f-col"><h3>Legal</h3>
          <a href="envios-y-devoluciones.html">Envíos y devoluciones</a><a href="privacidad.html">Privacidad</a><a href="terminos.html">Términos</a><a href="cookies.html">Cookies</a></div>
      </div>
      <p class="copy">© ${new Date().getFullYear()} ${BRAND}. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>
<script src="assets/app.js" defer></script>
</body>
</html>
`;
}

function page(file, meta, body) {
  fs.writeFileSync(path.join(OUT, file), head({ ...meta, file }) + header(file) + body + footer());
}

const priceHtml = p => p.price == null
  ? '<span class="price"><em>Consultar precio</em></span>'
  : `<span class="price">${p.oldPrice ? `<s>${eur(p.oldPrice)}</s>` : ''}<strong>${eur(p.price)}</strong></span>`;

const buyText = p => p.price == null
  ? `Hola, quiero saber el precio y la disponibilidad de: ${p.name}`
  : `Hola, quiero comprar: ${p.name} - ${eur(p.price)}`;

function card(p) {
  return `<article class="product" data-cat="${p.cat}" data-price="${p.price ?? ''}" data-name="${esc(p.name)}" data-pos="${p.pos}">
        <a class="thumb" href="producto-${p.slug}.html" tabindex="-1" aria-hidden="true">
          <img src="${p.img}" alt="" loading="lazy" width="500" height="520">${p.off ? `<span class="badge">-${p.off}%</span>` : ''}
        </a>
        <small class="cat">${p.catName.toUpperCase()}</small>
        <a class="name" href="producto-${p.slug}.html">${esc(p.name)}</a>
        ${priceHtml(p)}
        <a class="btn-wa" href="${wa(buyText(p))}" target="_blank" rel="noopener">${I.wa(14)}${p.price == null ? 'CONSULTAR POR WHATSAPP' : 'COMPRAR POR WHATSAPP'}</a>
      </article>`;
}

const crumbs = items => `<nav class="crumbs" aria-label="Migas de pan">${items.map(([h, l], i) => (h ? `<a href="${h}">${l}</a>` : `${l}`) + (i < items.length - 1 ? '<span>/</span>' : '')).join('')}</nav>`;
const pageHead = (cr, h1, lead) => `<section class="wrap page-head">
  ${crumbs(cr)}
  <h1>${h1}</h1>
  ${lead ? `<p>${lead}</p>` : ''}
  <div class="bar"></div>
</section>
`;

const faqHtml = items => `<div class="faq">${items.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>`;
const ctaWa = (title, text = 'ESCRIBIR POR WHATSAPP', msg = 'Hola, quisiera información sobre vuestras joyas.') => `<section class="wrap">
  <div class="cta">
    <h2>${title}</h2>
    <a class="btn btn-light" href="${wa(msg)}" target="_blank" rel="noopener">${I.wa(16)}${text}</a>
  </div>
</section>
`;

/* ======================================================= INICIO */
const pick = ids => ids.map(id => products.find(p => p.id === id));
const best = pick([29101, 29156, 29132, 29160]);
const latest = products.slice(0, 4);

page('index.html', {
  title: 'Inicio',
  desc: 'Joyas de acero inoxidable: anillos, collares, pulseras y pendientes con hasta un 45 % de descuento. Compra por WhatsApp.',
  image: 'img/hero.jpg'
}, `
<section class="wrap hero">
  <div class="hero-photo"><img src="img/hero.jpg" alt="Mujer con aros dorados de acero inoxidable" width="1024" height="352"></div>
  <div class="hero-panel">
    <h1>JOYAS DE ACERO<br>PARA TODOS<br>LOS DÍAS</h1>
    <p>Anillos, collares, pulseras y pendientes de acero inoxidable con hasta un 45 % de descuento. Elige tu pieza y pídela por WhatsApp.</p>
    <a class="btn btn-light" href="tienda.html">VER LA TIENDA</a>
  </div>
</section>

<section class="wrap block">
  <div class="label-row"><h2 class="label"><span>•</span> Más vendidos</h2><a href="tienda.html">VER TODO</a></div>
  <div class="inset">
    <div class="products">
      ${best.map(card).join('\n      ')}
    </div>
    <div class="center" style="margin-top:46px"><a class="btn btn-outline" href="tienda.html">VER TODOS LOS PRODUCTOS</a></div>
  </div>
</section>

<section class="wrap promo">
  <div class="promo-card">
    <p>Hasta un 45 % de<br>descuento en toda<br>la tienda</p>
    <a class="btn btn-light" href="tienda.html?orden=precio-asc">VER OFERTAS</a>
  </div>
  <a class="promo-photo" href="coleccion-pendientes.html" aria-label="Ver la colección de pendientes">
    <img src="img/promo.jpg" alt="Aro dorado con bolitas en la oreja" loading="lazy" width="1024" height="1024">
    <div class="promo-text">
      <h2 class="label"><span>•</span> Colección pendientes</h2>
      <p class="promo-title">Aros<br>de acero</p>
    </div>
  </a>
</section>

<section class="wrap block">
  <div class="label-row"><h2 class="label"><span>•</span> Novedades</h2><a href="tienda.html">VER TODO</a></div>
  <div class="inset">
    <div class="products">
      ${latest.map(card).join('\n      ')}
    </div>
  </div>
</section>

<section class="wrap block">
  <h2 class="label"><span>•</span> Colecciones</h2>
  <div class="cats">
    ${cats.map(c => `<a href="coleccion-${c.slug}.html"><div class="ph"><img src="${c.cover}" alt="" loading="lazy" width="500" height="500"></div><strong>${c.name}</strong><small>${products.filter(p => p.cat === c.slug).length} productos</small></a>`).join('\n    ')}
  </div>
  <div class="browse"><a href="colecciones.html">VER TODAS LAS COLECCIONES</a></div>
</section>

<section class="wrap banner">
  <div class="banner-copy">
    <h2>PARA ÉL<br>Y PARA ELLA</h2>
    <a class="btn btn-ghost" href="coleccion-anillos.html">VER ANILLOS</a>
  </div>
  <img src="img/banner.webp" alt="Hombre con anillo de sello y cadena de acero" loading="lazy" width="1122" height="1402">
</section>

<section class="wrap news">
  <h2>NO TE PIERDAS<br>NINGUNA NOVEDAD</h2>
  <form action="mailto:${EMAIL}?subject=${encodeURIComponent('Quiero recibir novedades de ' + BRAND)}" method="post" enctype="text/plain">
    <input type="email" name="Correo para novedades" placeholder="Correo electrónico" aria-label="Correo electrónico" required>
    <button type="submit">Suscribirme <span aria-hidden="true">→</span></button>
  </form>
  <p>Se abrirá tu programa de correo para enviarnos tu solicitud. También puedes <a href="${wa('Hola, quiero recibir novedades de ' + BRAND)}" target="_blank" rel="noopener" style="text-decoration:underline">escribirnos por WhatsApp</a>.</p>
</section>
`);

/* ======================================================= TIENDA */
page('tienda.html', {
  title: 'Tienda',
  desc: `Todos los productos de ${BRAND}: anillos, collares, pulseras y pendientes de acero inoxidable.`
}, `
${pageHead([['index.html', 'Inicio'], [null, 'Tienda']], 'Tienda', 'Joyas de acero inoxidable con descuento. Pulsa «Comprar por WhatsApp» en el producto que te guste y te atendemos al momento.')}
<section class="wrap shop-section">
  <div class="toolbar">
    <div class="chips" role="group" aria-label="Filtrar por categoría">
      <button type="button" class="chip" data-cat="todos" aria-pressed="true">Todos</button>
      ${cats.map(c => `<button type="button" class="chip" data-cat="${c.slug}" aria-pressed="false">${c.name}</button>`).join('\n      ')}
    </div>
    <div class="tools">
      <span id="count" aria-live="polite">${products.length} productos</span>
      <label class="sr" for="sort" style="position:absolute;left:-9999px">Ordenar por</label>
      <select id="sort">
        <option value="relevancia">Orden predeterminado</option>
        <option value="precio-asc">Precio: de menor a mayor</option>
        <option value="precio-desc">Precio: de mayor a menor</option>
      </select>
    </div>
  </div>
  <div class="products wide" id="shop-grid">
    ${products.map(card).join('\n    ')}
    <p class="empty" id="empty" hidden>No hay productos que coincidan con tu búsqueda. <a href="tienda.html" style="text-decoration:underline">Ver todos</a> o <a href="${wa('Hola, busco una joya que no encuentro en la web.')}" target="_blank" rel="noopener" style="text-decoration:underline">pregúntanos por WhatsApp</a>.</p>
  </div>
</section>
${ctaWa('¿No encuentras lo que buscas? Escríbenos.')}
`);

/* ======================================================= COLECCIONES */
page('colecciones.html', {
  title: 'Colecciones',
  desc: `Colecciones de ${BRAND}: anillos, collares, pulseras y pendientes de acero inoxidable.`
}, `
${pageHead([['index.html', 'Inicio'], [null, 'Colecciones']], 'Colecciones', 'Cuatro colecciones de acero inoxidable para combinar a tu gusto.')}
<section class="wrap">
  <div class="cats">
    ${cats.map(c => `<a href="coleccion-${c.slug}.html"><div class="ph"><img src="${c.cover}" alt="" loading="lazy" width="500" height="500"></div><strong>${c.name}</strong><small>${products.filter(p => p.cat === c.slug).length} productos</small></a>`).join('\n    ')}
  </div>
</section>
${ctaWa('¿Buscas un regalo? Te ayudamos a elegir.', 'PEDIR AYUDA POR WHATSAPP', 'Hola, busco un regalo de joyería. ¿Me ayudáis a elegir?')}
`);

for (const c of cats) {
  const list = products.filter(p => p.cat === c.slug);
  const others = cats.filter(o => o.slug !== c.slug);
  page(`coleccion-${c.slug}.html`, {
    title: c.name,
    desc: c.intro,
    image: c.cover
  }, `
${pageHead([['index.html', 'Inicio'], ['colecciones.html', 'Colecciones'], [null, c.name]], c.name, c.intro)}
<section class="wrap shop-section">
  <div class="toolbar"><span>${list.length} productos</span><div class="chips">${others.map(o => `<a class="chip" href="coleccion-${o.slug}.html">${o.name}</a>`).join('')}</div></div>
  <div class="products wide">
    ${list.map(card).join('\n    ')}
  </div>
</section>
${ctaWa(`¿Dudas con tu talla o tu pedido de ${c.name.toLowerCase()}?`)}
`);
}

/* ======================================================= PRODUCTOS */
for (const p of products) {
  const related = products.filter(o => o.cat === p.cat && o.id !== p.id).slice(0, 4);
  const opt = p.option;
  const jsonld = {
    '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.summary,
    image: p.images.map(i => `${SITE}/img/productos/${i}`), category: p.catName, brand: { '@type': 'Brand', name: BRAND }
  };
  if (p.price != null) jsonld.offers = { '@type': 'Offer', priceCurrency: 'EUR', price: p.price.toFixed(2), availability: 'https://schema.org/InStock' };
  page(`producto-${p.slug}.html`, {
    title: p.name,
    desc: `${p.summary} ${p.price != null ? 'Ahora ' + eur(p.price) + '.' : ''} Compra por WhatsApp.`.trim(),
    image: p.img,
    extra: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n`
  }, `
<section class="wrap page-head" style="padding-bottom:0">
  ${crumbs([['index.html', 'Inicio'], ['tienda.html', 'Tienda'], [`coleccion-${p.cat}.html`, p.catName], [null, esc(p.name)]])}
</section>
<section class="wrap pdp">
  <div class="gallery">
    <div class="gallery-main"><img id="gallery-main" src="${p.img}" alt="${esc(p.name)}" width="1000" height="1000"></div>
    ${p.images.length > 1 ? `<div class="gallery-thumbs">${p.images.map((im, i) => `<button type="button" data-src="img/productos/${im}" aria-current="${i === 0}" aria-label="Ver imagen ${i + 1}"><img src="img/productos/${im}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}
  </div>
  <div class="info">
    <small class="cat">${p.catName.toUpperCase()}</small>
    <h1>${esc(p.name)}</h1>
    <div class="price">${p.price == null ? '<em>Consultar precio</em>' : `${p.oldPrice ? `<s>${eur(p.oldPrice)}</s>` : ''}<strong>${eur(p.price)}</strong>${p.off ? `<span class="off">-${p.off}%</span>` : ''}`}</div>
    <p class="tax">${p.price == null ? 'Escríbenos y te decimos el precio y la disponibilidad.' : 'Pago y envío se acuerdan por WhatsApp.'}</p>
    <p class="lead">${esc(p.summary)}</p>
    <div class="opts">
      ${opt ? `<label>${opt.label}<select id="opt" data-label="${opt.label}">${opt.values.map(v => `<option value="${v}">${v}</option>`).join('')}</select></label>` : ''}
      <label>Cantidad<input id="qty" type="number" min="1" max="20" value="1" inputmode="numeric"></label>
    </div>
    <div class="buy">
      <a class="btn btn-dark" id="buy" data-name="${esc(p.name)}" data-price="${p.price != null ? eur(p.price) : ''}" href="${wa(buyText(p))}" target="_blank" rel="noopener">${I.wa(18)}${p.price == null ? 'CONSULTAR POR WHATSAPP' : 'COMPRAR POR WHATSAPP'}</a>
      <a class="btn btn-line" href="mailto:${EMAIL}?subject=${encodeURIComponent('Consulta sobre: ' + p.name)}">${I.mail(18)}PREGUNTAR POR EMAIL</a>
    </div>
    <ul class="perks">
      <li>${I.check}<span>Pides por WhatsApp y te respondemos con disponibilidad y forma de pago.</span></li>
      <li>${I.check}<span>Joya de acero inoxidable, pensada para el uso diario.</span></li>
      <li>${I.check}<span>¿Dudas con la talla o el largo? Te asesoramos antes de comprar.</span></li>
    </ul>
  </div>
</section>
<section class="wrap desc">
  <div>
    <h2><span>•</span> Descripción</h2>
    <p>${esc(p.summary)}</p>
    ${(p.long || []).map(t => `<p>${esc(t)}</p>`).join('')}
  </div>
  <div>
    <h2><span>•</span> Características</h2>
    <ul>
      <li>Material: acero inoxidable</li>
      <li>Categoría: <a href="coleccion-${p.cat}.html" style="text-decoration:underline">${p.catName}</a></li>
      ${p.details.map(d => `<li>${esc(d)}</li>`).join('\n      ')}
    </ul>
  </div>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> También te puede gustar</h2>
  <div class="products" style="padding-top:26px">
    ${related.map(card).join('\n    ')}
  </div>
</section>
`);
}

/* ======================================================= SOBRE NOSOTROS */
page('sobre-nosotros.html', {
  title: 'Sobre nosotros',
  desc: `${BRAND} es una tienda online de joyas de acero inoxidable en España: joyas únicas y modernas a precios honestos.`,
  image: 'img/promo.jpg'
}, `
${pageHead([['index.html', 'Inicio'], [null, 'Sobre nosotros']], 'Sobre nosotros', 'Joyas únicas y modernas, hechas para llevarse todos los días.')}
<section class="wrap split">
  <img src="img/promo.jpg" alt="Aro dorado con bolitas de acero inoxidable" loading="lazy" width="1024" height="1024">
  <div class="prose">
    <h2>Quiénes somos</h2>
    <p>${BRAND} es una tienda online de joyería de acero inoxidable con base en Madrid, España. Seleccionamos anillos, collares, pulseras y pendientes con un diseño actual, para que lleves joyas con estilo sin pagar de más.</p>
    <p>Trabajamos con acero inoxidable porque combina lo mejor de dos mundos: el aspecto de una joya y la resistencia que necesitas para llevarla a diario, sin miedo al agua, al sol o al paso del tiempo.</p>
    <h2>Cómo trabajamos</h2>
    <p>Aquí no hay carritos complicados: eliges tu pieza, pulsas <strong>«Comprar por WhatsApp»</strong> y hablas directamente con nosotros. Te confirmamos disponibilidad, talla y forma de pago, y acordamos el envío contigo.</p>
    <a class="btn btn-dark" href="tienda.html">VER LA TIENDA</a>
  </div>
</section>
<section class="wrap">
  <div class="values">
    <div class="value"><h3>Acero inoxidable</h3><p>Piezas pensadas para el uso diario, fáciles de limpiar y de mantener. Consulta nuestra <a href="cuidado-del-acero.html" style="text-decoration:underline">guía de cuidado</a>.</p></div>
    <div class="value"><h3>Precio honesto</h3><p>Joyas con estilo a precios accesibles, con descuentos de hasta el 45 % en muchas piezas.</p></div>
    <div class="value"><h3>Trato directo</h3><p>Compras hablando con una persona, no con un formulario. Te asesoramos con la talla, el largo y el regalo ideal.</p></div>
  </div>
</section>
${ctaWa('¿Hablamos? Estamos a un mensaje de distancia.')}
`);

/* ======================================================= CUIDADO DEL ACERO */
page('cuidado-del-acero.html', {
  title: 'Cuidado del acero',
  desc: 'Cómo limpiar y conservar tus joyas de acero inoxidable: consejos prácticos para que brillen como el primer día.'
}, `
${pageHead([['index.html', 'Inicio'], [null, 'Cuidado del acero']], 'Cuidado del acero', 'El acero inoxidable es resistente, pero un poco de cuidado hace que tus joyas brillen más tiempo.')}
<section class="wrap">
  <div class="steps">
    <div class="step"><b>01</b><h3>Límpialas con jabón suave</h3><p>Agua tibia y unas gotas de jabón neutro. Frota con suavidad con un paño o un cepillo de dientes blando.</p></div>
    <div class="step"><b>02</b><h3>Enjuaga y seca bien</h3><p>Aclara con agua limpia y seca con un paño suave que no suelte pelusa para evitar marcas de agua.</p></div>
    <div class="step"><b>03</b><h3>Pule el brillo</h3><p>Un paño de microfibra devuelve el brillo al acero. Hazlo con movimientos suaves y sin apretar.</p></div>
    <div class="step"><b>04</b><h3>Guárdalas por separado</h3><p>Ponlas en una bolsita o caja, cada pieza aparte, para evitar rozaduras entre ellas.</p></div>
  </div>
</section>
<section class="wrap block">
  <div class="prose">
    <h2>Consejos para el día a día</h2>
    <ul>
      <li>Evita el contacto prolongado con lejía y productos de limpieza fuertes.</li>
      <li>Quítatelas para el gimnasio, para trabajos manuales y antes de aplicar cremas o perfumes.</li>
      <li>No uses estropajos ni productos abrasivos: pueden rayar la superficie.</li>
      <li>Si una pieza tiene baño dorado, límpiala con especial suavidad.</li>
    </ul>
  </div>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> Preguntas frecuentes</h2>
  ${faqHtml([
    ['¿El acero inoxidable se oxida?', 'El acero inoxidable resiste muy bien la humedad y no se oxida con facilidad en el uso normal. Aun así, conviene secarlo bien y evitar productos químicos agresivos.'],
    ['¿Puedo ducharme o ir a la playa con mis joyas?', 'El acero soporta bien el agua, pero el cloro, la sal y los jabones pueden apagar el brillo con el tiempo. Lo mejor es quitártelas y aclararlas si han estado en contacto con ellos.'],
    ['¿Cómo elijo mi talla de anillo?', 'Mide el contorno de tu dedo con un hilo o una tira de papel y escríbenos por WhatsApp: te ayudamos a elegir la talla correcta antes de comprar.'],
    ['¿Y el largo de las cadenas?', 'Las cadenas de 50 cm suelen quedar a la altura de la clavícula; 60 cm y 70 cm caen más abajo sobre el pecho. Si dudas, pregúntanos.'],
    ['¿Qué hago si mi joya pierde brillo?', 'Límpiala con agua tibia y jabón suave y pule con un paño de microfibra. Si no mejora, escríbenos y lo revisamos.']
  ])}
</section>
${ctaWa('¿Tienes otra duda sobre tu joya?')}
`);

/* ======================================================= CONTACTO */
page('contacto.html', {
  title: 'Contacto',
  desc: `Contacta con ${BRAND}: WhatsApp ${WA_PRETTY}, email ${EMAIL} y Facebook @elanill0.`
}, `
${pageHead([['index.html', 'Inicio'], [null, 'Contacto']], 'Contacto', 'Escríbenos por WhatsApp para comprar o resolver cualquier duda. Te respondemos lo antes posible.')}
<section class="wrap">
  <div class="contact-grid">
    <div class="ccard">${I.wa(30)}<h3>WhatsApp</h3><p>La forma más rápida de comprar y de resolver dudas.</p><a href="${wa('Hola, quisiera información sobre vuestras joyas.')}" target="_blank" rel="noopener"><strong>${WA_PRETTY}</strong></a></div>
    <div class="ccard">${I.mail(30)}<h3>Email</h3><p>Para consultas más largas o con imágenes.</p><a href="mailto:${EMAIL}"><strong>${EMAIL}</strong></a></div>
    <div class="ccard">${I.fb(30)}<h3>Facebook</h3><p>Síguenos para ver novedades y ofertas.</p><a href="${FB}" target="_blank" rel="noopener"><strong>@elanill0</strong></a></div>
    <div class="ccard">${I.pin(30)}<h3>Ubicación</h3><p>Tienda online con base en Madrid, España. Atendemos y enviamos a toda España.</p><a href="https://www.google.com/maps/search/?api=1&query=Gran+Via+Madrid" target="_blank" rel="noopener"><strong>Madrid, España</strong></a></div>
  </div>
</section>
<section class="wrap cform">
  <div>
    <h2>Envíanos un mensaje</h2>
    <p class="sub">Rellena el formulario y elige cómo enviarlo: se abrirá WhatsApp o tu programa de correo con el mensaje ya escrito.</p>
  </div>
  <form id="contact-form" class="fields" novalidate onsubmit="return false">
    <label>Nombre<input name="nombre" type="text" required autocomplete="name"></label>
    <label>Motivo<select name="motivo"><option>Quiero comprar</option><option>Duda sobre una talla</option><option>Estado de mi pedido</option><option>Cambio o devolución</option><option>Otro</option></select></label>
    <label>Mensaje<textarea name="mensaje" required></textarea></label>
    <div class="row">
      <button type="button" class="btn btn-dark" id="send-wa">${I.wa(16)}ENVIAR POR WHATSAPP</button>
      <button type="button" class="btn btn-line" id="send-mail">${I.mail(16)}ENVIAR POR EMAIL</button>
    </div>
  </form>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> Preguntas frecuentes</h2>
  ${faqHtml([
    ['¿Cómo compro?', 'Elige tu producto en la tienda y pulsa «Comprar por WhatsApp». Se abrirá una conversación con nosotros con el producto ya indicado: te confirmamos disponibilidad, forma de pago y envío.'],
    ['¿Recibiré el mismo producto que veo en la foto?', 'Sí. Las fotos corresponden al producto que vendemos. Si tienes cualquier duda sobre medidas o acabado, pregúntanos antes de comprar.'],
    ['¿Hacéis envíos?', 'Sí, acordamos el envío contigo por WhatsApp. Consulta los detalles en <a href="envios-y-devoluciones.html" style="text-decoration:underline">Envíos y devoluciones</a>.'],
    ['¿Puedo cambiar o devolver mi pedido?', 'Sí, dentro de los plazos legales. Lo explicamos en <a href="envios-y-devoluciones.html" style="text-decoration:underline">Envíos y devoluciones</a>.']
  ])}
</section>
`);

/* ======================================================= LEGALES */
const legal = (file, title, desc, html) => page(file, { title, desc }, `
${pageHead([['index.html', 'Inicio'], [null, title]], title, `Última actualización: 7 de octubre de 2026.`)}
<section class="wrap block" style="padding-top:34px"><div class="prose">${html}</div></section>
`);

legal('envios-y-devoluciones.html', 'Envíos y devoluciones', 'Información sobre envíos, plazos, cambios y devoluciones en Elanill0.', `
<h2>Cómo se hace un pedido</h2>
<p>Los pedidos se realizan por WhatsApp (<a href="${wa('Hola, quiero hacer un pedido.')}" target="_blank" rel="noopener">${WA_PRETTY}</a>) o por email (<a href="mailto:${EMAIL}">${EMAIL}</a>). Te confirmamos la disponibilidad, el precio final, la forma de pago y los gastos de envío antes de cerrar la compra.</p>
<h2>Envíos</h2>
<p>Enviamos a toda España. El plazo y el coste del envío se acuerdan contigo al confirmar el pedido, en función de tu dirección y del método elegido.</p>
<h2>Cambios y devoluciones</h2>
<p>Dispones de <strong>14 días naturales</strong> desde la recepción del pedido para ejercer tu derecho de desistimiento, sin necesidad de justificación, tal y como establece la normativa de consumidores. El producto debe estar sin usar y en su estado original.</p>
<p>Para iniciar un cambio o una devolución escríbenos por WhatsApp o email indicando tu nombre y el producto. Te explicaremos cómo devolverlo.</p>
<h2>Producto defectuoso o error en el pedido</h2>
<p>Si recibes un producto dañado o distinto al pedido, avísanos cuanto antes con una foto y lo solucionamos.</p>
`);

legal('privacidad.html', 'Política de privacidad', 'Cómo trata Elanill0 tus datos personales.', `
<h2>Responsable del tratamiento</h2>
<p>${BRAND} — Madrid, España. Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Qué datos tratamos y para qué</h2>
<p>Solo tratamos los datos que nos facilitas voluntariamente cuando nos escribes por WhatsApp o por email (por ejemplo, tu nombre, teléfono, dirección de envío y los productos que quieres comprar). Los usamos para atender tu consulta, gestionar tu pedido y el envío, y cumplir nuestras obligaciones legales.</p>
<h2>Base legal y conservación</h2>
<p>La base legal es la ejecución de tu pedido o consulta y, en su caso, tu consentimiento. Conservamos los datos el tiempo necesario para atenderte y durante los plazos que exija la ley.</p>
<h2>Destinatarios</h2>
<p>No cedemos tus datos a terceros salvo obligación legal o cuando sea necesario para completar el envío (empresa de transporte). Ten en cuenta que WhatsApp y el correo electrónico son servicios de terceros con sus propias políticas de privacidad.</p>
<h2>Tus derechos</h2>
<p>Puedes acceder, rectificar y suprimir tus datos, así como oponerte a su tratamiento, limitarlo o solicitar su portabilidad, escribiendo a <a href="mailto:${EMAIL}">${EMAIL}</a>. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>
`);

legal('terminos.html', 'Términos y condiciones', 'Condiciones de uso del sitio web y de compra en Elanill0.', `
<h2>Titular</h2>
<p>Este sitio web pertenece a ${BRAND}, tienda online de joyas de acero inoxidable con base en Madrid, España. Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Uso del sitio</h2>
<p>El sitio tiene carácter informativo y de catálogo. Al navegar aceptas usarlo de forma lícita y respetuosa. Los contenidos (textos, imágenes y marca) pertenecen a ${BRAND} y no pueden reproducirse sin permiso.</p>
<h2>Compras</h2>
<p>Las compras se gestionan por WhatsApp o email. Los precios mostrados son orientativos y pueden cambiar; el precio válido es el que te confirmemos al cerrar el pedido. Los productos están sujetos a disponibilidad.</p>
<h2>Descripción de los productos</h2>
<p>Procuramos que las imágenes y descripciones sean lo más fieles posible. Pueden existir pequeñas diferencias de color por la pantalla o la iluminación.</p>
<h2>Cambios y devoluciones</h2>
<p>Consulta la página de <a href="envios-y-devoluciones.html">Envíos y devoluciones</a>.</p>
<h2>Legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española.</p>
`);

legal('cookies.html', 'Política de cookies', 'Información sobre el uso de cookies en el sitio web de Elanill0.', `
<h2>¿Qué son las cookies?</h2>
<p>Son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita.</p>
<h2>Qué cookies usamos</h2>
<p>Este sitio <strong>no utiliza cookies propias ni de seguimiento publicitario</strong>. Las tipografías se cargan desde Google Fonts, un servicio externo que puede registrar tu dirección IP al servirlas. Los enlaces a WhatsApp y Facebook te llevan a servicios de terceros con sus propias políticas.</p>
<h2>Cómo gestionar las cookies</h2>
<p>Puedes borrar o bloquear las cookies desde la configuración de tu navegador en cualquier momento.</p>
<h2>Contacto</h2>
<p>Si tienes preguntas, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
`);

/* ======================================================= 404 */
fs.writeFileSync(path.join(OUT, '404.html'), head({ title: 'Página no encontrada', desc: 'La página que buscas no existe.', file: '404.html' }) + header('404.html') + `
<section class="wrap nf">
  <b>404</b>
  <h1>Página no encontrada</h1>
  <p>La página que buscas no existe o ha cambiado de sitio.</p>
  <a class="btn btn-dark" href="index.html">VOLVER AL INICIO</a> <a class="btn btn-line" href="tienda.html">VER LA TIENDA</a>
</section>
` + footer());

const count = fs.readdirSync(OUT).filter(f => f.endsWith('.html')).length;
console.log(`OK · ${count} páginas HTML · ${products.length} productos`);
