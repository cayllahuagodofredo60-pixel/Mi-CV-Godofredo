(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Tema claro / oscuro (se recuerda si el navegador lo permite) */
  var root = document.documentElement, themeBtn = $('#themeBtn');
  function setTheme(t) {
    root.setAttribute('data-theme', t);
    themeBtn.textContent = t === 'dark' ? '☀' : '☾';
    themeBtn.setAttribute('aria-label', t === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  }
  var saved = null;
  try { saved = localStorage.getItem('cv-theme'); } catch (e) {}
  setTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(t);
    try { localStorage.setItem('cv-theme', t); } catch (e) {}
  });

  /* Menú en móvil */
  var links = $('.links'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('.links a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); });

  /* Texto que cambia en la cabecera */
  var words = ['soporte técnico', 'mantenimiento de PC', 'programación'], wi = 0, ci = 0, del = false, el = $('#rotor');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = words.join(', ');
  } else {
    (function tick() {
      var w = words[wi];
      ci += del ? -1 : 1;
      el.textContent = w.slice(0, ci);
      var wait = del ? 40 : 90;
      if (!del && ci === w.length) { del = true; wait = 1400; }
      else if (del && ci === 0) { del = false; wi = (wi + 1) % words.length; wait = 300; }
      setTimeout(tick, wait);
    })();
  }

  /* Pestañas de habilidades */
  var tabs = $$('.tab'), panels = $$('.panel-skill');
  function showTab(i) {
    tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { p.classList.toggle('on', k === i); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showTab(i); });
    t.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null;
      if (n === null) return;
      n = (n + tabs.length) % tabs.length; showTab(n); tabs[n].focus();
    });
  });

  /* Sección activa en el menú */
  var secs = $$('section[id]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) $$('.links a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* Barra de progreso y botón de subir */
  var bar = $('.progress'), top = $('.top');
  addEventListener('scroll', function () {
    var h = root.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    top.classList.toggle('show', scrollY > 600);
  }, { passive: true });
  top.addEventListener('click', function () { scrollTo({ top: 0 }); });

  /* Copiar correo */
  var copyBtn = $('#copyMail'), msg = $('#msg');
  copyBtn.addEventListener('click', function () {
    var mail = copyBtn.dataset.mail;
    (navigator.clipboard ? navigator.clipboard.writeText(mail) : Promise.reject())
      .then(function () { msg.textContent = 'Correo copiado.'; })
      .catch(function () { msg.textContent = 'No se pudo copiar. Escríbelo así: ' + mail; });
  });

  /* Formulario: abre tu programa de correo con el mensaje listo */
  $('#contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, name = f.nombre.value.trim(), from = f.correo.value.trim(), text = f.mensaje.value.trim();
    var body = text + '\n\nNombre: ' + name + '\nCorreo: ' + from;
    location.href = 'mailto:' + copyBtn.dataset.mail + '?subject=' + encodeURIComponent('Contacto desde tu CV web: ' + name) + '&body=' + encodeURIComponent(body);
    msg.textContent = 'Se abrió tu programa de correo con el mensaje listo para enviar.';
  });

  /* Imprimir y año */
  $('#printBtn').addEventListener('click', function () { print(); });
  $('#year').textContent = new Date().getFullYear();
})();
