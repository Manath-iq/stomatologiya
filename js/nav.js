/* Island nav: скрытие при скролле вниз, мобильное меню, активный пункт */
(function () {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  const sticky = document.getElementById('sticky');
  if (!nav) return;

  /* --- скрытие навбара --------------------------------- */
  let last = window.scrollY;
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const down = y > last && y > 240;
    nav.classList.toggle('is-hidden', down && !menu.classList.contains('is-open'));
    if (sticky) {
      sticky.hidden = false;
      sticky.classList.toggle('is-in', y > 900 && !isFooterVisible());
    }
    last = y;
    ticking = false;
  }

  function isFooterVisible() {
    const f = document.getElementById('booking');
    if (!f) return false;
    return f.getBoundingClientRect().top < window.innerHeight * 0.9;
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  /* --- мобильное меню ---------------------------------- */
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    document.body.classList.toggle('is-locked', open);
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add('is-open'));
    } else {
      menu.classList.remove('is-open');
      setTimeout(() => { menu.hidden = true; }, 460);
    }
  }

  burger?.addEventListener('click', () => {
    setMenu(burger.getAttribute('aria-expanded') !== 'true');
  });
  menu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  /* --- активный пункт ---------------------------------- */
  const links = Array.from(document.querySelectorAll('.nav__links a'));
  const targets = links
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (targets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => {
          const on = a.getAttribute('href') === '#' + entry.target.id;
          if (on) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach((t) => spy.observe(t));
  }
})();
