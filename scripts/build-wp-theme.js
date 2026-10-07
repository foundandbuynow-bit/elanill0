/* Genera las partes y plantillas del tema de bloques en wp/elanill0-theme/.  Uso: node scripts/build-wp-theme.js */
const fs = require('fs');
const path = require('path');
const { group, paragraph, heading, list, buttons, button, separator, shortcode, productQuery, json } = require('./wp-blocks.js');

const THEME = path.join(__dirname, '..', 'wp', 'elanill0-theme');
const SITE = 'https://elanill0.com';
const WA = 'https://wa.me/34605505120?text=' + encodeURIComponent('Hola, quisiera información sobre vuestras joyas.');
const w = (rel, txt) => { const f = path.join(THEME, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, txt); };

const part = slug => `<!-- wp:template-part ${json({ slug, tagName: slug === 'header' ? 'header' : 'footer' })} /-->\n`;
const link = (label, url) => `<!-- wp:navigation-link ${json({ label, url, kind: 'custom', isTopLevelLink: true })} /-->\n`;

/* ---------- Cabecera ---------- */
const nav = `<!-- wp:navigation ${json({ overlayMenu: 'mobile', className: 'main-nav', layout: { type: 'flex', justifyContent: 'center' } })} -->\n` +
  [['Anillos', '/colecciones/anillos/'], ['Collares', '/colecciones/collares/'], ['Pulseras', '/colecciones/pulseras/'], ['Pendientes', '/colecciones/pendientes/'],
    ['Tienda', '/tienda/'], ['Guías', '/guias/'], ['Sobre nosotros', '/sobre-nosotros/'], ['Contacto', '/contacto/']].map(([l, u]) => link(l, SITE + u)).join('') +
  '<!-- /wp:navigation -->\n';
const search = `<!-- wp:search ${json({ label: 'Buscar', showLabel: false, placeholder: 'Busco...', buttonText: 'Buscar', buttonUseIcon: true, query: { post_type: 'producto' }, className: 'search' })} /-->\n`;
const social = `<!-- wp:social-links ${json({ className: 'is-style-logos-only top-social' })} -->\n<ul class="wp-block-social-links is-style-logos-only top-social">` +
  [['facebook', 'https://www.facebook.com/elanill0', 'Facebook'], ['whatsapp', WA, 'WhatsApp'], ['mail', 'mailto:elanillospain@gmail.com', 'Email']]
    .map(([s, u, l]) => `<!-- wp:social-link ${json({ url: u, service: s, label: l })} /-->`).join('\n') + '</ul>\n<!-- /wp:social-links -->\n';
const logo = (size, cls) => `<!-- wp:site-logo ${json({ width: size, shouldSyncIcon: false, className: cls })} /-->\n`;

w('parts/header.html',
  group('site-header', group('announce', paragraph('Envío gratis en compras de más de 50 € · Acero inoxidable 316L')) + group('wrap',
    group('topbar',
      group('top-left', search + paragraph(`<a href="${WA}" target="_blank" rel="noopener">WhatsApp +34 605 505 120</a>`, 'top-wa')) +
      group('brand', logo(84, 'brand-logo')) +
      group('top-right', social)) + nav), { tagName: 'header' }));

/* ---------- Pie ---------- */
const col = (title, items) => group('f-col', heading(2, title, 'foot-h') + list(items.map(([l, u]) => `<a href="${u}">${l}</a>`)));
w('parts/footer.html',
  group('', group('wrap', group('foot-box',
    group('foot-cols',
      group('f-brand', logo(92, 'foot-logo') + paragraph('Elanill0 es una tienda online de joyas de acero inoxidable 316L: anillos, collares, pulseras y pendientes para hombre y mujer, pensados para el día a día. Envío gratis en compras de más de 50 €.')) +
      group('f-col f-contact', heading(2, 'Contacto', 'foot-h') + list([
        '<a href="mailto:elanillospain@gmail.com">elanillospain@gmail.com</a>',
        `<a href="${WA}" target="_blank" rel="noopener">+34 605 505 120</a>`,
        '<a href="/contacto/">Madrid, España</a>',
        '<a href="https://www.facebook.com/elanill0" target="_blank" rel="noopener">Facebook @elanill0</a>'])) +
      col('Tienda', [['Anillos', '/colecciones/anillos/'], ['Collares y cadenas', '/colecciones/collares/'], ['Pulseras y brazaletes', '/colecciones/pulseras/'], ['Pendientes y aros', '/colecciones/pendientes/'], ['Todos los productos', '/tienda/']]) +
      col('Guías', [['Talla de anillo', '/guias/talla-de-anillo/'], ['Largo de cadena', '/guias/largo-de-cadena/'], ['Cuidado del acero', '/guias/cuidado-del-acero/'], ['Regalos de joyas', '/guias/regalos-de-joyas/'], ['Sobre nosotros', '/sobre-nosotros/']]) +
      col('Legal', [['Envíos y devoluciones', '/envios-y-devoluciones/'], ['Privacidad', '/politica-de-privacidad/'], ['Términos', '/terminos-y-condiciones/'], ['Cookies', '/politica-de-cookies/']])) +
    paragraph('© 2026 Elanill0. Todos los derechos reservados.', 'copy'))), { tagName: 'footer' }));

