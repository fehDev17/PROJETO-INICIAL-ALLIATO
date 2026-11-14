/* ALIATTO · Página inicial: interações (html/index.html) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ico = function (id, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '"><use href="#i-' + id + '"/></svg>'; };

  /* ---------- cabeçalho: fundo ao rolar + botão voltar ao topo ---------- */
  var head = $('#hmHead'), up = $('#hmUp'), wx = $('#hmWx'), prog = $('#hmProg');
  function onScroll() {
    var y = window.pageYOffset || root.scrollTop;
    head.classList.toggle('is-solid', y > 40);
    up.classList.toggle('show', y > 300);
    var h = root.scrollHeight - window.innerHeight;
    if (prog) prog.style.setProperty('--p', h > 0 ? Math.min(y / h, 1).toFixed(4) : 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- menu suspenso ---------- */
  var burger = $('#hmBurger'), menu = $('#hmMenu');
  function setMenu(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.innerHTML = ico(open ? 'x' : 'menu');
  }
  burger.addEventListener('click', function (e) { e.stopPropagation(); setMenu(menu.hidden); });
  $('#hmMenuClose').addEventListener('click', function () { setMenu(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('#hmMenu')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); closeWx(); } });

  /* ---------- revelar ao rolar + contadores ---------- */
  function countUp(el) {
    var t = parseInt(el.getAttribute('data-target'), 10) || 0, s = null, dur = 1400;
    function step(ts) {
      if (s === null) s = ts;
      var p = Math.min((ts - s) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(t * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var seen = function (el) {
    el.classList.add('in');
    setTimeout(function () { el.classList.add('rv-done'); }, 1400);
    $$('.count', el).forEach(countUp);
  };
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { seen(e.target); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    $$('.rv').forEach(function (el) { io.observe(el); });
  } else { $$('.rv').forEach(seen); }

  /* ---------- animações: partículas, parallax, orbes, escalonamento ---------- */
  var still = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var parts = $('#heroParts');
  var hero = $('.hm-hero');
  if (hero && !still) {
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - .5).toFixed(3));
      hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - .5).toFixed(3));
    });
  }
  $$('.hm-sec').forEach(function (sec) {
    if (sec.querySelector('.hm-orb')) return;
    sec.style.position = sec.style.position || 'relative';
    ['o1', 'o2'].forEach(function (c) { var o = d.createElement('i'); o.className = 'hm-orb ' + c; o.setAttribute('aria-hidden', 'true'); sec.insertBefore(o, sec.firstChild); });
  });
  $$('.hm-sec').forEach(function (sec) {
    $$('.rv', sec).forEach(function (el, k) { if (!el.style.getPropertyValue('--d')) el.style.setProperty('--d', (k % 6) * 80 + 'ms'); });
  });

  /* ---------- clima (Open-Meteo, sem chave) ---------- */
  var wxBtn = $('#hmWxBtn'), wxPanel = $('#hmWxPanel');
  var WI = [[0, 'sun', 'Céu limpo'], [2, 'cloud-sun', 'Parcialmente nublado'], [3, 'cloud', 'Nublado'], [48, 'cloud-fog', 'Neblina'], [57, 'cloud-rain', 'Garoa'], [67, 'cloud-rain', 'Chuva'], [77, 'cloud', 'Neve'], [82, 'cloud-rain', 'Pancadas de chuva'], [86, 'cloud', 'Neve'], [99, 'cloud-bolt', 'Tempestade']];
  var wc = function (c) { for (var i = 0; i < WI.length; i++) if (c <= WI[i][0]) return WI[i]; return WI[9]; };
  var loc = { lat: -15.78, lon: -47.93, n: 'Brasília, DF' };
  try { var sv = JSON.parse(localStorage.getItem('al_wx')); if (sv && sv.lat) loc = sv; } catch (e) { }
  var dia = function (t) { return new Date(t + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''); };
  function closeWx() { wxPanel.hidden = true; wxBtn.setAttribute('aria-expanded', 'false'); }
  function loadWx() {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=4';
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      var c = j.current, dd = j.daily, w = wc(c.weather_code);
      wxBtn.innerHTML = ico(w[1]) + '<b>' + Math.round(c.temperature_2m) + '°C</b><span>' + esc(loc.n) + '</span>' + ico('chev-d', 'chev');
      wxPanel.innerHTML =
        '<div class="wx-now">' + ico(w[1]) + '<div><b>' + Math.round(c.temperature_2m) + '°C</b><span>' + w[2] + ' · ' + esc(loc.n) + '</span></div></div>' +
        '<div class="wx-meta"><span>Sensação ' + Math.round(c.apparent_temperature) + '°</span><span>Umidade ' + c.relative_humidity_2m + '%</span><span>Vento ' + Math.round(c.wind_speed_10m) + ' km/h</span></div>' +
        '<div class="wx-days">' + dd.time.map(function (t, i) {
          return '<div><small>' + (i ? dia(t) : 'Hoje') + '</small>' + ico(wc(dd.weather_code[i])[1]) + '<b>' + Math.round(dd.temperature_2m_max[i]) + '°</b><span>' + Math.round(dd.temperature_2m_min[i]) + '°</span><em>' + (dd.precipitation_probability_max ? dd.precipitation_probability_max[i] : 0) + '%</em></div>';
        }).join('') + '</div>' +
        '<button type="button" class="wx-loc" id="hmWxLoc">' + ico('pin') + 'Usar minha localização</button><small class="wx-src">Dados: Open-Meteo</small>';
      var lb = $('#hmWxLoc');
      lb.onclick = function () {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(function (g) {
          loc = { lat: g.coords.latitude, lon: g.coords.longitude, n: 'Sua localização' };
          try { localStorage.setItem('al_wx', JSON.stringify(loc)); } catch (e) { }
          loadWx();
        }, function () { lb.textContent = 'Não foi possível obter a localização'; });
      };
    }).catch(function () { wxBtn.innerHTML = ico('cloud') + '<span>Clima indisponível</span>'; });
  }
  wxBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = wxPanel.hidden;
    wxPanel.hidden = !open;
    wxBtn.setAttribute('aria-expanded', String(open));
  });
  d.addEventListener('click', function (e) { if (!e.target.closest('#hmWx')) closeWx(); });
  loadWx();

  /* ---------- depoimentos (carrossel) ---------- */
  var T = [
    { n: 'Paulo Washington', d: '02/08/2023', t: 'Ótimo atendimento. O profissional <strong>Leonardo</strong> muito atencioso e me deu <strong>suporte em todo processo das minhas</strong> questões pessoais e do meu negócio.' },
    { n: 'Tiago Leandro Minervino G.', d: '02/08/2023', t: 'Profissionais extremamente ágeis, respostas rápidas, atendimento excelente. <strong>Recomendo!</strong>' },
    { n: 'Randerson Rocha Rodrigues', d: '02/08/2023', t: 'Muito profissional, principalmente o Léo é um <strong>excelente contador</strong> que <strong>tirou todas as dúvidas</strong> e a praticidade que teve foi indescritível!' }
  ];
  var track = $('#dpTrack'), dots = $('#dpDots'), start = 0, per = 3, dir = 'next';
  var ini = function (n) { return n.split(' ').slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); };
  var stars = '<ul class="stars" aria-label="Avaliação 5 de 5">' + new Array(6).join('<li>' + ico('star', 'f') + '</li>') + '</ul>';
  function perPage() { return window.innerWidth < 992 ? 1 : 3; }
  function drawDots() {
    dots.innerHTML = T.map(function (_, i) { return '<button type="button" role="tab" aria-label="Depoimento ' + (i + 1) + '" class="' + (i === start ? 'on' : '') + '" data-i="' + i + '"></button>'; }).join('');
  }
  function drawT() {
    var html = '';
    for (var i = 0; i < per; i++) {
      var it = T[(start + i) % T.length];
      var mid = per === 3 ? i === 1 : true;
      html += '<article class="dp-card' + (mid ? ' mid' : '') + '">' +
        (mid ? '<span class="dp-badge">' + ico('gem') + 'CLIENTE EM DESTAQUE</span>' : '') +
        '<svg class="qm" aria-hidden="true"><use href="#i-quote"/></svg>' +
        '<div>' + stars + '<p>' + it.t + '</p></div>' +
        '<div class="dp-who"><span class="dp-av">' + esc(ini(it.n)) + '</span><div><b>' + esc(it.n) + '</b><small>Cliente Aliatto<br>' + it.d + '</small></div></div></article>';
    }
    track.innerHTML = html;
    drawDots();
    requestAnimationFrame(function () {
      $$('.dp-card', track).forEach(function (c, i) { setTimeout(function () { c.classList.add('in'); }, 60 + i * 90); });
    });
  }
  function go(step) { start = (start + step + T.length) % T.length; drawT(); }
  $('#dpPrev').addEventListener('click', function () { go(-1); });
  $('#dpNext').addEventListener('click', function () { go(1); });
  dots.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { start = +b.dataset.i; drawT(); } });
  var tx = 0;
  track.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', function (e) { var df = tx - e.changedTouches[0].clientX; if (Math.abs(df) > 40) go(df > 0 ? 1 : -1); });
  window.addEventListener('resize', function () { var p = perPage(); if (p !== per) { per = p; drawT(); } });
  per = perPage(); drawT();
  var auto = setInterval(function () { if (!d.hidden && !track.matches(':hover')) go(1); }, 7000);
  window.addEventListener('pagehide', function () { clearInterval(auto); });

  /* ---------- planos: mensal / anual ---------- */
  var money = function (v) { return v.toFixed(2).replace('.', ','); };
  $$('.toggle button').forEach(function (b) {
    b.addEventListener('click', function () {
      var annual = b.dataset.bill === 'a';
      $$('.toggle button').forEach(function (x) { var on = x === b; x.classList.toggle('on', on); x.setAttribute('aria-selected', String(on)); });
      $$('.pl-card').forEach(function (c) {
        var p = parseFloat(c.dataset.price), o = c.dataset.old ? parseFloat(c.dataset.old) : 0;
        var val = $('.val', c), old = $('.old', c), em = $('.pl-price em', c), off = $('.off', c);
        if (annual) {
          val.textContent = money(p * 0.8);
          old.hidden = false; old.textContent = 'R$' + money(p);
          em.textContent = '/mês no anual';
          if (off) off.textContent = '20% OFF';
        } else {
          val.textContent = money(p);
          if (o) { old.hidden = false; old.textContent = 'R$' + money(o); } else old.hidden = true;
          em.textContent = '/mês';
          if (off) off.textContent = '18% OFF';
        }
      });
    });
  });

  /* ---------- FAQ (acordeão) ---------- */
  $$('.fq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.parentNode, open = !item.classList.contains('open');
      $$('.fq-item').forEach(function (it) {
        var o = it === item ? open : false;
        it.classList.toggle('open', o);
        var b = $('.fq-q', it);
        b.setAttribute('aria-expanded', String(o));
        $('.tg use', it).setAttribute('href', o ? '#i-minus' : '#i-plus');
      });
    });
  });

  /* ---------- novidades (usa as matérias publicadas no painel) ---------- */
  var newsBox = $('#hmNews');
  var fmt = function (s) { return new Date(s + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); };
  function drawNews() {
    var all = [];
    try { all = (window.ALnews ? window.ALnews() : window.AL_SEED || []); } catch (e) { all = window.AL_SEED || []; }
    var l = all.filter(function (n) { return n.status !== 'rascunho'; }).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    if (!l.length) { newsBox.innerHTML = '<p style="grid-column:1/-1;color:#5a6a8a">Em breve, novas matérias por aqui.</p>'; return; }
    var img = function (n) { return esc(n.img || '../assets/images/portfolio/contabilidade2.jpeg'); };
    var url = function (n) { return (location.pathname.indexOf('/html/') > -1 ? '' : 'html/') + 'materia.html?id=' + encodeURIComponent(n.id); };
    var a = l[0];
    newsBox.innerHTML =
      '<a class="nw-lead" href="' + url(a) + '"><img src="' + img(a) + '" alt="" loading="lazy"><span class="nw-badge">DESTAQUE</span>' +
      '<span class="cat">' + esc(a.cat) + '</span><h3>' + esc(a.title) + '</h3><p>' + esc(a.sub) + '</p>' +
      '<div class="nw-foot"><span class="nw-date">' + ico('calendar') + fmt(a.date) + '</span><span class="nw-more">Ler mais<i>' + ico('arrow-r') + '</i></span></div></a>' +
      '<div class="nw-list">' + l.slice(1, 4).map(function (n) {
        return '<a class="nw-row" href="' + url(n) + '"><img src="' + img(n) + '" alt="" loading="lazy"><div><span class="cat">' + esc(n.cat) + '</span><h4>' + esc(n.title) + '</h4><span class="nw-date">' + ico('calendar') + fmt(n.date) + '</span></div><i class="go">' + ico('arrow-r') + '</i></a>';
      }).join('') + '</div>';
  }
  drawNews();
  /* aliatto.js escreve no #home-news depois de consultar o servidor: redesenha com os dados atualizados */
  var sink = $('#home-news');
  if (sink && 'MutationObserver' in window) {
    new MutationObserver(function () { drawNews(); }).observe(sink, { childList: true });
  }

  /* ---------- formulário de contato (abre o WhatsApp, como na página Contato) ---------- */
  var form = $('#hmForm'), msg = $('#f-msg'), cnt = $('#f-cnt'), err = $('#f-err');
  msg.addEventListener('input', function () { cnt.textContent = msg.value.length + '/500'; });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var nome = $('#f-nome'), mail = $('#f-mail'), emp = $('#f-emp'), bad = [];
    [nome, mail, msg].forEach(function (f) { f.closest('.fld').classList.remove('bad'); });
    if (!nome.value.trim()) bad.push(nome);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value.trim())) bad.push(mail);
    if (!msg.value.trim()) bad.push(msg);
    if (bad.length) {
      bad.forEach(function (f) { f.closest('.fld').classList.add('bad'); });
      err.textContent = 'Preencha os campos obrigatórios (*) com dados válidos.'; err.hidden = false; bad[0].focus(); return;
    }
    err.hidden = true;
    var t = 'Olá, ALIATTO! Meu nome é ' + nome.value.trim() + '.\n' +
      (emp.value.trim() ? 'Empresa: ' + emp.value.trim() + '\n' : '') +
      'E-mail: ' + mail.value.trim() + '\n\n' + msg.value.trim();
    window.open('https://wa.me/5561993140268?text=' + encodeURIComponent(t), '_blank', 'noopener');
  });
})();
