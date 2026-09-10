/* Форма записи: маска телефона и валидация на стороне клиента */
(function () {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const ok = document.getElementById('form-ok');
  const tel = form.querySelector('#f-tel');
  const name = form.querySelector('#f-name');
  const agree = form.querySelector('[name="agree"]');
  const submit = form.querySelector('.form__submit');

  /* --- маска ------------------------------------------- */
  function mask(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7')) digits = '7' + digits;
    digits = digits.slice(0, 11);

    const p = digits.slice(1);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ') ' + p.slice(3, 6);
    if (p.length >= 6) out += '-' + p.slice(6, 8);
    if (p.length >= 8) out += '-' + p.slice(8, 10);
    return out;
  }

  tel.addEventListener('input', () => { tel.value = mask(tel.value); clearError(tel); });
  tel.addEventListener('focus', () => { if (!tel.value) tel.value = '+7 ('; });

  /* --- ошибки ------------------------------------------ */
  function showError(field, message) {
    const box = form.querySelector('[data-err-for="' + (field.id || field.name) + '"]');
    field.setAttribute('aria-invalid', 'true');
    if (box) box.textContent = message;
  }
  function clearError(field) {
    const box = form.querySelector('[data-err-for="' + (field.id || field.name) + '"]');
    field.removeAttribute('aria-invalid');
    if (box) box.textContent = '';
  }

  name.addEventListener('input', () => clearError(name));
  agree.addEventListener('change', () => clearError(agree));

  /* --- отправка ---------------------------------------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = null;

    if (name.value.trim().length < 2) {
      showError(name, 'Напишите имя, чтобы администратор знал, к кому обращаться');
      bad = bad || name;
    }
    if (tel.value.replace(/\D/g, '').length !== 11) {
      showError(tel, 'Номер неполный. Формат: +7 (843) 216-48-30');
      bad = bad || tel;
    }
    if (!agree.checked) {
      showError(agree, 'Без согласия на обработку данных мы не сможем вам перезвонить');
      bad = bad || agree;
    }
    if (bad) { bad.focus(); return; }

    submit.classList.add('is-loading');
    submit.querySelector('span').textContent = 'Отправляем';

    /* демонстрационный макет: заявка никуда не уходит */
    setTimeout(() => {
      submit.classList.remove('is-loading');
      submit.querySelector('span').textContent = 'Записаться на приём';
      form.reset();
      if (ok) {
        ok.hidden = false;
        ok.focus?.();
      }
    }, 700);
  });
})();
