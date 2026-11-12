'use strict';

// Refactored from the supplied FIXLAB source. No requests or persistent storage.
(() => {
  const menu = document.getElementById('menuBtn');
  const links = document.getElementById('nav-links');
  function closeMenu(restoreFocus = false) {
    links.classList.remove('is-open');
    menu.setAttribute('aria-expanded', 'false');
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener('click', () => {
    const opened = links.classList.toggle('is-open');
    menu.setAttribute('aria-expanded', String(opened));
  });
  links.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-nav')) closeMenu();
  });
  window.matchMedia('(min-width: 651px)').addEventListener('change', () => closeMenu());
  menu.hidden = false;

  // Original inputs, prices and tablet coefficient, with the original rounding.
  const device = document.getElementById('device');
  const repair = document.getElementById('repair');
  const output = document.getElementById('estimatePrice');
  const prices = { screen: 2490, battery: 1990, charging: 1490, diagnostics: 500 };
  const formatter = new Intl.NumberFormat('ru-RU');
  function update() {
    const coefficient = device.value === 'tablet' ? 1.5 : 1;
    output.textContent = formatter.format(Math.round(prices[repair.value] * coefficient / 10) * 10) + ' ₽';
    document.getElementById('estimateBase').textContent = formatter.format(prices[repair.value]) + ' ₽';
    document.getElementById('estimateCoefficient').textContent = '× ' + formatter.format(coefficient);
  }
  [device, repair].forEach((el) => {
    el.addEventListener('change', update);
    el.disabled = false;
  });
  update();
  document.querySelectorAll('[data-repair]').forEach((link) => {
    link.addEventListener('click', () => { repair.value = link.dataset.repair; update(); });
  });

  // Original lead form IDs and native validation, without personal-data inputs.
  const form = document.getElementById('leadForm');
  const feedback = document.getElementById('leadFeedback');
  const leadDevice = document.getElementById('leadDevice');
  const leadIssue = document.getElementById('leadIssue');
  function clearFeedback() { feedback.textContent = ''; }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const selectedDevice = leadDevice.selectedOptions[0].textContent;
    const selectedIssue = leadIssue.selectedOptions[0].textContent;
    feedback.textContent = 'Демосценарий проверен: ' + selectedDevice.toLowerCase() + ' — ' + selectedIssue.toLowerCase() + '. В реальной мастерской дальше уточнили бы модель и согласовали диагностику. Заявка не отправлена, данные не сохранены.';
  });
  form.addEventListener('input', clearFeedback);
  form.addEventListener('change', clearFeedback);
  document.getElementById('estimateContact').addEventListener('click', () => {
    leadDevice.value = device.value;
    leadIssue.value = repair.value;
    clearFeedback();
  });
  document.getElementById('leadFields').disabled = false;

  // Added illustration gallery: native modal, explicit keyboard loop and return focus.
  const lightbox = document.getElementById('lightbox');
  if (typeof lightbox.showModal !== 'function') return;
  const gallery = Array.from(document.querySelectorAll('.gallery-item'));
  let activeImage = 0;
  let galleryTrigger = null;
  function showImage(index) {
    activeImage = (index + gallery.length) % gallery.length;
    const item = gallery[activeImage];
    const image = document.getElementById('lightboxImage');
    image.src = item.dataset.image;
    image.alt = item.querySelector('img').alt;
    document.getElementById('lightboxCaption').textContent = (activeImage + 1) + ' / ' + gallery.length + ' — ' + item.dataset.caption;
  }
  gallery.forEach((item, index) => {
    item.addEventListener('click', () => {
      galleryTrigger = item;
      showImage(index);
      lightbox.showModal();
      document.body.style.overflow = 'hidden';
    });
    item.disabled = false;
  });
  document.getElementById('galleryHint').hidden = false;
  document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  document.querySelector('.lightbox-prev').addEventListener('click', () => showImage(activeImage - 1));
  document.querySelector('.lightbox-next').addEventListener('click', () => showImage(activeImage + 1));
  lightbox.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      const buttons = Array.from(lightbox.querySelectorAll('button:not([disabled])'))
        .filter((button) => button.getClientRects().length > 0);
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !lightbox.contains(document.activeElement))) {
        event.preventDefault();
        first?.focus();
      }
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(activeImage + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      const rect = lightbox.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) lightbox.close();
    }
  });
  lightbox.addEventListener('close', () => {
    document.body.style.overflow = '';
    galleryTrigger?.focus({ preventScroll: true });
  });
})();
