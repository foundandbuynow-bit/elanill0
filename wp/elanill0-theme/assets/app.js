/* Elanill0 · comportamiento mínimo del tema (sin dependencias).
   Selecciona por clase, nunca por id de bloque. Nada de lo editable se inyecta: solo se alternan clases y atributos. */
(function () {
  'use strict';
  var WA = '34605505120';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Tienda: filtros por categoría ---------- */
  var chips = $$('.toolbar .chip[class*="chip-"]');
  var grid = $('.shop-grid');
  if (chips.length && grid) {
    var items = $$('li.wp-block-post', grid);
    var show = function (slug) {
      items.forEach(function (li) {
        li.hidden = !(slug === 'todos' || li.classList.contains('categoria-producto-' + slug));
      });
      chips.forEach(function (c) { c.classList.toggle('is-active', c.classList.contains('chip-' + slug)); c.setAttribute('aria-pressed', String(c.classList.contains('chip-' + slug))); });
    };
    chips.forEach(function (c) {
      var m = c.className.match(/chip-([a-z-]+)/);
      if (!m) return;
      c.setAttribute('role', 'button');
      c.setAttribute('tabindex', '0');
      var go = function () { show(m[1]); };
      c.addEventListener('click', go);
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var q = new URLSearchParams(location.search).get('categoria');
    show(q || 'todos');
  }

  /* ---------- Ficha de producto: opción + cantidad -> mensaje de WhatsApp ---------- */
  var buy = $('#buy');
  if (buy) {
    var opt = $('#opt');
    var qty = $('#qty');
    var update = function () {
      var t = 'Hola, quiero comprar: ' + buy.dataset.name;
      if (opt && opt.value) t += ' (' + opt.dataset.label + ': ' + opt.value + ')';
      if (qty && +qty.value > 1) t += ' x' + qty.value;
      if (buy.dataset.price) t += ' - ' + buy.dataset.price;
      buy.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t);
    };
    if (opt) opt.addEventListener('change', update);
    if (qty) qty.addEventListener('input', update);
    update();
  }

  /* ---------- Ficha de producto: galería ---------- */
  var mainFig = $('.gallery-main');
  var mainImg = mainFig && $('img', mainFig);
  if (mainImg) {
    $$('.gallery-thumbs button').forEach(function (b) {
      b.addEventListener('click', function () {
        mainImg.removeAttribute('srcset');
        mainImg.removeAttribute('sizes');
        mainImg.src = b.dataset.src;
        $$('.gallery-thumbs button').forEach(function (o) { o.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
      });
    });
  }
})();
