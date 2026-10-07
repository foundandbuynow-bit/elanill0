/* Contenido de las páginas y productos de WordPress, en bloques nativos.
   buildContent(ctx) recibe los mapas de la mediateca (ctx.img) y de términos (ctx.term) obtenidos al desplegar. */
const fs = require('fs');
const path = require('path');
const guides = require('./guides.js');
const K = require('./wp-blocks.js');
const { group, paragraph, heading, list, image, button, buttons, separator, table, faq, shortcode, productQuery } = K;

const ROOT = path.join(__dirname, '..');
const categories = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'categories.json'), 'utf8')).categories;
const products = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'products.json'), 'utf8')).products;
const catBy = Object.fromEntries(categories.map(c => [c.slug, c]));

const SITE = 'https://elanill0.com';
const WA_NUM = '34605505120';
const wa = t => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(t)}`;
const HELLO = wa('Hola, quisiera información sobre vuestras joyas.');
const EMAIL = 'juam9219@gmail.com';
const FB = 'https://www.facebook.com/elanill0';
const MAX_OFF = 45;
const L = (p) => SITE + p;
const WAB = (txt, msg, cls) => button(txt, wa(msg || 'Hola, quisiera información sobre vuestras joyas.'), cls, { blank: true });
const label = (text) => heading(2, text, 'label');

/* HTML controlado (guías, categorías) -> bloques nativos */
function htmlToBlocks(html) {
  let out = '';
  const re = /<(h2|h3|p|ul|ol|div class="table-wrap")(?: class="([^"]*)")?[^>]*>([\s\S]*?)<\/(?:h2|h3|p|ul|ol|div)>(?:<\/div>)?/g;
  const src = html.replace(/\r?\n\s*/g, ' ').replace(/<table>/g, '<table>');
  let m;
  const tokens = [];
  // recorrido secuencial seguro
  let i = 0;
  const s = src.trim();
  while (i < s.length) {
    while (i < s.length && /\s/.test(s[i])) i++;
    if (i >= s.length) break;
    let mm;
    if ((mm = /^<h([23])>([\s\S]*?)<\/h\1>/.exec(s.slice(i)))) { out += heading(+mm[1], mm[2].trim()); i += mm[0].length; continue; }
    if ((mm = /^<p class="note">([\s\S]*?)<\/p>/.exec(s.slice(i)))) { out += paragraph(mm[1].trim(), 'note'); i += mm[0].length; continue; }
    if ((mm = /^<p>([\s\S]*?)<\/p>/.exec(s.slice(i)))) { out += paragraph(mm[1].trim()); i += mm[0].length; continue; }
    if ((mm = /^<(ul|ol)>([\s\S]*?)<\/\1>/.exec(s.slice(i)))) {
      const items = [...mm[2].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(x => x[1].trim());
      out += list(items, mm[1] === 'ol'); i += mm[0].length; continue;
    }
    if ((mm = /^<div class="table-wrap">\s*<table>([\s\S]*?)<\/table>\s*<\/div>/.exec(s.slice(i)))) {
      const head = [...mm[1].match(/<thead>([\s\S]*?)<\/thead>/)[1].matchAll(/<th>([\s\S]*?)<\/th>/g)].map(x => x[1].trim());
      const rows = [...mm[1].match(/<tbody>([\s\S]*?)<\/tbody>/)[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map(r => [...r[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map(x => x[1].replace(/<small>([\s\S]*?)<\/small>/g, '$1').trim()));
      out += table(head, rows); i += mm[0].length; continue;
    }
    throw new Error('HTML no convertible cerca de: ' + s.slice(i, i + 80));
  }
  return out;
}

const productOrder = products.map(p => p.slug);

function buildContent(ctx) {
  const { img, term } = ctx;
  const T = (slug) => term.categoria[slug];
  const D = (slug) => term.destacado[slug];
  const pages = [];
  const add = p => pages.push(p);

  const ctaWa = (title, text = 'ESCRIBIR POR WHATSAPP', msg) => group('wrap', group('cta', heading(2, title) + buttons([WAB(text, msg, 'btn-light')])));

  /* ---------------- INICIO ---------------- */
  const homeFaq = [
    ['¿Dónde comprar joyas de acero inoxidable online en España?', `En Elanill0 puedes comprar anillos, collares, pulseras y pendientes de acero inoxidable para hombre y mujer, con descuentos de hasta el ${MAX_OFF} %. Eliges la pieza, pulsas «Comprar por WhatsApp» y te atendemos directamente.`],
    ['¿Las joyas de acero inoxidable se oxidan?', 'El acero inoxidable resiste la humedad y el uso diario sin oxidarse con facilidad. Para que mantenga su brillo, límpialo con agua tibia y jabón suave y guárdalo por separado. En las piezas de acabado dorado, el color puede desgastarse con el roce y el tiempo.'],
    ['¿Cómo compro en Elanill0?', 'Es muy fácil: elige tu producto, pulsa «Comprar por WhatsApp» y se abrirá una conversación con el producto, la talla y el precio ya escritos. Te confirmamos disponibilidad, forma de pago y envío.'],
    ['¿Son joyas para hombre o para mujer?', 'Casi todas nuestras piezas son unisex. El anillo de sello y la cadena cubana son muy populares entre los hombres, y los aros, los collares de cuerda y los brazaletes los eligen sobre todo ellas, pero cada uno elige su estilo.'],
    ['¿Hacéis envío gratis?', 'Sí: el envío es gratis en compras de más de 50 €. Por debajo de esa cantidad acordamos el coste contigo por WhatsApp.'],
    ['¿De qué acero son las joyas de Elanill0?', 'Todas nuestras joyas son de acero inoxidable 316L, el tipo que se conoce como acero quirúrgico.'],
    ['¿Qué diferencia hay entre acero inoxidable y acero quirúrgico?', 'En joyería, «acero quirúrgico» suele ser acero inoxidable de grado 316L: es un nombre comercial más que una norma oficial. Lo explicamos en nuestra <a href="/guias/acero-inoxidable-o-acero-quirurgico/">guía de acero inoxidable y acero quirúrgico</a>.']
  ];
  const catCard = c => group('cat-card',
    image(img['cover-' + c.slug], '', L(`/colecciones/${c.slug}/`)) +
    paragraph(`<a href="${L(`/colecciones/${c.slug}/`)}">${c.title}</a>`, 'cat-name'));

  add({
    slug: 'inicio', title: 'Inicio', order: 0,
    excerpt: 'Joyas de acero inoxidable online para hombre y mujer.',
    seoTitle: 'Joyas de acero inoxidable 316L online | Elanill0',
    seoDesc: `Joyas de acero inoxidable 316L online: anillos, collares, pulseras y pendientes para hombre y mujer, hasta -${MAX_OFF} % y envío gratis desde 50 €.`,
    content:
      group('wrap hero',
        group('hero-photo', image(img.hero, '')) +
        group('hero-panel',
          heading(1, 'JOYAS DE ACERO <br>INOXIDABLE PARA <br>TODOS LOS DÍAS', 'hero-title') +
          paragraph(`Anillos, collares, pulseras y pendientes de acero inoxidable 316L con hasta un ${MAX_OFF} % de descuento y envío gratis en compras de más de 50 €.`) +
          buttons([button('VER LA TIENDA', L('/tienda/'), 'btn-light')]))) +
      group('wrap block',
        group('label-row', heading(2, 'Joyas de acero inoxidable más vendidas', 'label') + paragraph(`<a href="${L('/tienda/')}">VER TODO</a>`, 'label-link')) +
        group('inset', productQuery({ perPage: 4, taxQuery: { destacado: [D('mas-vendidos')] } }) +
          buttons([button('VER TODOS LOS PRODUCTOS', L('/tienda/'), 'btn-outline')], 'center-btn'))) +
      group('wrap promo',
        group('promo-card',
          paragraph(`Hasta un ${MAX_OFF} % de <br>descuento en toda <br>la tienda`) +
          buttons([button('VER OFERTAS', L('/tienda/'), 'btn-light')])) +
        group('promo-photo',
          image(img.promo, '', L('/colecciones/pendientes/')) +
          group('promo-text', paragraph('Colección pendientes', 'label') + paragraph('Aros <br>de acero', 'promo-title')))) +
      group('wrap block',
        group('label-row', heading(2, 'Novedades en joyería de acero', 'label') + paragraph(`<a href="${L('/tienda/')}">VER TODO</a>`, 'label-link')) +
        group('inset', productQuery({ perPage: 4, orderBy: 'date', order: 'desc' }))) +
      group('wrap block',
        heading(2, 'Colecciones de joyas de acero inoxidable', 'label') +
        group('cats', categories.map(catCard).join('')) +
        group('browse', paragraph(`<a href="${L('/colecciones/')}">VER TODAS LAS COLECCIONES</a>`))) +
      group('wrap block', group('seo-text prose',
        heading(2, 'Joyas de acero inoxidable online: anillos, collares, pulseras y pendientes') +
        paragraph(`En Elanill0 encontrarás <strong>joyas de acero inoxidable para hombre y mujer</strong> a precios muy ajustados: <a href="${L('/colecciones/anillos/')}">anillos</a> de sello, lisos y vintage, <a href="${L('/colecciones/collares/')}">collares y cadenas</a> de eslabones cubanos y cuerda trenzada, <a href="${L('/colecciones/pulseras/')}">pulseras y brazaletes</a> y <a href="${L('/colecciones/pendientes/')}">pendientes de aro</a>. Todas las piezas son de acero inoxidable 316L, tienen descuentos de hasta el ${MAX_OFF} % y las pides directamente por WhatsApp, con <strong>envío gratis en compras de más de 50 €</strong>.`) +
        heading(3, '¿Por qué elegir joyas de acero inoxidable?') +
        paragraph(`Nuestras joyas son de acero inoxidable 316L, el tipo conocido como acero quirúrgico: resiste el uso diario, el agua y la humedad sin oxidarse con facilidad y conserva su brillo con un cuidado sencillo. Es una alternativa mucho más económica que el oro o la plata para llevar joyas todos los días. Si tienes dudas, lee la <a href="${L('/guias/acero-inoxidable-o-acero-quirurgico/')}">diferencia entre acero inoxidable y acero quirúrgico</a>.`) +
        heading(3, 'Tienda de joyería online con base en Madrid') +
        paragraph(`Atendemos desde Madrid y nos ocupamos de que tu pedido llegue bien. ¿No sabes qué elegir? Consulta nuestras guías para <a href="${L('/guias/talla-de-anillo/')}">medir tu talla de anillo</a>, <a href="${L('/guias/largo-de-cadena/')}">elegir el largo de una cadena</a> o <a href="${L('/guias/regalos-de-joyas/')}">encontrar el regalo perfecto</a>, o escríbenos por WhatsApp.`))) +
      group('wrap block', label('Preguntas frecuentes sobre joyas de acero inoxidable') + faq(homeFaq)) +
      group('wrap banner',
        group('banner-copy', paragraph('PARA ÉL <br>Y PARA ELLA', 'h2like') + buttons([button('VER ANILLOS', L('/colecciones/anillos/'), 'btn-ghost')])) +
        image(img.banner, '')) +
      group('wrap news',
        heading(2, 'NO TE PIERDAS <br>NINGUNA NOVEDAD') +
        paragraph('Escríbenos por WhatsApp y te avisamos de las novedades y ofertas, o síguenos en Facebook.') +
        buttons([WAB('AVISARME POR WHATSAPP', 'Hola, quiero recibir novedades de Elanill0', 'btn-dark'), button('SEGUIR EN FACEBOOK', FB, 'btn-line', { blank: true })]))
  });

  /* ---------------- TIENDA ---------------- */
  add({
    slug: 'tienda', title: 'Tienda de joyas de acero inoxidable', order: 1,
    excerpt: 'Anillos, collares, pulseras y pendientes de acero inoxidable con descuento. Pulsa «Comprar por WhatsApp» en el producto que te guste y te atendemos al momento.',
    seoTitle: 'Comprar joyas de acero inoxidable 316L | Elanill0',
    seoDesc: `Compra joyas de acero inoxidable 316L: anillos, collares, pulseras y pendientes desde 11 €, hasta -${MAX_OFF} % y envío gratis desde 50 €. Pide por WhatsApp.`,
    meta: { categoria_producto: 'todos' },
    content:
      group('wrap shop-section',
        group('toolbar', group('chips',
          paragraph('Todos', 'chip chip-todos') + categories.map(c => paragraph(c.name, 'chip chip-' + c.slug)).join(''))) +
        productQuery({ perPage: 100, orderBy: 'menu_order', className: 'shop-grid' })) +
      group('wrap block', group('seo-text prose',
        heading(2, 'Comprar joyas de acero inoxidable en Elanill0') +
        paragraph(`Esta es toda nuestra colección de joyas de acero inoxidable: <a href="${L('/colecciones/anillos/')}">anillos</a>, <a href="${L('/colecciones/collares/')}">collares y cadenas</a>, <a href="${L('/colecciones/pulseras/')}">pulseras y brazaletes</a> y <a href="${L('/colecciones/pendientes/')}">pendientes y aros</a>. Son piezas unisex, pensadas para el uso diario y con descuentos de hasta el ${MAX_OFF} %. Para comprar, pulsa «Comprar por WhatsApp» y te atendemos directamente: confirmamos disponibilidad, talla, pago y envío.`) +
        paragraph(`¿Dudas con la talla de un anillo o el largo de una cadena? Mira la <a href="${L('/guias/talla-de-anillo/')}">guía de tallas de anillo</a> y la <a href="${L('/guias/largo-de-cadena/')}">guía de largo de cadena</a>.`))) +
      ctaWa('¿No encuentras lo que buscas? Escríbenos.', 'ESCRIBIR POR WHATSAPP', 'Hola, busco una joya que no encuentro en la web.')
  });

  /* ---------------- COLECCIONES ---------------- */
  add({
    slug: 'colecciones', title: 'Colecciones de joyas de acero inoxidable', order: 2,
    excerpt: 'Cuatro colecciones de acero inoxidable para combinar a tu gusto.',
    seoTitle: 'Colecciones de joyas de acero inoxidable | Elanill0',
    seoDesc: 'Colecciones de Elanill0: anillos, collares, pulseras y pendientes de acero inoxidable 316L para hombre y mujer. Envío gratis desde 50 €.',
    content:
      group('wrap', group('cats', categories.map(catCard).join(''))) +
      ctaWa('¿Buscas un regalo? Te ayudamos a elegir.', 'PEDIR AYUDA POR WHATSAPP', 'Hola, busco un regalo de joyería. ¿Me ayudáis a elegir?')
  });

  categories.forEach((c, i) => {
    const others = categories.filter(o => o.slug !== c.slug);
    const min = Math.min(...products.filter(p => p.cat === c.slug && p.price != null).map(p => p.price));
    add({
      slug: c.slug, parent: 'colecciones', title: c.h1, order: i,
      excerpt: c.intro,
      seoTitle: (c.title.length + 11 <= 60) ? `${c.title} | Elanill0` : c.title,
      seoDesc: c.metaTail.replace('{min}', min),
      meta: { categoria_producto: c.slug },
      content:
        group('wrap shop-section',
          group('toolbar', group('chips', others.map(o => paragraph(`<a href="${L(`/colecciones/${o.slug}/`)}">${o.name}</a>`, 'chip')).join(''))) +
          productQuery({ perPage: 50, orderBy: 'menu_order', taxQuery: { 'categoria-producto': [T(c.slug)] } })) +
        group('wrap block', group('seo-text prose', c.body.map(s => heading(2, s.h2) + htmlToBlocks(s.html)).join(''))) +
        group('wrap block', label(`Preguntas frecuentes: ${c.name.toLowerCase()} de acero inoxidable`) + faq(c.faq)) +
        ctaWa(`¿Dudas con tu pedido de ${c.name.toLowerCase()}?`)
    });
  });

  /* ---------------- GUÍAS ---------------- */
  add({
    slug: 'guias', title: 'Guías de joyería de acero inoxidable', order: 3,
    excerpt: 'Todo lo que necesitas saber para elegir y cuidar tus joyas: tallas, largos de cadena, materiales e ideas de regalo.',
    seoTitle: 'Guías de joyería: tallas, cadenas y cuidado | Elanill0',
    seoDesc: 'Guías prácticas de joyería de acero inoxidable: talla de anillo, largo de cadena, cuidado del acero, diferencia con el acero quirúrgico e ideas de regalo.',
    content:
      group('wrap', group('values guides-grid', guides.map(g => group('value',
        heading(2, g.h1) + paragraph(g.lead) + buttons([button('LEER LA GUÍA →', L(`/guias/${g.slug}/`), 'btn-link')]))).join(''))) +
      ctaWa('¿Tienes otra duda sobre tu joya?')
  });
  guides.forEach((g, i) => add({
    slug: g.slug, parent: 'guias', title: g.h1, order: i,
    excerpt: g.lead,
    seoTitle: (g.title.length + 11 <= 60) ? `${g.title} | Elanill0` : g.title,
    seoDesc: g.desc,
    content:
      (g.steps ? group('wrap', group('steps', g.steps.map(([n, t, d]) => group('step', paragraph(n, 'step-n') + heading(2, t) + paragraph(d))).join(''))) : '') +
      group('wrap block guide-body', group('prose', htmlToBlocks(g.html))) +
      group('wrap block', label('Preguntas frecuentes') + faq(g.faq)) +
      group('wrap block', label('Ver joyas de acero inoxidable') + group('chips', (g.related || []).map(s => paragraph(`<a href="${L(`/colecciones/${s}/`)}">${catBy[s].title}</a>`, 'chip')).join(''))) +
      ctaWa('¿Tienes otra duda? Escríbenos.')
  }));

  /* ---------------- SOBRE NOSOTROS ---------------- */
  add({
    slug: 'sobre-nosotros', title: 'Sobre Elanill0, joyas únicas y modernas', order: 4,
    excerpt: 'Una tienda online de joyería de acero inoxidable hecha para llevarse todos los días.',
    seoTitle: 'Sobre Elanill0: joyas de acero inoxidable en Madrid',
    seoDesc: 'Elanill0 es una tienda online de joyas de acero inoxidable con base en Madrid: piezas únicas y modernas, precios honestos y atención directa por WhatsApp.',
    content:
      group('wrap split',
        image(img.promo, 'split-img') +
        group('prose',
          heading(2, 'Quiénes somos') +
          paragraph(`Elanill0 es una tienda online de joyería de acero inoxidable con base en Madrid, España. Seleccionamos <a href="${L('/colecciones/anillos/')}">anillos</a>, <a href="${L('/colecciones/collares/')}">collares</a>, <a href="${L('/colecciones/pulseras/')}">pulseras</a> y <a href="${L('/colecciones/pendientes/')}">pendientes</a> con un diseño actual, para que lleves joyas con estilo sin pagar de más.`) +
          paragraph('Trabajamos con acero inoxidable 316L, el tipo conocido como acero quirúrgico, porque combina lo mejor de dos mundos: el aspecto de una joya y la resistencia que necesitas para llevarla a diario, sin miedo al agua, al sol o al paso del tiempo.') +
          heading(2, 'Cómo trabajamos') +
          paragraph('Aquí no hay carritos complicados: eliges tu pieza, pulsas <strong>«Comprar por WhatsApp»</strong> y hablas directamente con nosotros. Te confirmamos disponibilidad, talla y forma de pago, y acordamos el envío contigo.') +
          buttons([button('VER LA TIENDA', L('/tienda/'), 'btn-dark')]))) +
      group('wrap', group('values',
        group('value', heading(2, 'Acero inoxidable 316L') + paragraph(`Piezas pensadas para el uso diario, fáciles de limpiar y de mantener. Consulta nuestra <a href="${L('/guias/cuidado-del-acero/')}">guía de cuidado</a>.`)) +
        group('value', heading(2, 'Precio honesto') + paragraph(`Joyas con estilo a precios accesibles, con descuentos de hasta el ${MAX_OFF} % y envío gratis en compras de más de 50 €.`)) +
        group('value', heading(2, 'Trato directo') + paragraph('Compras hablando con una persona, no con un formulario. Te asesoramos con la talla, el largo y el regalo ideal.')))) +
      ctaWa('¿Hablamos? Estamos a un mensaje de distancia.')
  });

  /* ---------------- CONTACTO ---------------- */
  const contactFaq = [
    ['¿Cómo compro?', 'Elige tu producto en la tienda y pulsa «Comprar por WhatsApp». Se abrirá una conversación con nosotros con el producto ya indicado: te confirmamos disponibilidad, forma de pago y envío.'],
    ['¿Recibiré el mismo producto que veo en la foto?', 'Sí. Las fotos corresponden al producto que vendemos. Si tienes cualquier duda sobre medidas o acabado, pregúntanos antes de comprar.'],
    ['¿Hacéis envíos?', 'Sí, enviamos a toda España y el envío es gratis en compras de más de 50 €. Consulta los detalles en <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.'],
    ['¿De qué material son las joyas?', 'Todas nuestras joyas son de acero inoxidable 316L, el tipo conocido como acero quirúrgico.'],
    ['¿Puedo cambiar o devolver mi pedido?', 'Sí, dentro de los plazos legales. Lo explicamos en <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.']
  ];
  const ccard = (cls, title, text, linkHtml) => group('ccard ' + cls, heading(2, title) + paragraph(text) + paragraph(linkHtml, 'cc-link'));
  add({
    slug: 'contacto', title: 'Contacto', order: 5,
    excerpt: 'Escríbenos por WhatsApp para comprar o resolver cualquier duda. Te respondemos lo antes posible.',
    seoTitle: 'Contacto y pedidos por WhatsApp | Elanill0',
    seoDesc: 'Contacta con Elanill0: WhatsApp +34 605 505 120, email juam9219@gmail.com y Facebook @elanill0. Pide tus joyas de acero inoxidable por WhatsApp.',
    content:
      group('wrap', group('contact-grid',
        ccard('cc-wa', 'WhatsApp', 'La forma más rápida de comprar y de resolver dudas.', `<a href="${HELLO}" target="_blank" rel="noopener"><strong>+34 605 505 120</strong></a>`) +
        ccard('cc-mail', 'Email', 'Para consultas más largas o con imágenes.', `<a href="mailto:${EMAIL}"><strong>${EMAIL}</strong></a>`) +
        ccard('cc-fb', 'Facebook', 'Síguenos para ver novedades y ofertas.', `<a href="${FB}" target="_blank" rel="noopener"><strong>@elanill0</strong></a>`) +
        ccard('cc-pin', 'Ubicación', 'Tienda online con base en Madrid, España. Atendemos y enviamos a toda España.', '<strong>Madrid, España</strong>'))) +
      group('wrap cform',
        heading(2, 'Escríbenos ahora') +
        paragraph('Cuéntanos qué joya te interesa y, si es un anillo, tu talla. Te respondemos por el canal que prefieras.') +
        buttons([WAB('ESCRIBIR POR WHATSAPP', 'Hola, quisiera información sobre vuestras joyas.', 'btn-dark'), button('ESCRIBIR UN EMAIL', 'mailto:' + EMAIL, 'btn-line')])) +
      group('wrap block', label('Preguntas frecuentes') + faq(contactFaq))
  });

  /* ---------------- LEGALES ---------------- */
  const legal = (slug, title, lead, seoTitle, seoDesc, html, order) => add({ slug, title, order, excerpt: lead, seoTitle, seoDesc, content: group('wrap block legal-body', group('prose', htmlToBlocks(html))) });
  const waLink = (txt) => `<a href="${wa('Hola, quiero hacer un pedido.')}" target="_blank" rel="noopener">${txt}</a>`;
  legal('envios-y-devoluciones', 'Envíos y devoluciones', 'Última actualización: 7 de octubre de 2026.', 'Envíos y devoluciones | Elanill0',
    'Envíos, plazos, cambios y devoluciones en Elanill0: envío gratis en compras de más de 50 €, pedido por WhatsApp y 14 días para desistir.', `
