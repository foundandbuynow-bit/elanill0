/* Genera todo el sitio estático en site/ a partir de data/*.json y scripts/guides.js
   Uso:  node scripts/build.js                                                          */
const fs = require('fs');
const path = require('path');
const guides = require('./guides.js');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'site');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const cats = read('categories.json').categories.map(c => ({ ...c, cover: '/' + c.cover.replace(/^\//, '') }));
const rawProducts = read('products.json').products;

/* ---------- Marca y constantes ---------- */
const BRAND = 'Elanill0';
const SITE = 'https://elanill0.com';
const WA = '34605505120';
const WA_PRETTY = '+34 605 505 120';
const EMAIL = 'elanillospain@gmail.com';
const FB = 'https://www.facebook.com/elanill0';
const TODAY = new Date().toISOString().slice(0, 10);
const MAX_OFF = 45;

const wa = t => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const eur = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const plain = n => String(n).replace('.', ',') + ' €';
const abs = p => SITE + p;
const fullTitle = t => (t.length + 11 <= 60 ? `${t} | ${BRAND}` : t);

const catBy = Object.fromEntries(cats.map(c => [c.slug, c]));
const products = rawProducts.map((p, i) => ({
  ...p,
  pos: i,
  catName: catBy[p.cat].name,
  url: `/producto/${p.slug}/`,
  img: '/img/productos/' + p.images[0],
  off: p.price && p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
}));
const minPrice = list => Math.min(...list.filter(p => p.price != null).map(p => p.price));
const inCat = slug => products.filter(p => p.cat === slug);
const bySlug = Object.fromEntries(products.map(p => [p.slug, p]));

/* ---------- Iconos ---------- */
const I = {
  search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  wa: (s = 20) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.200 8.200 0 0 1-4.200-1.200l-.3-.2-3 .8.8-2.900-.2-.3A8.200 8.200 0 1 1 12 20.200Zm4.500-6.100c-.2-.1-1.500-.7-1.700-.8-.2-.1-.4-.1-.6.100l-.8 1c-.1.200-.3.200-.5.100a6.700 6.700 0 0 1-3.300-2.900c-.2-.4.200-.4.700-1.300.1-.2 0-.3 0-.4l-.8-1.800c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.300 3 3 0 0 0-.9 2.200c0 1.300.9 2.500 1 2.700.1.200 1.800 2.800 4.400 3.900 1.600.7 2.300.7 3.100.6.500-.1 1.500-.6 1.700-1.200.2-.6.2-1.100.2-1.200-.1-.1-.3-.2-.5-.3Z"/></svg>`,
  fb: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="currentColor" aria-hidden="true"><path d="M14 8V6.500c0-.7.3-1 1-1h2V2h-3c-3 0-4.500 1.800-4.500 4.500V8H7v3.500h2.500V22H14V11.500h2.800L17.200 8H14Z"/></svg>`,
  mail: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>`,
  pin: (s = 22) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M12 21s-7-6.200-7-11.500a7 7 0 0 1 14 0C19 14.800 12 21 12 21Z"/><circle cx="12" cy="9.500" r="2.500"/></svg>`,
  check: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m4 12.500 5 5L20 6.500"/></svg>'
};

/* ---------- Datos estructurados ---------- */
const ORG_ID = SITE + '/#organization';
const SITE_ID = SITE + '/#website';
const ORG = {
  '@type': ['Organization', 'OnlineStore'],
  '@id': ORG_ID,
  name: BRAND,
  alternateName: ['El Anillo', 'elanillo.es'],
  url: SITE + '/',
  logo: { '@type': 'ImageObject', url: abs('/img/marca/logo.webp'), width: 360, height: 360 },
  image: abs('/img/og-elanill0.jpg'),
  description: 'Tienda online de joyas de acero inoxidable en España: anillos, collares, pulseras y pendientes para hombre y mujer.',
  email: EMAIL,
  telephone: '+' + WA,
  address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' },
  areaServed: { '@type': 'Country', name: 'España' },
  sameAs: [FB],
  contactPoint: [{ '@type': 'ContactPoint', contactType: 'customer service', telephone: '+' + WA, email: EMAIL, availableLanguage: 'es', areaServed: 'ES' }],
  priceRange: '€'
};
const WEBSITE = {
  '@type': 'WebSite', '@id': SITE_ID, url: SITE + '/', name: BRAND, inLanguage: 'es-ES', publisher: { '@id': ORG_ID },
  potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: SITE + '/tienda/?q={search_term_string}' }, 'query-input': 'required name=search_term_string' }
};
const breadcrumbLd = items => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([p, label], i) => ({ '@type': 'ListItem', position: i + 1, name: strip(label), ...(p ? { item: abs(p) } : {}) }))
});
const faqLd = faq => ({
  '@type': 'FAQPage',
  mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } }))
});
const itemListLd = list => ({
  '@type': 'ItemList', numberOfItems: list.length,
  itemListElement: list.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: abs(p.url), name: p.name }))
});

