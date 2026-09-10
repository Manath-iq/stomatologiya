/* Плавный скролл и скролл-хореография поверх остальных модулей */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* --- Lenis ------------------------------------------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({
      lerp: 0.16,           /* догоняем колесо почти сразу, без «резинового» хвоста */
      wheelMultiplier: 1.1,
      smoothWheel: true,
      syncTouch: false,     /* на тач-экранах остаётся нативная прокрутка */
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* якорные ссылки — через Lenis, иначе штатно */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    const node = document.querySelector(id);
    if (!node) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(node, { offset: -96, duration: 0.9 });
    else node.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  });

  if (!hasGsap || reduce) return;

  gsap.registerPlugin(ScrollTrigger);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);
  }

  /* --- параллакс галереи ------------------------------- */
  gsap.utils.toArray('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      y: () => Number(el.dataset.parallax),
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
    });
  });

  /* --- линия прогресса под шагами ---------------------- */
  const line = document.querySelector('.steps__line i');
  if (line) {
    gsap.to(line, {
      width: '100%',
      ease: 'none',
      scrollTrigger: { trigger: '.steps__list', start: 'top 70%', end: 'bottom 60%', scrub: 0.4 },
    });
  }

  /* --- вращение колец орбиты --------------------------- */
  gsap.utils.toArray('.orbit__rings span').forEach((ring, i) => {
    gsap.to(ring, {
      rotate: i % 2 ? -24 : 24,
      ease: 'none',
      scrollTrigger: { trigger: '.orbit', start: 'top bottom', end: 'bottom top', scrub: 1 },
    });
  });

  /* --- лёгкий подъём hero при уходе вверх -------------- */
  gsap.to('.hero__media', {
    y: -40,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 },
  });

  /* --- вотермарк выезжает ------------------------------ */
  const wm = document.querySelector('.indications__watermark');
  if (wm) {
    gsap.fromTo(wm, { yPercent: 30 }, {
      yPercent: 6,
      ease: 'none',
      scrollTrigger: { trigger: wm, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
    });
  }
})();