<h2>Cómo se hace un pedido</h2>
<p>Los pedidos se realizan por WhatsApp (${waLink('+34 605 505 120')}) o por email (<a href="mailto:${EMAIL}">${EMAIL}</a>). Te confirmamos la disponibilidad, el precio final, la forma de pago y los gastos de envío antes de cerrar la compra.</p>
<h2>Envíos</h2>
<p>Enviamos a toda España. <strong>El envío es gratis en compras de más de 50 €.</strong> En pedidos de menor importe, el coste y el plazo del envío se acuerdan contigo al confirmar el pedido, en función de tu dirección y del método elegido.</p>
<h2>Cambios y devoluciones</h2>
<p>Dispones de <strong>14 días naturales</strong> desde la recepción del pedido para ejercer tu derecho de desistimiento, sin necesidad de justificación, tal y como establece la normativa de consumidores. El producto debe estar sin usar y en su estado original.</p>
<p>Para iniciar un cambio o una devolución escríbenos por WhatsApp o email indicando tu nombre y el producto. Te explicaremos cómo devolverlo.</p>
<h2>Producto defectuoso o error en el pedido</h2>
<p>Si recibes un producto dañado o distinto al pedido, avísanos cuanto antes con una foto y lo solucionamos.</p>`, 10);
  legal('politica-de-privacidad', 'Política de privacidad', 'Última actualización: 7 de octubre de 2026.', 'Política de privacidad | Elanill0',
    'Cómo trata Elanill0 tus datos personales: qué datos recogemos, para qué los usamos y cómo ejercer tus derechos.', `
