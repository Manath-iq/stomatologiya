/* Скролл-ревилы и пословное проявление тагллайна */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- обычные ревилы ---------------------------------- */
  const items = document.querySelectorAll('[data-reveal]');
  if (reduce) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const siblings = Array.from(entry.target.parentElement?.children || []);
        const index = siblings.indexOf(entry.target);
        entry.target.style.setProperty('--reveal-delay', Math.min(index, 5) * 70 + 'ms');
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    items.forEach((el) => io.observe(el));
  }

  /* --- пословный тагллайн ------------------------------ */
  document.querySelectorAll('[data-words]').forEach((block) => {
    const words = block.textContent.trim().split(/\s+/);
    block.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      block.append(span, document.createTextNode(' '));
      if (reduce) span.classList.add('is-on');
    });

    if (reduce) return;

    const spans = block.querySelectorAll('.w');
    const wio = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        spans.forEach((span, i) => {
          setTimeout(() => span.classList.add('is-on'), i * 46);
        });
        wio.disconnect();
      });
    }, { threshold: 0.4 });
    wio.observe(block);
  });
})();
