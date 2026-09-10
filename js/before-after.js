/* Компаратор «до и после»: ползунок двигает шторку */
(function () {
  document.querySelectorAll('[data-ba]').forEach((root) => {
    const range = root.querySelector('.ba__range');
    const before = root.querySelector('.ba__before');
    const img = before?.querySelector('img');
    if (!range || !before || !img) return;

    function sync() {
      root.style.setProperty('--pos', Number(range.value) + '%');
      img.style.width = root.clientWidth + 'px';   /* картинка не сжимается вместе со шторкой */
    }

    range.addEventListener('input', sync);
    window.addEventListener('resize', sync);
    if (img.complete) sync();
    else img.addEventListener('load', sync, { once: true });
    sync();
  });
})();