<h2>Responsable del tratamiento</h2>
<p>Elanill0 — Madrid, España. Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Qué datos tratamos y para qué</h2>
<p>Solo tratamos los datos que nos facilitas voluntariamente cuando nos escribes por WhatsApp o por email (por ejemplo, tu nombre, teléfono, dirección de envío y los productos que quieres comprar). Los usamos para atender tu consulta, gestionar tu pedido y el envío, y cumplir nuestras obligaciones legales.</p>
<h2>Base legal y conservación</h2>
<p>La base legal es la ejecución de tu pedido o consulta y, en su caso, tu consentimiento. Conservamos los datos el tiempo necesario para atenderte y durante los plazos que exija la ley.</p>
<h2>Destinatarios</h2>
<p>No cedemos tus datos a terceros salvo obligación legal o cuando sea necesario para completar el envío (empresa de transporte). Ten en cuenta que WhatsApp y el correo electrónico son servicios de terceros con sus propias políticas de privacidad.</p>
<h2>Tus derechos</h2>
<p>Puedes acceder, rectificar y suprimir tus datos, así como oponerte a su tratamiento, limitarlo o solicitar su portabilidad, escribiendo a <a href="mailto:${EMAIL}">${EMAIL}</a>. Si crees que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).</p>`, 11);
  legal('terminos-y-condiciones', 'Términos y condiciones', 'Última actualización: 7 de octubre de 2026.', 'Términos y condiciones | Elanill0',
    'Condiciones de uso del sitio web y de compra en Elanill0: pedidos por WhatsApp, precios, disponibilidad y devoluciones.', `
