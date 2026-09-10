/* Горизонтальная лента, которую тянут мышью или пальцем */
(function () {
  document.querySelectorAll('.drag').forEach((root) => {
    const track = root.querySelector('.drag__track');
    if (!track) return;

    let offset = 0;
    let dragging = false;
    let pointerId = null;
    let startX = 0;
    let startOffset = 0;
    let velocity = 0;
    let lastX = 0;
    let raf = null;

    const limit = () => Math.max(track.scrollWidth - root.clientWidth + parseFloat(getComputedStyle(root).paddingRight || 0), 0);
    const clamp = (v) => Math.min(Math.max(v, 0), limit());

    function apply() {
      track.style.transform = 'translate3d(' + -offset + 'px,0,0)';
    }

    function glide() {
      velocity *= 0.92;
      offset = clamp(offset - velocity);
      apply();
      if (Math.abs(velocity) > 0.4) raf = requestAnimationFrame(glide);
      else raf = null;
    }

    root.addEventListener('pointerdown', (e) => {
      if (e.target.closest('a')) return;
      dragging = true;
      pointerId = e.pointerId;
      startX = lastX = e.clientX;
      startOffset = offset;
      velocity = 0;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      root.setPointerCapture(pointerId);
      root.classList.add('is-dragged');
    });

    root.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      velocity = e.clientX - lastX;
      lastX = e.clientX;
      offset = clamp(startOffset - (e.clientX - startX));
      apply();
    });

    function end() {
      if (!dragging) return;
      dragging = false;
      if (pointerId !== null) {
        try { root.releasePointerCapture(pointerId); } catch (_) {}
        pointerId = null;
      }
      if (Math.abs(velocity) > 1) raf = requestAnimationFrame(glide);
    }
    root.addEventListener('pointerup', end);
    root.addEventListener('pointercancel', end);

    root.addEventListener('keydown', (e) => {
      const step = root.querySelector('.drag__track > *')?.offsetWidth || 320;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); offset = clamp(offset - step); apply(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); offset = clamp(offset + step); apply(); root.classList.add('is-dragged'); }
    });

    window.addEventListener('resize', () => { offset = clamp(offset); apply(); });
  });
})();