/* ---------- Escritura de páginas ---------- */
const pages = []; // para sitemap
function writeFile(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

function head(m) {
  const title = m.fullTitle || fullTitle(m.title);
  const canonical = abs(m.path);
  const ogImg = abs(m.og || '/img/og-elanill0.jpg');
  const graph = [ORG, WEBSITE, ...(m.ld || [])];
  const robots = m.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';
  const og = m.ogType || 'website';
  return `<!doctype html>
<html lang="es-ES">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(m.desc)}">
<meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="es-ES" href="${canonical}">
<link rel="alternate" hreflang="x-default" href="${canonical}">
<meta name="theme-color" content="#D8A697">
<meta property="og:locale" content="es_ES">
<meta property="og:site_name" content="${BRAND}">
<meta property="og:type" content="${og}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(m.desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(m.ogAlt || 'Joyas de acero inoxidable Elanill0')}">
${m.productMeta || ''}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(m.desc)}">
<meta name="twitter:image" content="${ogImg}">
<link rel="icon" type="image/png" sizes="32x32" href="/img/marca/favicon-32.png">
<link rel="apple-touch-icon" href="/img/marca/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/jost-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/playfair-display-latin.woff2" as="font" type="font/woff2" crossorigin>
${m.preload ? `<link rel="preload" as="image" href="${m.preload}" fetchpriority="high">\n` : ''}<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head>
<body>
<a class="skip" href="#contenido">Saltar al contenido</a>
`;
}

const NAV = [
  ['/categoria-producto/anillos/', 'Anillos'],
  ['/categoria-producto/collares/', 'Collares'],
  ['/categoria-producto/pulseras/', 'Pulseras'],
  ['/categoria-producto/pendientes/', 'Pendientes'],
  ['/tienda/', 'Tienda'],
  ['/guias/', 'Guías'],
  ['/sobre-nosotros/', 'Sobre nosotros'],
  ['/contacto/', 'Contacto']
];

function header(m) {
  const cur = m.path;
  const prodCat = m.path.startsWith('/producto/') ? `/categoria-producto/${bySlug[m.path.split('/')[2]]?.cat}/` : null;
  const nav = NAV.map(([href, label]) => {
    const on = href === cur || href === prodCat || (href === '/guias/' && cur.startsWith('/guias/'));
    return `<a href="${href}"${on ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
  const hello = wa('Hola, quisiera información sobre vuestras joyas.');
  return `<header class="site-header">
  <div class="wrap">
    <div class="topbar">
      <div class="top-left">
        <form class="search" action="/tienda/" method="get" role="search">
          <button type="submit" aria-label="Buscar">${I.search}</button>
          <label><small>BUSCAR</small><input type="search" name="q" placeholder="Busco..." aria-label="Buscar productos"></label>
        </form>
        <a class="top-wa" href="${hello}" target="_blank" rel="noopener">
          ${I.wa(22)}
          <span><small>WHATSAPP</small>${WA_PRETTY}</span>
        </a>
      </div>
      <a class="brand" href="/" aria-label="${BRAND}, joyas de acero inoxidable, inicio"><img src="/img/marca/logo.webp" width="84" height="84" alt="${BRAND} · Joyas únicas y modernas de acero inoxidable"></a>
      <div class="top-right">
        <a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook de ${BRAND}">${I.fb(24)}</a>
        <a href="${hello}" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">${I.wa(24)}</a>
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
  const hello = wa('Hola, quisiera información sobre vuestras joyas.');
  return `</main>
<footer>
  <div class="wrap">
    <div class="foot-box">
      <div class="foot-cols">
        <div class="f-brand">
          <a href="/" aria-label="${BRAND}, inicio"><img src="/img/marca/logo.webp" width="92" height="92" alt="${BRAND}" loading="lazy"></a>
          <p>${BRAND} es una tienda online de joyas de acero inoxidable: anillos, collares, pulseras y pendientes para hombre y mujer, pensados para el día a día. Compra por WhatsApp.</p>
        </div>
        <div class="f-contact">
          <h2>Contacto</h2>
          <a href="mailto:${EMAIL}">${I.mail(14)} ${EMAIL}</a>
          <a href="${hello}" target="_blank" rel="noopener">${I.wa(14)} ${WA_PRETTY}</a>
          <a href="/contacto/">${I.pin(14)} Madrid, España</a>
          <div class="social"><a href="${FB}" target="_blank" rel="noopener" aria-label="Facebook">${I.fb(14)}</a></div>
        </div>
        <div class="f-col"><h2>Tienda</h2>
          <a href="/categoria-producto/anillos/">Anillos</a><a href="/categoria-producto/collares/">Collares y cadenas</a><a href="/categoria-producto/pulseras/">Pulseras y brazaletes</a><a href="/categoria-producto/pendientes/">Pendientes y aros</a><a href="/tienda/">Todos los productos</a></div>
        <div class="f-col"><h2>Guías</h2>
          <a href="/guias/talla-de-anillo/">Talla de anillo</a><a href="/guias/largo-de-cadena/">Largo de cadena</a><a href="/guias/cuidado-del-acero/">Cuidado del acero</a><a href="/guias/regalos-de-joyas/">Regalos de joyas</a><a href="/sobre-nosotros/">Sobre nosotros</a></div>
        <div class="f-col"><h2>Legal</h2>
          <a href="/envios-y-devoluciones/">Envíos y devoluciones</a><a href="/politica-de-privacidad/">Privacidad</a><a href="/terminos-y-condiciones/">Términos</a><a href="/politica-de-cookies/">Cookies</a></div>
      </div>
      <p class="copy">© ${new Date().getFullYear()} ${BRAND}. Todos los derechos reservados.</p>
    </div>
  </div>
</footer>
<script src="/assets/app.js" defer></script>
</body>
</html>
`;
}

function page(m, body) {
  const rel = m.path === '/' ? 'index.html' : m.path.replace(/^\//, '') + 'index.html';
  writeFile(rel, head(m) + header(m) + body + footer());
  if (!m.noindex) pages.push({ path: m.path, images: m.sitemapImages || [], priority: m.priority || '0.6', changefreq: m.changefreq || 'monthly' });
  m.__written = rel;
  allMeta.push({ ...m, __rel: rel });
}
const allMeta = [];

/* ---------- Componentes ---------- */
const priceHtml = p => p.price == null
  ? '<span class="price"><em>Consultar precio</em></span>'
  : `<span class="price">${p.oldPrice ? `<s>${eur(p.oldPrice)}</s>` : ''}<strong>${eur(p.price)}</strong></span>`;

const buyText = p => p.price == null
  ? `Hola, quiero saber el precio y la disponibilidad de: ${p.name}`
  : `Hola, quiero comprar: ${p.name} - ${eur(p.price)}`;

const SYN = { anillos: 'anillo sortija sello alianza', collares: 'collar cadena cadenas colgante', pulseras: 'pulsera brazalete esclava', pendientes: 'pendiente aro aros arete aretes' };
function card(p, { lazy = true } = {}) {
  return `<article class="product" data-cat="${p.cat}" data-price="${p.price ?? ''}" data-name="${esc(p.name)}" data-search="${esc([p.name, p.summary, p.catName, SYN[p.cat], 'acero inoxidable'].join(' '))}" data-pos="${p.pos}">
        <a class="thumb" href="${p.url}">
          <img src="${p.img}" alt="${esc(p.alts[0])}" ${lazy ? 'loading="lazy" ' : ''}width="500" height="520">${p.off ? `<span class="badge">-${p.off}%</span>` : ''}
        </a>
        <small class="cat">${p.catName.toUpperCase()}</small>
        <h3 class="name"><a href="${p.url}">${esc(p.name)}</a></h3>
        ${priceHtml(p)}
        <a class="btn-wa" href="${wa(buyText(p))}" target="_blank" rel="noopener">${I.wa(14)}${p.price == null ? 'CONSULTAR POR WHATSAPP' : 'COMPRAR POR WHATSAPP'}</a>
      </article>`;
}

const crumbsHtml = items => `<nav class="crumbs" aria-label="Migas de pan">${items.map(([h, l], i) => (h ? `<a href="${h}">${l}</a>` : `<span class="here" aria-current="page">${l}</span>`) + (i < items.length - 1 ? '<span class="sep">/</span>' : '')).join('')}</nav>`;
const pageHead = (cr, h1, lead) => `<section class="wrap page-head">
  ${crumbsHtml(cr)}
  <h1>${h1}</h1>
  ${lead ? `<p>${lead}</p>` : ''}
  <div class="bar"></div>
</section>
`;
const faqHtml = items => `<div class="faq">${items.map(([q, a]) => `<details><summary><h3>${q}</h3></summary><p>${a}</p></details>`).join('')}</div>`;
const ctaWa = (title, text = 'ESCRIBIR POR WHATSAPP', msg = 'Hola, quisiera información sobre vuestras joyas.') => `<section class="wrap">
  <div class="cta">
    <h2>${title}</h2>
    <a class="btn btn-light" href="${wa(msg)}" target="_blank" rel="noopener">${I.wa(16)}${text}</a>
  </div>
</section>
`;
const webPage = (m, type = 'WebPage', extra = {}) => ({
  '@type': type, '@id': abs(m.path) + '#webpage', url: abs(m.path), name: m.fullTitle || fullTitle(m.title), description: m.desc,
  isPartOf: { '@id': SITE_ID }, about: { '@id': ORG_ID }, inLanguage: 'es-ES', ...extra
});

/* ======================================================= INICIO */
const best = [29101, 29156, 29132, 29160].map(id => products.find(p => p.id === id));
const latest = products.slice(0, 4);
const homeFaq = [
  ['¿Dónde comprar joyas de acero inoxidable online en España?', `En ${BRAND} puedes comprar anillos, collares, pulseras y pendientes de acero inoxidable para hombre y mujer, con descuentos de hasta el ${MAX_OFF} %. Eliges la pieza, pulsas «Comprar por WhatsApp» y te atendemos directamente.`],
  ['¿Las joyas de acero inoxidable se oxidan?', 'El acero inoxidable resiste la humedad y el uso diario sin oxidarse con facilidad. Para que mantenga su brillo, límpialo con agua tibia y jabón suave y guárdalo por separado. En las piezas de acabado dorado, el color puede desgastarse con el roce y el tiempo.'],
  ['¿Cómo compro en Elanill0?', 'Es muy fácil: elige tu producto, pulsa «Comprar por WhatsApp» y se abrirá una conversación con el producto, la talla y el precio ya escritos. Te confirmamos disponibilidad, forma de pago y envío.'],
  ['¿Son joyas para hombre o para mujer?', 'Casi todas nuestras piezas son unisex. El anillo de sello y la cadena cubana son muy populares entre los hombres, y los aros, los collares de cuerda y los brazaletes los eligen sobre todo ellas, pero cada uno elige su estilo.'],
  ['¿Qué diferencia hay entre acero inoxidable y acero quirúrgico?', 'En joyería, «acero quirúrgico» suele ser acero inoxidable de grado 316L: es un nombre comercial más que una norma oficial. Lo explicamos en nuestra <a href="/guias/acero-inoxidable-o-acero-quirurgico/">guía de acero inoxidable y acero quirúrgico</a>.']
];
{
  const m = {
    path: '/', title: 'Joyas de acero inoxidable online', fullTitle: `Joyas de acero inoxidable online | ${BRAND}`,
    desc: `Joyas de acero inoxidable online: anillos, collares, pulseras y pendientes para hombre y mujer con hasta un ${MAX_OFF} % de descuento. Compra por WhatsApp.`,
    og: '/img/og-elanill0.jpg', preload: '/img/joyas-acero-inoxidable-mujer-aros.webp', priority: '1.0', changefreq: 'weekly',
    sitemapImages: ['/img/joyas-acero-inoxidable-mujer-aros.webp']
  };
  m.ld = [webPage(m, 'WebPage'), faqLd(homeFaq)];
  page(m, `
<section class="wrap hero">
  <div class="hero-photo"><img src="/img/joyas-acero-inoxidable-mujer-aros.webp" alt="Mujer con pendientes de aro de acero inoxidable dorados" width="1024" height="352" fetchpriority="high"></div>
  <div class="hero-panel">
    <h1>JOYAS DE ACERO <br>INOXIDABLE PARA <br>TODOS LOS DÍAS</h1>
    <p>Anillos, collares, pulseras y pendientes de acero inoxidable con hasta un ${MAX_OFF} % de descuento. Elige tu pieza y pídela por WhatsApp.</p>
    <a class="btn btn-light" href="/tienda/">VER LA TIENDA</a>
  </div>
</section>

<section class="wrap block">
  <div class="label-row"><h2 class="label"><span>•</span> Joyas de acero inoxidable más vendidas</h2><a href="/tienda/">VER TODO</a></div>
  <div class="inset">
    <div class="products">
      ${best.map(p => card(p)).join('\n      ')}
    </div>
    <div class="center" style="margin-top:46px"><a class="btn btn-outline" href="/tienda/">VER TODOS LOS PRODUCTOS</a></div>
  </div>
</section>

<section class="wrap promo">
  <div class="promo-card">
    <p>Hasta un ${MAX_OFF} % de <br>descuento en toda <br>la tienda</p>
    <a class="btn btn-light" href="/tienda/?orden=precio-asc">VER OFERTAS</a>
  </div>
  <a class="promo-photo" href="/categoria-producto/pendientes/" aria-label="Ver pendientes y aros de acero inoxidable">
    <img src="/img/pendientes-aro-dorado-acero-inoxidable.webp" alt="Aro dorado con bolitas de acero inoxidable en la oreja" loading="lazy" width="1000" height="1000">
    <div class="promo-text">
      <p class="label"><span>•</span> Colección pendientes</p>
      <p class="promo-title">Aros <br>de acero</p>
    </div>
  </a>
</section>

<section class="wrap block">
  <div class="label-row"><h2 class="label"><span>•</span> Novedades en joyería de acero</h2><a href="/tienda/">VER TODO</a></div>
  <div class="inset">
    <div class="products">
      ${latest.map(p => card(p)).join('\n      ')}
    </div>
  </div>
</section>

<section class="wrap block">
  <h2 class="label"><span>•</span> Colecciones de joyas de acero inoxidable</h2>
  <div class="cats">
    ${cats.map(c => `<a href="/categoria-producto/${c.slug}/"><div class="ph"><img src="${c.cover}" alt="${esc(c.alt)}" loading="lazy" width="500" height="500"></div><strong>${esc(c.title)}</strong><small>${inCat(c.slug).length} productos</small></a>`).join('\n    ')}
  </div>
  <div class="browse"><a href="/colecciones/">VER TODAS LAS COLECCIONES</a></div>
</section>

<section class="wrap block">
  <div class="seo-text prose">
    <h2>Joyas de acero inoxidable online: anillos, collares, pulseras y pendientes</h2>
    <p>En ${BRAND} encontrarás <strong>joyas de acero inoxidable para hombre y mujer</strong> a precios muy ajustados: <a href="/categoria-producto/anillos/">anillos</a> de sello, lisos y vintage, <a href="/categoria-producto/collares/">collares y cadenas</a> de eslabones cubanos y cuerda trenzada, <a href="/categoria-producto/pulseras/">pulseras y brazaletes</a> y <a href="/categoria-producto/pendientes/">pendientes de aro</a>. Todas las piezas tienen descuentos de hasta el ${MAX_OFF} % y las pides directamente por WhatsApp.</p>
    <h3>¿Por qué elegir joyas de acero inoxidable?</h3>
    <p>El acero inoxidable resiste el uso diario, el agua y la humedad sin oxidarse con facilidad, y conserva su brillo con un cuidado sencillo. Es una alternativa mucho más económica que el oro o la plata para llevar joyas todos los días. Si tienes dudas, lee la <a href="/guias/acero-inoxidable-o-acero-quirurgico/">diferencia entre acero inoxidable y acero quirúrgico</a>.</p>
    <h3>Tienda de joyería online con base en Madrid</h3>
    <p>Atendemos desde Madrid y nos ocupamos de que tu pedido llegue bien. ¿No sabes qué elegir? Consulta nuestras guías para <a href="/guias/talla-de-anillo/">medir tu talla de anillo</a>, <a href="/guias/largo-de-cadena/">elegir el largo de una cadena</a> o <a href="/guias/regalos-de-joyas/">encontrar el regalo perfecto</a>, o escríbenos por WhatsApp.</p>
  </div>
</section>

<section class="wrap block">
  <h2 class="label"><span>•</span> Preguntas frecuentes sobre joyas de acero inoxidable</h2>
  ${faqHtml(homeFaq)}
</section>

<section class="wrap banner">
  <div class="banner-copy">
    <p class="h2like">PARA ÉL <br>Y PARA ELLA</p>
    <a class="btn btn-ghost" href="/categoria-producto/anillos/">VER ANILLOS</a>
  </div>
  <img src="/img/anillo-sello-hombre-acero-inoxidable-cadena.webp" alt="Hombre con anillo de sello de acero inoxidable y cadena al cuello" loading="lazy" width="1122" height="1402">
</section>

<section class="wrap news">
  <h2>NO TE PIERDAS <br>NINGUNA NOVEDAD</h2>
  <form action="mailto:${EMAIL}?subject=${encodeURIComponent('Quiero recibir novedades de ' + BRAND)}" method="post" enctype="text/plain">
    <input type="email" name="Correo para novedades" placeholder="Correo electrónico" aria-label="Correo electrónico" required>
    <button type="submit">Suscribirme <span aria-hidden="true">→</span></button>
  </form>
  <p>Se abrirá tu programa de correo para enviarnos tu solicitud. También puedes <a href="${wa('Hola, quiero recibir novedades de ' + BRAND)}" target="_blank" rel="noopener" style="text-decoration:underline">escribirnos por WhatsApp</a>.</p>
</section>
`);
}

/* ======================================================= TIENDA */
{
  const m = {
    path: '/tienda/', title: 'Comprar joyas de acero inoxidable online',
    desc: `Compra joyas de acero inoxidable online: anillos, collares, pulseras y pendientes desde ${plain(minPrice(products))} con hasta un ${MAX_OFF} % de descuento. Pide por WhatsApp.`,
    priority: '0.9', changefreq: 'weekly', og: '/img/og-elanill0.jpg'
  };
  const cr = [['/', 'Inicio'], [null, 'Tienda']];
  m.ld = [webPage(m, 'CollectionPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [m.path, 'Tienda']]), '@id': abs(m.path) + '#breadcrumb' }, itemListLd(products)];
  page(m, `
${pageHead(cr, 'Tienda de joyas de acero inoxidable', 'Anillos, collares, pulseras y pendientes de acero inoxidable con descuento. Pulsa «Comprar por WhatsApp» en el producto que te guste y te atendemos al momento.')}
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
  <h2 class="sr-only">Productos de acero inoxidable</h2>
  <div class="products wide" id="shop-grid">
    ${products.map((p, i) => card(p, { lazy: i > 7 })).join('\n    ')}
    <p class="empty" id="empty" hidden>No hay productos que coincidan con tu búsqueda. <a href="/tienda/" style="text-decoration:underline">Ver todos</a> o <a href="${wa('Hola, busco una joya que no encuentro en la web.')}" target="_blank" rel="noopener" style="text-decoration:underline">pregúntanos por WhatsApp</a>.</p>
  </div>
</section>
<section class="wrap block">
  <div class="seo-text prose">
    <h2>Comprar joyas de acero inoxidable en ${BRAND}</h2>
    <p>Esta es toda nuestra colección de joyas de acero inoxidable: <a href="/categoria-producto/anillos/">anillos</a>, <a href="/categoria-producto/collares/">collares y cadenas</a>, <a href="/categoria-producto/pulseras/">pulseras y brazaletes</a> y <a href="/categoria-producto/pendientes/">pendientes y aros</a>. Son piezas unisex, pensadas para el uso diario y con descuentos de hasta el ${MAX_OFF} %. Para comprar, pulsa «Comprar por WhatsApp» y te atendemos directamente: confirmamos disponibilidad, talla, pago y envío.</p>
    <p>¿Dudas con la talla de un anillo o el largo de una cadena? Mira la <a href="/guias/talla-de-anillo/">guía de tallas de anillo</a> y la <a href="/guias/largo-de-cadena/">guía de largo de cadena</a>.</p>
  </div>
</section>
${ctaWa('¿No encuentras lo que buscas? Escríbenos.')}
`);
}

/* ======================================================= COLECCIONES (hub) */
{
  const m = {
    path: '/colecciones/', title: 'Colecciones de joyas de acero inoxidable',
    desc: `Colecciones de ${BRAND}: anillos, collares, pulseras y pendientes de acero inoxidable para hombre y mujer. Elige la tuya y compra por WhatsApp.`,
    priority: '0.7'
  };
  const cr = [['/', 'Inicio'], [null, 'Colecciones']];
  m.ld = [webPage(m, 'CollectionPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [m.path, 'Colecciones']]), '@id': abs(m.path) + '#breadcrumb' }];
  page(m, `
${pageHead(cr, 'Colecciones de joyas de acero inoxidable', 'Cuatro colecciones de acero inoxidable para combinar a tu gusto.')}
<section class="wrap">
  <div class="cats">
    ${cats.map(c => `<a href="/categoria-producto/${c.slug}/"><div class="ph"><img src="${c.cover}" alt="${esc(c.alt)}" loading="lazy" width="500" height="500"></div><strong>${esc(c.title)}</strong><small>${inCat(c.slug).length} productos</small></a>`).join('\n    ')}
  </div>
</section>
${ctaWa('¿Buscas un regalo? Te ayudamos a elegir.', 'PEDIR AYUDA POR WHATSAPP', 'Hola, busco un regalo de joyería. ¿Me ayudáis a elegir?')}
`);
}

/* ======================================================= CATEGORÍAS */
for (const c of cats) {
  const list = inCat(c.slug);
  const others = cats.filter(o => o.slug !== c.slug);
  const m = {
    path: `/categoria-producto/${c.slug}/`, title: c.title,
    desc: c.metaTail.replace('{min}', minPrice(list)),
    og: `/img/og/cat-${c.slug}.jpg`, ogAlt: c.alt, priority: '0.9', changefreq: 'weekly',
    sitemapImages: [c.cover]
  };
  const cr = [['/', 'Inicio'], ['/colecciones/', 'Colecciones'], [null, c.name]];
  m.ld = [
    webPage(m, 'CollectionPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }),
    { ...breadcrumbLd([['/', 'Inicio'], ['/colecciones/', 'Colecciones'], [m.path, c.name]]), '@id': abs(m.path) + '#breadcrumb' },
    itemListLd(list), faqLd(c.faq)
  ];
  page(m, `
${pageHead(cr, c.h1, c.intro)}
<section class="wrap shop-section">
  <div class="toolbar"><span>${list.length} productos</span><div class="chips">${others.map(o => `<a class="chip" href="/categoria-producto/${o.slug}/">${o.name}</a>`).join('')}</div></div>
  <h2 class="sr-only">${esc(c.title)}: productos</h2>
  <div class="products wide">
    ${list.map(p => card(p, { lazy: false })).join('\n    ')}
  </div>
</section>
<section class="wrap block">
  <div class="seo-text prose">
    ${c.body.map(s => `<h2>${s.h2}</h2>\n    ${s.html}`).join('\n    ')}
  </div>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> Preguntas frecuentes: ${c.name.toLowerCase()} de acero inoxidable</h2>
  ${faqHtml(c.faq)}
</section>
${ctaWa(`¿Dudas con tu pedido de ${c.name.toLowerCase()}?`)}
`);
}

/* ======================================================= PRODUCTOS */
for (const p of products) {
  const related = products.filter(o => o.cat === p.cat && o.id !== p.id).concat(products.filter(o => o.cat !== p.cat && o.id !== p.id)).slice(0, 4);
  const opt = p.option;
  const cat = catBy[p.cat];
  const ogFile = `/img/og/${p.slug}.jpg`;
  const desc = p.price != null
    ? `${p.titleName} por ${plain(p.price)} (antes ${plain(p.oldPrice)}). ${p.hook} Compra por WhatsApp en ${BRAND}.`
    : `${p.titleName}. ${p.hook} Consulta precio y disponibilidad por WhatsApp en ${BRAND}.`;
  const m = {
    path: p.url, title: p.titleName, desc, og: ogFile, ogAlt: p.alts[0], ogType: 'product', priority: '0.8',
    sitemapImages: p.images.map(i => '/img/productos/' + i),
    productMeta: p.price != null ? `<meta property="product:price:amount" content="${p.price.toFixed(2)}">\n<meta property="product:price:currency" content="EUR">\n<meta property="product:availability" content="in stock">\n` : ''
  };
  const crumbItems = [['/', 'Inicio'], ['/tienda/', 'Tienda'], [`/categoria-producto/${p.cat}/`, p.catName], [p.url, esc(p.name)]];
  const prod = {
    '@type': 'Product', '@id': abs(p.url) + '#product', name: p.name, description: strip(p.summary + ' ' + p.long.join(' ')),
    image: p.images.map(i => abs('/img/productos/' + i)), sku: String(p.id), category: `Joyería > ${p.catName}`,
    brand: { '@type': 'Brand', name: BRAND }, material: 'Acero inoxidable', url: abs(p.url)
  };
  if (p.price != null) {
    prod.offers = {
      '@type': 'Offer', url: abs(p.url), priceCurrency: 'EUR', price: p.price.toFixed(2),
      itemCondition: 'https://schema.org/NewCondition', availability: 'https://schema.org/InStock', seller: { '@id': ORG_ID },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy', applicableCountry: 'ES', returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14, url: abs('/envios-y-devoluciones/')
      }
    };
  }
  m.ld = [webPage(m, 'ItemPage', { breadcrumb: { '@id': abs(p.url) + '#breadcrumb' }, primaryImageOfPage: { '@type': 'ImageObject', url: abs(m.og) } }), { ...breadcrumbLd(crumbItems), '@id': abs(p.url) + '#breadcrumb' }, prod];
  page(m, `
<section class="wrap page-head" style="padding-bottom:0">
  ${crumbsHtml(crumbItems)}
</section>
<section class="wrap pdp">
  <div class="gallery">
    <div class="gallery-main"><img id="gallery-main" src="${p.img}" alt="${esc(p.alts[0])}" width="1000" height="1000" fetchpriority="high"></div>
    ${p.images.length > 1 ? `<div class="gallery-thumbs">${p.images.map((im, i) => `<button type="button" data-src="/img/productos/${im}" aria-current="${i === 0}" aria-label="Ver imagen ${i + 1}"><img src="/img/productos/${im}" alt="${esc(p.alts[i] || p.alts[0])}" loading="lazy" width="150" height="150"></button>`).join('')}</div>` : ''}
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
    <h2><span>•</span> Descripción de ${esc(p.titleName.charAt(0).toLowerCase() + p.titleName.slice(1))}</h2>
    <p>${esc(p.summary)}</p>
    ${p.long.map(t => `<p>${t}</p>`).join('')}
  </div>
  <div>
    <h2><span>•</span> Características</h2>
    <ul>
      <li>Material: acero inoxidable</li>
      <li>Categoría: <a href="/categoria-producto/${p.cat}/" style="text-decoration:underline">${cat.title}</a></li>
      ${p.details.map(d => `<li>${esc(d)}</li>`).join('\n      ')}
      <li>Compra por WhatsApp, <a href="/envios-y-devoluciones/" style="text-decoration:underline">envíos y devoluciones</a></li>
    </ul>
  </div>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> También te puede gustar</h2>
  <div class="products" style="padding-top:26px">
    ${related.map(o => card(o)).join('\n    ')}
  </div>
</section>
`);
}

/* ======================================================= GUÍAS */
{
  const m = {
    path: '/guias/', title: 'Guías de joyería: tallas, cadenas y cuidado',
    desc: 'Guías prácticas de joyería de acero inoxidable: talla de anillo, largo de cadena, cuidado del acero, diferencia con el acero quirúrgico e ideas de regalo.',
    priority: '0.7'
  };
  const cr = [['/', 'Inicio'], [null, 'Guías']];
  m.ld = [webPage(m, 'CollectionPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [m.path, 'Guías']]), '@id': abs(m.path) + '#breadcrumb' }];
  page(m, `
${pageHead(cr, 'Guías de joyería de acero inoxidable', 'Todo lo que necesitas saber para elegir y cuidar tus joyas: tallas, largos de cadena, materiales e ideas de regalo.')}
<section class="wrap">
  <div class="values guides-grid">
    ${guides.map(g => `<a class="value" href="/guias/${g.slug}/"><h2>${esc(g.h1)}</h2><p>${esc(g.lead)}</p><span class="more">LEER LA GUÍA →</span></a>`).join('\n    ')}
  </div>
</section>
${ctaWa('¿Tienes otra duda sobre tu joya?')}
`);
}

for (const g of guides) {
  const m = {
    path: `/guias/${g.slug}/`, title: g.title, desc: g.desc, priority: '0.7', og: '/img/og-elanill0.jpg'
  };
  const crumbItems = [['/', 'Inicio'], ['/guias/', 'Guías'], [m.path, esc(g.h1)]];
  const cr = [['/', 'Inicio'], ['/guias/', 'Guías'], [null, esc(g.h1)]];
  m.ld = [
    webPage(m, 'WebPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }),
    { ...breadcrumbLd(crumbItems), '@id': abs(m.path) + '#breadcrumb' },
    { '@type': 'Article', '@id': abs(m.path) + '#article', headline: g.h1, description: g.desc, inLanguage: 'es-ES', datePublished: '2026-10-07', dateModified: TODAY, mainEntityOfPage: { '@id': abs(m.path) + '#webpage' }, author: { '@id': ORG_ID }, publisher: { '@id': ORG_ID }, image: abs('/img/og-elanill0.jpg') },
    faqLd(g.faq)
  ];
  const rel = (g.related || []).map(s => catBy[s]);
  page(m, `
${pageHead(cr, esc(g.h1), esc(g.lead))}
${g.steps ? `<section class="wrap"><div class="steps">${g.steps.map(([n, t, d]) => `<div class="step"><b>${n}</b><h2>${t}</h2><p>${d}</p></div>`).join('')}</div></section>` : ''}
<section class="wrap block" style="padding-top:44px">
  <article class="prose">
    ${g.html}
  </article>
</section>
<section class="wrap block">
  <h2 class="label"><span>•</span> Preguntas frecuentes</h2>
  ${faqHtml(g.faq)}
</section>
${rel.length ? `<section class="wrap block"><h2 class="label"><span>•</span> Ver joyas de acero inoxidable</h2><div class="chips" style="padding-top:22px">${rel.map(c => `<a class="chip" href="/categoria-producto/${c.slug}/">${esc(c.title)}</a>`).join('')}</div></section>` : ''}
${ctaWa('¿Tienes otra duda? Escríbenos.')}
`);
}

/* ======================================================= SOBRE NOSOTROS */
{
  const m = {
    path: '/sobre-nosotros/', title: 'Sobre Elanill0: joyas de acero inoxidable en Madrid',
    desc: `${BRAND} es una tienda online de joyas de acero inoxidable con base en Madrid: piezas únicas y modernas, precios honestos y atención directa por WhatsApp.`,
    og: '/img/og/sobre-nosotros.jpg', priority: '0.6'
  };
  const cr = [['/', 'Inicio'], [null, 'Sobre nosotros']];
  m.ld = [webPage(m, 'AboutPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [m.path, 'Sobre nosotros']]), '@id': abs(m.path) + '#breadcrumb' }];
  page(m, `
${pageHead(cr, 'Sobre Elanill0, joyas únicas y modernas', 'Una tienda online de joyería de acero inoxidable hecha para llevarse todos los días.')}
<section class="wrap split">
  <img src="/img/pendientes-aro-dorado-acero-inoxidable.webp" alt="Aro dorado con bolitas de acero inoxidable en la oreja" loading="lazy" width="1000" height="1000">
  <div class="prose">
    <h2>Quiénes somos</h2>
    <p>${BRAND} es una tienda online de joyería de acero inoxidable con base en Madrid, España. Seleccionamos <a href="/categoria-producto/anillos/">anillos</a>, <a href="/categoria-producto/collares/">collares</a>, <a href="/categoria-producto/pulseras/">pulseras</a> y <a href="/categoria-producto/pendientes/">pendientes</a> con un diseño actual, para que lleves joyas con estilo sin pagar de más.</p>
    <p>Trabajamos con acero inoxidable porque combina lo mejor de dos mundos: el aspecto de una joya y la resistencia que necesitas para llevarla a diario, sin miedo al agua, al sol o al paso del tiempo.</p>
    <h2>Cómo trabajamos</h2>
    <p>Aquí no hay carritos complicados: eliges tu pieza, pulsas <strong>«Comprar por WhatsApp»</strong> y hablas directamente con nosotros. Te confirmamos disponibilidad, talla y forma de pago, y acordamos el envío contigo.</p>
    <a class="btn btn-dark" href="/tienda/">VER LA TIENDA</a>
  </div>
</section>
<section class="wrap">
  <div class="values">
    <div class="value"><h2>Acero inoxidable</h2><p>Piezas pensadas para el uso diario, fáciles de limpiar y de mantener. Consulta nuestra <a href="/guias/cuidado-del-acero/" style="text-decoration:underline">guía de cuidado</a>.</p></div>
    <div class="value"><h2>Precio honesto</h2><p>Joyas con estilo a precios accesibles, con descuentos de hasta el ${MAX_OFF} % en muchas piezas.</p></div>
    <div class="value"><h2>Trato directo</h2><p>Compras hablando con una persona, no con un formulario. Te asesoramos con la talla, el largo y el regalo ideal.</p></div>
  </div>
</section>
${ctaWa('¿Hablamos? Estamos a un mensaje de distancia.')}
`);
}

/* ======================================================= CONTACTO */
const contactFaq = [
  ['¿Cómo compro?', 'Elige tu producto en la tienda y pulsa «Comprar por WhatsApp». Se abrirá una conversación con nosotros con el producto ya indicado: te confirmamos disponibilidad, forma de pago y envío.'],
  ['¿Recibiré el mismo producto que veo en la foto?', 'Sí. Las fotos corresponden al producto que vendemos. Si tienes cualquier duda sobre medidas o acabado, pregúntanos antes de comprar.'],
  ['¿Hacéis envíos?', 'Sí, acordamos el envío contigo por WhatsApp. Consulta los detalles en <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.'],
  ['¿Puedo cambiar o devolver mi pedido?', 'Sí, dentro de los plazos legales. Lo explicamos en <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.']
];
{
  const m = {
    path: '/contacto/', title: 'Contacto y pedidos por WhatsApp',
    desc: `Contacta con ${BRAND}: WhatsApp ${WA_PRETTY}, email ${EMAIL} y Facebook @elanill0. Pide tus joyas de acero inoxidable por WhatsApp.`,
    priority: '0.6'
  };
  const cr = [['/', 'Inicio'], [null, 'Contacto']];
  m.ld = [webPage(m, 'ContactPage', { breadcrumb: { '@id': abs(m.path) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [m.path, 'Contacto']]), '@id': abs(m.path) + '#breadcrumb' }, faqLd(contactFaq)];
  page(m, `
${pageHead(cr, 'Contacto', 'Escríbenos por WhatsApp para comprar o resolver cualquier duda. Te respondemos lo antes posible.')}
<section class="wrap">
  <div class="contact-grid">
    <div class="ccard">${I.wa(30)}<h2>WhatsApp</h2><p>La forma más rápida de comprar y de resolver dudas.</p><a href="${wa('Hola, quisiera información sobre vuestras joyas.')}" target="_blank" rel="noopener"><strong>${WA_PRETTY}</strong></a></div>
    <div class="ccard">${I.mail(30)}<h2>Email</h2><p>Para consultas más largas o con imágenes.</p><a href="mailto:${EMAIL}"><strong>${EMAIL}</strong></a></div>
    <div class="ccard">${I.fb(30)}<h2>Facebook</h2><p>Síguenos para ver novedades y ofertas.</p><a href="${FB}" target="_blank" rel="noopener"><strong>@elanill0</strong></a></div>
    <div class="ccard">${I.pin(30)}<h2>Ubicación</h2><p>Tienda online con base en Madrid, España. Atendemos y enviamos a toda España.</p><span><strong>Madrid, España</strong></span></div>
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
  ${faqHtml(contactFaq)}
</section>
`);
}

/* ======================================================= LEGALES */
const legal = (p, title, desc, h1, html) => {
  const m = { path: p, title, desc, priority: '0.3', changefreq: 'yearly' };
  m.ld = [webPage(m, 'WebPage', { breadcrumb: { '@id': abs(p) + '#breadcrumb' } }), { ...breadcrumbLd([['/', 'Inicio'], [p, h1]]), '@id': abs(p) + '#breadcrumb' }];
  page(m, `
${pageHead([['/', 'Inicio'], [null, h1]], h1, 'Última actualización: 7 de octubre de 2026.')}
<section class="wrap block" style="padding-top:34px"><div class="prose">${html}</div></section>
`);
};

legal('/envios-y-devoluciones/', 'Envíos y devoluciones', `Envíos, plazos, cambios y devoluciones en ${BRAND}: pedido por WhatsApp, 14 días para desistir y atención directa.`, 'Envíos y devoluciones', `
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

legal('/politica-de-privacidad/', 'Política de privacidad', `Cómo trata ${BRAND} tus datos personales: qué datos recogemos, para qué los usamos y cómo ejercer tus derechos.`, 'Política de privacidad', `
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

legal('/terminos-y-condiciones/', 'Términos y condiciones', `Condiciones de uso del sitio web y de compra en ${BRAND}: pedidos por WhatsApp, precios, disponibilidad y devoluciones.`, 'Términos y condiciones', `
<h2>Titular</h2>
<p>Este sitio web pertenece a ${BRAND}, tienda online de joyas de acero inoxidable con base en Madrid, España. Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Uso del sitio</h2>
<p>El sitio tiene carácter informativo y de catálogo. Al navegar aceptas usarlo de forma lícita y respetuosa. Los contenidos (textos, imágenes y marca) pertenecen a ${BRAND} y no pueden reproducirse sin permiso.</p>
<h2>Compras</h2>
<p>Las compras se gestionan por WhatsApp o email. Los precios mostrados son orientativos y pueden cambiar; el precio válido es el que te confirmemos al cerrar el pedido. Los productos están sujetos a disponibilidad.</p>
<h2>Descripción de los productos</h2>
<p>Procuramos que las imágenes y descripciones sean lo más fieles posible. Pueden existir pequeñas diferencias de color por la pantalla o la iluminación.</p>
<h2>Cambios y devoluciones</h2>
<p>Consulta la página de <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.</p>
<h2>Legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española.</p>
`);

legal('/politica-de-cookies/', 'Política de cookies', `Información sobre el uso de cookies en el sitio web de ${BRAND}: no usamos cookies de seguimiento ni de publicidad.`, 'Política de cookies', `
<h2>¿Qué son las cookies?</h2>
<p>Son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita.</p>
<h2>Qué cookies usamos</h2>
<p>Este sitio <strong>no utiliza cookies propias ni de terceros</strong> con fines de seguimiento, análisis o publicidad. Las tipografías se sirven desde nuestro propio sitio. Los enlaces a WhatsApp y Facebook te llevan a servicios de terceros con sus propias políticas de privacidad y de cookies.</p>
<h2>Cómo gestionar las cookies</h2>
<p>Puedes borrar o bloquear las cookies desde la configuración de tu navegador en cualquier momento.</p>
<h2>Contacto</h2>
<p>Si tienes preguntas, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
`);

/* ======================================================= 404 */
{
  const m = { path: '/404/', title: 'Página no encontrada', desc: 'La página que buscas no existe o ha cambiado de sitio. Vuelve al inicio o explora nuestras joyas de acero inoxidable.', noindex: true };
  m.ld = [];
  writeFile('404.html', head(m) + header(m) + `
<section class="wrap nf">
  <b>404</b>
  <h1>Página no encontrada</h1>
  <p>La página que buscas no existe o ha cambiado de sitio. Prueba con una de nuestras colecciones.</p>
  <a class="btn btn-dark" href="/">VOLVER AL INICIO</a> <a class="btn btn-line" href="/tienda/">VER LA TIENDA</a>
</section>
` + footer());
}

/* ======================================================= CSS único (fuentes + estilos, minificado) */
{
  const css = fs.readFileSync(path.join(OUT, 'assets', 'fonts.css'), 'utf8') + '\n' + fs.readFileSync(path.join(OUT, 'styles.css'), 'utf8');
  const min = css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').replace(/\n+/g, '').trim();
  fs.writeFileSync(path.join(OUT, 'assets', 'site.css'), min);
}

/* ======================================================= sitemap, robots, redirecciones, manifest, feed */
{
  const urls = pages.map(p => {
    const imgs = (p.images || []).map(i => `<image:image><image:loc>${abs(i)}</image:loc></image:image>`).join('');
    return `<url><loc>${abs(p.path)}</loc><lastmod>${TODAY}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority>${imgs}</url>`;
  }).join('\n');
  writeFile('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`);
  writeFile('robots.txt', `User-agent: *\nAllow: /\nDisallow: /tienda/?*\nDisallow: /*?q=\n\nSitemap: ${SITE}/sitemap.xml\n`);
  writeFile('site.webmanifest', JSON.stringify({
    name: `${BRAND} · Joyas de acero inoxidable`, short_name: BRAND, lang: 'es-ES', start_url: '/', display: 'standalone',
    background_color: '#ffffff', theme_color: '#D8A697',
    icons: [{ src: '/img/marca/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/img/marca/icon-512.png', sizes: '512x512', type: 'image/png' }]
  }, null, 2));

  // redirecciones desde las URL antiguas de elanill0.com (WordPress) para no perder posicionamiento
  const redirects = [
    ['/shop/', '/tienda/'], ['/shop/page/2/', '/tienda/'], ['/product-category/anillos/', '/categoria-producto/anillos/'],
    ['/contact-us/', '/contacto/'], ['/about-us-3/', '/sobre-nosotros/'], ['/home-jewellery/', '/'],
    ['/blog/', '/guias/'], ['/portfolio/', '/'], ['/wishlist/', '/tienda/'], ['/compare/', '/tienda/'],
    ['/carrito/', '/tienda/'], ['/finalizar-compra/', '/tienda/'], ['/mi-cuenta/', '/contacto/'],
    ['/cuidado-del-acero.html', '/guias/cuidado-del-acero/']
  ];
  products.filter(p => p.legacySlug).forEach(p => redirects.push([`/producto/${p.legacySlug}/`, p.url]));
  writeFile('_redirects', redirects.map(([a, b]) => `${a} ${b} 301`).join('\n') + '\n');
  writeFile('.htaccess', `# Redirecciones 301 desde las URL antiguas (Apache / WordPress)\n<IfModule mod_rewrite.c>\nRewriteEngine On\n</IfModule>\n${redirects.map(([a, b]) => `Redirect 301 ${a} ${b}`).join('\n')}\n`);
  writeFile('_headers', `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/img/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);
  fs.writeFileSync(path.join(ROOT, 'data', 'redirects.json'), JSON.stringify(redirects, null, 2));

  // feed de Google Merchant Center (fichas gratuitas en Google Shopping)
  const gcat = { anillos: '200', collares: '196', pulseras: '191', pendientes: '194' };
  const items = products.filter(p => p.price != null).map(p => `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(strip(p.summary + ' ' + p.long.join(' ')))}</g:description>
      <g:link>${abs(p.url)}</g:link>
      <g:image_link>${abs(p.img)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${p.oldPrice ? p.oldPrice.toFixed(2) : p.price.toFixed(2)} EUR</g:price>
      ${p.oldPrice ? `<g:sale_price>${p.price.toFixed(2)} EUR</g:sale_price>` : ''}
      <g:condition>new</g:condition>
      <g:brand>${BRAND}</g:brand>
      <g:material>Acero inoxidable</g:material>
      <g:google_product_category>${gcat[p.cat]}</g:google_product_category>
      <g:product_type>Joyería &gt; ${p.catName}</g:product_type>
      <g:identifier_exists>no</g:identifier_exists>
    </item>`).join('\n');
  writeFile('google-merchant-feed.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n  <channel>\n    <title>${BRAND}</title>\n    <link>${SITE}/</link>\n    <description>Joyas de acero inoxidable</description>\n${items}\n  </channel>\n</rss>\n`);
}

fs.writeFileSync(path.join(ROOT, 'data', '.build-meta.json'), JSON.stringify(allMeta.map(({ path: p, title, fullTitle: ft, desc, noindex, __rel }) => ({ path: p, title: ft || fullTitle(title), desc, noindex: !!noindex, file: __rel })), null, 1));
console.log(`OK · ${pages.length} páginas indexables · ${products.length} productos · ${guides.length} guías`);