<h2>Titular</h2>
<p>Este sitio web pertenece a Elanill0, tienda online de joyas de acero inoxidable con base en Madrid, España. Contacto: <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>
<h2>Uso del sitio</h2>
<p>El sitio tiene carácter informativo y de catálogo. Al navegar aceptas usarlo de forma lícita y respetuosa. Los contenidos (textos, imágenes y marca) pertenecen a Elanill0 y no pueden reproducirse sin permiso.</p>
<h2>Compras</h2>
<p>Las compras se gestionan por WhatsApp o email. Los precios mostrados son orientativos y pueden cambiar; el precio válido es el que te confirmemos al cerrar el pedido. Los productos están sujetos a disponibilidad.</p>
<h2>Descripción de los productos</h2>
<p>Procuramos que las imágenes y descripciones sean lo más fieles posible. Pueden existir pequeñas diferencias de color por la pantalla o la iluminación.</p>
<h2>Cambios y devoluciones</h2>
<p>Consulta la página de <a href="/envios-y-devoluciones/">Envíos y devoluciones</a>.</p>
<h2>Legislación aplicable</h2>
<p>Estas condiciones se rigen por la legislación española.</p>`, 12);
  legal('politica-de-cookies', 'Política de cookies', 'Última actualización: 7 de octubre de 2026.', 'Política de cookies | Elanill0',
    'Información sobre el uso de cookies en el sitio web de Elanill0: no usamos cookies de seguimiento ni de publicidad.', `
