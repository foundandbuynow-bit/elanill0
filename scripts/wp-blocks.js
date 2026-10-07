/* Generadores de marcado de bloques nativos de Gutenberg.
   El HTML de cada bloque estático reproduce exactamente lo que su función save() produce, para que el editor lo acepte sin avisos. */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const json = o => JSON.stringify(o);
const cls = (...c) => c.filter(Boolean).join(' ');

/* core/group · layout "default" => salida siempre <div class="wp-block-group mi-clase"> */
function group(className, inner, o = {}) {
  const attrs = { ...(o.tagName ? { tagName: o.tagName } : {}), ...(o.anchor ? { anchor: o.anchor } : {}), ...(className ? { className } : {}), layout: { type: 'default' } };
  const tag = o.tagName || 'div';
  return `<!-- wp:group ${json(attrs)} -->\n<${tag}${o.anchor ? ` id="${o.anchor}"` : ''} class="${cls('wp-block-group', className)}">${inner}</${tag}>\n<!-- /wp:group -->\n`;
}

function paragraph(html, className, bindings) {
  const attrs = { ...(className ? { className } : {}), ...(bindings ? { metadata: { bindings } } : {}) };
  const a = Object.keys(attrs).length ? ' ' + json(attrs) : '';
  return `<!-- wp:paragraph${a} -->\n<p${className ? ` class="${className}"` : ''}>${html}</p>\n<!-- /wp:paragraph -->\n`;
}

function heading(level, html, className) {
  const attrs = { ...(level !== 2 ? { level } : {}), ...(className ? { className } : {}) };
  const a = Object.keys(attrs).length ? ' ' + json(attrs) : '';
  return `<!-- wp:heading${a} -->\n<h${level} class="${cls('wp-block-heading', className)}">${html}</h${level}>\n<!-- /wp:heading -->\n`;
}

function list(items, ordered = false, className) {
  const tag = ordered ? 'ol' : 'ul';
  const attrs = { ...(ordered ? { ordered: true } : {}), ...(className ? { className } : {}) };
  const lis = items.map(t => `<!-- wp:list-item -->\n<li>${t}</li>\n<!-- /wp:list-item -->`).join('\n');
  return `<!-- wp:list${Object.keys(attrs).length ? ' ' + json(attrs) : ''} -->\n<${tag} class="${cls('wp-block-list', className)}">${lis}</${tag}>\n<!-- /wp:list -->\n`;
}

/* core/image enlazado a la mediateca (atributo id => sustituible con un clic) */
function image(m, className, href) {
  const attrs = { id: m.id, sizeSlug: 'full', linkDestination: href ? 'custom' : 'none', ...(className ? { className } : {}) };
  const img = `<img src="${m.url}" alt="${esc(m.alt || '')}" class="wp-image-${m.id}"/>`;
  return `<!-- wp:image ${json(attrs)} -->\n<figure class="${cls('wp-block-image size-full', className)}">${href ? `<a href="${href}">${img}</a>` : img}</figure>\n<!-- /wp:image -->\n`;
}

/* core/buttons + core/button · la clase del botón va en el contenedor div.wp-block-button */
function button(text, href, className, o = {}) {
  const attrs = { ...(className ? { className } : {}), ...(o.blank ? { linkTarget: '_blank', rel: 'noopener' } : {}), ...(o.bindings ? { metadata: { bindings: o.bindings } } : {}) };
  const a = Object.keys(attrs).length ? ' ' + json(attrs) : '';
  const target = o.blank ? ' target="_blank" rel="noopener"' : '';
  return `<!-- wp:button${a} -->\n<div class="${cls('wp-block-button', className)}"><a class="wp-block-button__link wp-element-button" href="${href}"${target}>${text}</a></div>\n<!-- /wp:button -->`;
}
function buttons(items, className) {
  return `<!-- wp:buttons${className ? ' ' + json({ className }) : ''} -->\n<div class="${cls('wp-block-buttons', className)}">${items.join('\n')}</div>\n<!-- /wp:buttons -->\n`;
}

function separator(className) {
  return `<!-- wp:separator${className ? ' ' + json({ className }) : ''} -->\n<hr class="${cls('wp-block-separator has-alpha-channel-opacity', className)}"/>\n<!-- /wp:separator -->\n`;
}

function table(head, rows) {
  const th = head.map(h => `<th>${h}</th>`).join('');
  const tr = rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<!-- wp:table -->\n<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></figure>\n<!-- /wp:table -->\n`;
}

function details(q, a) {
  return `<!-- wp:details -->\n<details class="wp-block-details"><summary>${q}</summary><!-- wp:paragraph -->\n<p>${a}</p>\n<!-- /wp:paragraph --></details>\n<!-- /wp:details -->\n`;
}
const faq = items => group('faq', items.map(([q, a]) => details(q, a)).join(''));

const shortcode = code => `<!-- wp:shortcode -->\n${code}\n<!-- /wp:shortcode -->\n`;

/* Tarjeta de producto dentro de un bucle de consulta (post-template). Todo son bloques nativos enlazados a los datos del producto. */
const B = key => ({ source: 'elanill0/producto', args: { key } });
function productCard() {
  return group('product',
    group('thumb-wrap',
      `<!-- wp:post-featured-image ${json({ isLink: true, className: 'thumb' })} /-->\n` +
      paragraph('', 'badge', { content: B('descuento') })) +
    `<!-- wp:post-terms ${json({ term: 'categoria-producto', className: 'cat' })} /-->\n` +
    `<!-- wp:post-title ${json({ level: 3, isLink: true, className: 'name' })} /-->\n` +
    group('price', paragraph('', 'price-old', { content: B('precio_antes') }) + paragraph('Consultar precio', 'price-now', { content: B('precio') })) +
    buttons([button('COMPRAR POR WHATSAPP', 'https://wa.me/34605505120', 'btn-wa', { blank: true, bindings: { url: B('whatsapp_url'), text: B('whatsapp_texto') } })], 'btn-wa-wrap')
  );
}

let queryId = 1;
/* core/query: lista de productos (nativa) */
function productQuery({ perPage = 4, orderBy = 'menu_order', order = 'asc', taxQuery, inherit = false, className = '' } = {}) {
  const query = { perPage, pages: 0, offset: 0, postType: 'producto', order, orderBy, author: '', search: '', exclude: [], sticky: '', inherit, ...(taxQuery ? { taxQuery } : {}) };
  const attrs = { ...(inherit ? {} : { queryId: queryId++ }), query, ...(className ? { className } : {}) };
  return `<!-- wp:query ${json(attrs)} -->\n<div class="${cls('wp-block-query', className)}"><!-- wp:post-template ${json({ className: 'products' })} -->\n${productCard()}<!-- /wp:post-template --></div>\n<!-- /wp:query -->\n`;
}

module.exports = { esc, group, paragraph, heading, list, image, button, buttons, separator, table, details, faq, shortcode, productCard, productQuery, json };
