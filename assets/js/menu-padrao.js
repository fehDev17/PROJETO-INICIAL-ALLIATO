/* Menu hambúrguer padrão (abrir/fechar, marcar a página atual) */
(function () {
  var burger = document.getElementById('pmBurger'), menu = document.getElementById('pmMenu');
  if (!burger || !menu) return;
  function set(open) {
    menu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.querySelector('.pm-i-menu').style.display = open ? 'none' : '';
    burger.querySelector('.pm-i-x').style.display = open ? '' : 'none';
  }
  set(false);
  burger.addEventListener('click', function (e) { e.stopPropagation(); set(menu.hidden); });
  document.getElementById('pmClose').addEventListener('click', function () { set(false); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
  document.addEventListener('click', function (e) { if (!menu.hidden && !e.target.closest('#pmMenu')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  var cur = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (cur === 'materia.html') cur = 'noticias.html';
  Array.prototype.forEach.call(menu.querySelectorAll('li a'), function (a) {
    var h = a.getAttribute('href');
    if (h.indexOf('#') < 0 && h.toLowerCase() === cur) a.classList.add('on');
  });
})();
