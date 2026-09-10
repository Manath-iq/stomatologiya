/* Первый экран проявляется после загрузки шрифтов и портрета */
(function () {
  const slab = document.getElementById('hero-slab');
  if (!slab) return;

  const photo = slab.querySelector('.hero__media img');
  const ready = () => slab.classList.add('is-ready');

  const waits = [document.fonts ? document.fonts.ready : Promise.resolve()];
  if (photo && !photo.complete) {
    waits.push(new Promise((done) => {
      photo.addEventListener('load', done, { once: true });
      photo.addEventListener('error', done, { once: true });
    }));
  }

  /* сколько бы ни грузилось, экран показываем не позже секунды */
  Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, 1000))]).then(() => {
    requestAnimationFrame(ready);
  });
})();