/* ---------- Plantillas ---------- */
const main = inner => group('site-main', inner, { tagName: 'main', anchor: 'contenido' });
const pageHead = group('wrap page-head',
  shortcode('[elanill0_migas]') +
  `<!-- wp:post-title ${json({ level: 1 })} /-->\n` +
  `<!-- wp:post-excerpt ${json({ excerptLength: 60, className: 'lead' })} /-->\n` +
  separator('bar'));
const content = '<!-- wp:post-content {"layout":{"type":"default"}} /-->\n';

w('templates/front-page.html', part('header') + main(content) + part('footer'));
w('templates/page.html', part('header') + main(pageHead + content) + part('footer'));
w('templates/index.html', part('header') + main(
  group('wrap page-head', shortcode('[elanill0_migas]') + heading(1, 'Joyas de acero inoxidable') + separator('bar')) +
  group('wrap', `<!-- wp:query ${json({ query: { perPage: 12, pages: 0, offset: 0, postType: 'post', order: 'desc', orderBy: 'date', author: '', search: '', exclude: [], sticky: '', inherit: true } })} -->\n<div class="wp-block-query"><!-- wp:post-template -->\n<!-- wp:post-title ${json({ level: 2, isLink: true })} /-->\n<!-- wp:post-excerpt /-->\n<!-- /wp:post-template --></div>\n<!-- /wp:query -->\n`)) + part('footer'));
w('templates/404.html', part('header') + main(
  group('wrap nf', paragraph('404', 'nf-num') + heading(1, 'Página no encontrada') +
    paragraph('La página que buscas no existe o ha cambiado de sitio. Prueba con una de nuestras colecciones.') +
    buttons([button('VOLVER AL INICIO', SITE + '/', 'btn-dark'), button('VER LA TIENDA', SITE + '/tienda/', 'btn-line')]))) + part('footer'));

/* Resultados de búsqueda: productos */
w('templates/search.html', part('header') + main(
  group('wrap page-head', shortcode('[elanill0_migas]') + `<!-- wp:query-title ${json({ type: 'search', level: 1 })} /-->\n` + separator('bar')) +
  group('wrap shop-section',
    `<!-- wp:query ${json({ query: { perPage: 100, pages: 0, offset: 0, postType: 'producto', order: 'asc', orderBy: 'menu_order', author: '', search: '', exclude: [], sticky: '', inherit: true } })} -->\n<div class="wp-block-query"><!-- wp:post-template ${json({ className: 'products' })} -->\n${require('./wp-blocks.js').productCard()}<!-- /wp:post-template -->\n<!-- wp:query-no-results -->\n${paragraph('No hay productos que coincidan con tu búsqueda. <a href="/tienda/">Ver todos los productos</a> o <a href="' + WA + '" target="_blank" rel="noopener">pregúntanos por WhatsApp</a>.', 'empty')}<!-- /wp:query-no-results --></div>\n<!-- /wp:query -->\n`)) + part('footer'));

/* Ficha de producto */
const perks = list(['Pides por WhatsApp y te respondemos con disponibilidad y forma de pago.', 'Acero inoxidable 316L (acero quirúrgico), pensado para el uso diario.', 'Envío gratis en compras de más de 50 €.', '¿Dudas con la talla o el largo? Te asesoramos antes de comprar.'], false, 'perks');
const B = k => ({ source: 'elanill0/producto', args: { key: k } });
w('templates/single-producto.html', part('header') + main(
  group('wrap page-head crumbs-only', shortcode('[elanill0_migas]')) +
  group('wrap pdp',
    group('gallery', `<!-- wp:post-featured-image ${json({ isLink: false, className: 'gallery-main' })} /-->\n`) +
    group('info',
      `<!-- wp:post-terms ${json({ term: 'categoria-producto', className: 'cat' })} /-->\n` +
      `<!-- wp:post-title ${json({ level: 1 })} /-->\n` +
      group('price', paragraph('', 'price-old', { content: B('precio_antes') }) + paragraph('Consultar precio', 'price-now', { content: B('precio') }) + paragraph('', 'off', { content: B('descuento') })) +
      paragraph('Pago por WhatsApp. Envío gratis en compras de más de 50 €.', 'tax') +
      `<!-- wp:post-excerpt ${json({ excerptLength: 60, className: 'lead' })} /-->\n` +
      shortcode('[elanill0_comprar]') + perks)) +
  group('wrap desc', `<!-- wp:post-content {"layout":{"type":"default"}} /-->\n`) +
  group('wrap block',
    heading(2, 'También te puede gustar', 'label') + productQuery({ perPage: 4, className: 'related-products', orderBy: 'menu_order' }))) + part('footer'));

console.log('Tema: plantillas y partes generadas en', THEME);
