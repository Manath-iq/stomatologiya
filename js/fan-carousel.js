/* Веерная карусель: карточки идут по дуге и повторяются по кругу без конца */
(function () {
  const root = document.getElementById('fan');
  if (!root) return;

  const list = root.querySelector('.fan__list');
  const originals = Array.from(root.querySelectorAll('.fan__card'));
  if (!originals.length) return;

  /* дублируем набор, пока карточек не хватит на полный круг:
     так место, где лента смыкается, всегда остаётся за кадром */
  const MIN_CARDS = 12;
  while (list.children.length < MIN_CARDS) {
    originals.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
      list.append(clone);
    });
  }

  const cards = Array.from(list.children);
  const wide = () => window.innerWidth > 900;
  const mid = () => window.innerWidth > 620;

  let STEP = wide() ? 250 : mid() ? 200 : 160;
  const span = () => cards.length * STEP;

  let offset = 0;
  let target = 0;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startOffset = 0;
  let velocity = 0;
  let lastX = 0;
  let raf = null;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  /* расстояние до центра с заворотом по кругу */
  function wrap(delta) {
    const total = span();
    const half = total / 2;
    return ((delta + half) % total + total) % total - half;
  }

  function layout() {
    cards.forEach((card, i) => {
      const t = wrap(i * STEP - offset) / STEP;
      const abs = Math.abs(t);
      const rot = clamp(t * 7, -34, 34);
      const lift = Math.pow(abs, 1.6) * 18;
      const scale = Math.max(1 - abs * 0.055, 0.7);
      const fade = abs > 3.2 ? 0 : abs > 2.5 ? (3.2 - abs) / 0.7 : 1;

      card.style.transform =
        'translate3d(' + (t * STEP * 0.86) + 'px,' + lift + 'px,0) rotate(' + rot + 'deg) scale(' + scale + ')';
      card.style.zIndex = String(100 - Math.round(abs * 10));
      card.style.opacity = String(fade);
      card.style.pointerEvents = fade < 0.4 ? 'none' : '';
      card.classList.toggle('is-active', abs < 0.5);
    });
  }

  function tick() {
    const diff = target - offset;
    offset += diff * 0.14;
    if (Math.abs(diff) < 0.4) { offset = target; raf = null; layout(); return; }
    layout();
    raf = requestAnimationFrame(tick);
  }

  function animate() {
    if (!raf) raf = requestAnimationFrame(tick);
  }

  function step(dir) {
    target = Math.round(target / STEP) * STEP + dir * STEP;
    animate();
  }

  function snap() {
    const projected = offset - velocity * 6;
    target = Math.round(projected / STEP) * STEP;
    animate();
  }

  /* --- перетаскивание ---------------------------------- */
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
    offset = startOffset - (e.clientX - startX);
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
  document.querySelector('[data-fan="prev"]')?.addEventListener('click', () => step(-1));
  document.querySelector('[data-fan="next"]')?.addEventListener('click', () => step(1));

  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  { e.preventDefault(); step(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  /* --- ресайз ------------------------------------------ */
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const index = Math.round(target / STEP);
      STEP = wide() ? 250 : mid() ? 200 : 160;
      offset = target = index * STEP;
      layout();
    }, 150);
  });

  layout();
})();
