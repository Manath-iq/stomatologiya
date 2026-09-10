/* Веерная карусель: карточки идут по дуге и разворачиваются к центру */
(function () {
  const root = document.getElementById('fan');
  if (!root) return;

  const cards = Array.from(root.querySelectorAll('.fan__card'));
  if (!cards.length) return;

  const wide = () => window.innerWidth > 700;
  let STEP = wide() ? 208 : 150;   // расстояние между центрами карточек
  const MAX = () => (cards.length - 1) * STEP;

  let offset = 0;        // текущее положение ленты
  let target = 0;        // куда едем
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startOffset = 0;
  let velocity = 0;
  let lastX = 0;
  let raf = null;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function layout() {
    cards.forEach((card, i) => {
      const t = (i * STEP - offset) / STEP;   // расстояние от центра в шагах
      const abs = Math.abs(t);
      const rot = clamp(t * 7, -34, 34);
      const lift = Math.pow(abs, 1.7) * 22;
      const scale = Math.max(1 - abs * 0.055, 0.7);
      const fade = abs > 3.4 ? 0 : 1;

      card.style.transform =
        'translate3d(' + (t * STEP * 0.86) + 'px,' + lift + 'px,0) rotate(' + rot + 'deg) scale(' + scale + ')';
      card.style.zIndex = String(100 - Math.round(abs * 10));
      card.style.opacity = String(fade);
      card.classList.toggle('is-active', abs < 0.5);
    });
  }

  function tick() {
    const diff = target - offset;
    offset += diff * 0.12;
    if (Math.abs(diff) < 0.4) { offset = target; raf = null; layout(); updateButtons(); return; }
    layout();
    raf = requestAnimationFrame(tick);
  }

  function animate() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function goTo(index) {
    target = clamp(index * STEP, 0, MAX());
    animate();
  }

  function snap() {
    const projected = offset - velocity * 6;
    goTo(Math.round(projected / STEP));
  }

  function currentIndex() {
    return Math.round(target / STEP);
  }

  /* --- указатель --------------------------------------- */
  root.addEventListener('pointerdown', (e) => {
    if (e.target.closest('a')) return;
    dragging = true;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    startOffset = offset;
    velocity = 0;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    root.setPointerCapture(pointerId);
  });

  root.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    velocity = e.clientX - lastX;
    lastX = e.clientX;
    offset = clamp(startOffset - (e.clientX - startX), -STEP * 0.5, MAX() + STEP * 0.5);
    target = offset;
    layout();
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (pointerId !== null) {
      try { root.releasePointerCapture(pointerId); } catch (_) {}
      pointerId = null;
    }
    snap();
  }
  root.addEventListener('pointerup', endDrag);
  root.addEventListener('pointercancel', endDrag);

  /* --- кнопки и клавиатура ----------------------------- */
  const prev = document.querySelector('[data-fan="prev"]');
  const next = document.querySelector('[data-fan="next"]');

  function updateButtons() {
    const i = currentIndex();
    if (prev) prev.disabled = i <= 0;
    if (next) next.disabled = i >= cards.length - 1;
  }

  prev?.addEventListener('click', () => goTo(currentIndex() - 1));
  next?.addEventListener('click', () => goTo(currentIndex() + 1));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(currentIndex() - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(currentIndex() + 1); }
  });

  /* --- ресайз ------------------------------------------ */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const i = currentIndex();
      STEP = wide() ? 208 : 150;
      offset = target = clamp(i * STEP, 0, MAX());
      layout();
    }, 150);
  });

  /* стартуем с середины, чтобы веер был симметричным */
  offset = target = Math.round((cards.length - 1) / 2) * STEP;
  layout();
  updateButtons();
})();