<h2>¿Qué son las cookies?</h2>
<p>Son pequeños archivos que un sitio web guarda en tu navegador para recordar información sobre tu visita.</p>
<h2>Qué cookies usamos</h2>
<p>Este sitio <strong>no utiliza cookies propias ni de terceros</strong> con fines de seguimiento, análisis o publicidad. Las tipografías se sirven desde nuestro propio sitio. Los enlaces a WhatsApp y Facebook te llevan a servicios de terceros con sus propias políticas de privacidad y de cookies.</p>
<h2>Cómo gestionar las cookies</h2>
<p>Puedes borrar o bloquear las cookies desde la configuración de tu navegador en cualquier momento.</p>
<h2>Contacto</h2>
<p>Si tienes preguntas, escríbenos a <a href="mailto:${EMAIL}">${EMAIL}</a>.</p>`, 13);

  /* ---------------- PRODUCTOS (contenido de cada ficha) ---------------- */
  const prods = products.map((p, i) => {
    const cat = catBy[p.cat];
    const body = heading(2, `Descripción de ${p.titleName.charAt(0).toLowerCase() + p.titleName.slice(1)}`) +
      paragraph(p.summary) + p.long.map(t => paragraph(t)).join('') +
      heading(2, 'Características') +
      list(['Material: acero inoxidable 316L (acero quirúrgico)', `Categoría: <a href="${L(`/colecciones/${p.cat}/`)}">${cat.title}</a>`, ...p.details,
        'Envío gratis en compras de más de 50 €, <a href="/envios-y-devoluciones/">envíos y devoluciones</a>']);
    const price = p.price, old = p.oldPrice;
    const fmt = n => n.toFixed(2).replace('.', ',') + ' €';
    const seoDesc = p.price != null
      ? `${p.titleName} por ${String(p.price).replace('.', ',')} € (antes ${String(p.oldPrice).replace('.', ',')} €). ${p.hook} Acero 316L. Compra por WhatsApp.`
      : `${p.titleName}. ${p.hook} Acero 316L. Consulta el precio por WhatsApp.`;
    return {
      slug: p.slug, title: p.name, order: i, excerpt: p.summary, content: body, cat: p.cat,
      seoTitle: (p.titleName.length + 11 <= 60) ? `${p.titleName} | Elanill0` : p.titleName, seoDesc,
      price: p.price, oldPrice: p.oldPrice, optLabel: p.option ? p.option.label : '', optValues: p.option ? p.option.values.join(', ') : '',
      images: p.images, alts: p.alts,
      destacado: [29101, 29156, 29132, 29160].includes(p.id) ? ['mas-vendidos'] : []
    };
  });

  return { pages, products: prods };
}

module.exports = { buildContent, categories, products };
