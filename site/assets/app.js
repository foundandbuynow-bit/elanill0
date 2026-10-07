/* Elanill0 · comportamiento mínimo del sitio escaparate (sin dependencias) */
(function () {
  'use strict';
  var WA = '34605505120';
  var EMAIL = 'juam9219@gmail.com';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var norm = function (s) { return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };

  /* ---------- Tienda: filtros, orden y búsqueda ---------- */
  var grid = $('#shop-grid');
  if (grid) {
    var cards = $$('.product', grid);
    var params = new URLSearchParams(location.search);
    var state = { cat: params.get('cat') || 'todos', q: params.get('q') || '', sort: params.get('orden') || 'relevancia' };
    var chips = $$('.chip[data-cat]');
    var sortSel = $('#sort');
    var count = $('#count');
    var empty = $('#empty');
    var qInput = $('.search input[name="q"]');
    if (qInput && state.q) qInput.value = state.q;
    if (sortSel) sortSel.value = state.sort;

    var render = function () {
      var shown = 0;
      cards.forEach(function (c) {
        var okCat = state.cat === 'todos' || c.dataset.cat === state.cat;
        var okQ = !state.q || norm(c.dataset.name + ' ' + c.dataset.cat).indexOf(norm(state.q)) !== -1;
        var show = okCat && okQ;
        c.hidden = !show;
        if (show) shown++;
      });
      var order = cards.slice();
      if (state.sort === 'precio-asc') order.sort(function (a, b) { return (+a.dataset.price || 1e9) - (+b.dataset.price || 1e9); });
      if (state.sort === 'precio-desc') order.sort(function (a, b) { return (+b.dataset.price || -1) - (+a.dataset.price || -1); });
      if (state.sort === 'relevancia') order.sort(function (a, b) { return +a.dataset.pos - +b.dataset.pos; });
      order.forEach(function (c) { grid.appendChild(c); });
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.dataset.cat === state.cat)); });
      if (count) count.textContent = shown + (shown === 1 ? ' producto' : ' productos');
      if (empty) empty.hidden = shown !== 0;
    };
    chips.forEach(function (ch) {
      ch.addEventListener('click', function () { state.cat = ch.dataset.cat; render(); });
    });
    if (sortSel) sortSel.addEventListener('change', function () { state.sort = sortSel.value; render(); });
    render();
  }

  /* ---------- Ficha de producto ---------- */
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
  var main = $('#gallery-main');
  if (main) {
    $$('.gallery-thumbs button').forEach(function (b) {
      b.addEventListener('click', function () {
        main.src = b.dataset.src;
        $$('.gallery-thumbs button').forEach(function (o) { o.setAttribute('aria-current', 'false'); });
        b.setAttribute('aria-current', 'true');
      });
    });
  }

  /* ---------- Contacto ---------- */
  var cf = $('#contact-form');
  if (cf) {
    var compose = function () {
      var d = new FormData(cf);
      var name = (d.get('nombre') || '').toString().trim();
      var topic = (d.get('motivo') || '').toString();
      var msg = (d.get('mensaje') || '').toString().trim();
      return { name: name, topic: topic, msg: msg, text: 'Hola, soy ' + (name || '...') + '. Motivo: ' + topic + '.\n' + msg };
    };
    var ok = function () {
      if (!cf.reportValidity()) return null;
      return compose();
    };
    $('#send-wa').addEventListener('click', function () {
      var c = ok(); if (!c) return;
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(c.text), '_blank', 'noopener');
    });
    $('#send-mail').addEventListener('click', function () {
      var c = ok(); if (!c) return;
      location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Consulta: ' + c.topic) + '&body=' + encodeURIComponent(c.text);
    });
  }
})();
