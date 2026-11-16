(() => {
  const translations = window.PlaytTranslations;
  const selector = document.querySelector('#language-select');
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  const status = document.querySelector('.copy-status');
  const storageKey = 'playtstudio-language';
  let locale = 'ko';
  let copyAttempt = 0;
  const supported = (value) => Object.hasOwn(translations, value || '');

  function detectLanguage() {
    const requested = new URL(window.location.href).searchParams.get('lang');
    if (supported(requested)) return requested;
    try {
      const saved = localStorage.getItem(storageKey);
      if (supported(saved)) return saved;
    } catch { /* The site remains usable when storage is unavailable. */ }
    for (const language of navigator.languages || [navigator.language]) {
      const base = language.toLowerCase().split('-')[0];
      if (base === 'zh') return 'zh-TW';
      if (supported(base)) return base;
    }
    return 'ko';
  }

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', translations[locale].menuOpen);
    navigation.classList.remove('open');
  }

  function applyLanguage(next, updateUrl = false) {
    locale = supported(next) ? next : 'ko';
    const copy = translations[locale];
    document.documentElement.lang = locale;
    document.title = copy.pageTitle;
    selector.value = locale;
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      element.textContent = copy[element.dataset.i18n];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', copy[element.dataset.i18nAria]);
    });
    document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
      element.alt = copy[element.dataset.i18nAlt];
    });
    const meta = (query, value) => document.querySelector(query)?.setAttribute('content', value);
    meta('meta[name="description"]', copy.description);
    meta('meta[property="og:title"]', copy.pageTitle);
    meta('meta[property="og:description"]', copy.description);
    meta('meta[name="twitter:title"]', copy.pageTitle);
    meta('meta[name="twitter:description"]', copy.description);
    meta('meta[property="og:image:alt"]', copy.abyssAlt);
    meta('meta[name="twitter:image:alt"]', copy.abyssAlt);
    const storeLink = document.querySelector('#google-play-link');
    const storeUrl = new URL(storeLink.href);
    storeUrl.searchParams.set('hl', locale === 'zh-TW' ? 'zh_TW' : locale);
    storeLink.href = storeUrl.href;
    status.textContent = '';
    copyAttempt++;
    closeMenu();
    if (updateUrl) {
      try { localStorage.setItem(storageKey, locale); } catch { /* Optional preference. */ }
      const url = new URL(window.location.href);
      url.searchParams.set('lang', locale);
      history.replaceState(null, '', url);
    }
  }

  selector.addEventListener('change', () => applyLanguage(selector.value, true));
  window.addEventListener('popstate', () => applyLanguage(detectLanguage()));
  toggle.addEventListener('click', () => {
    const opening = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(opening));
    toggle.setAttribute('aria-label', translations[locale][opening ? 'menuClose' : 'menuOpen']);
    navigation.classList.toggle('open', opening);
  });
  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  window.matchMedia('(min-width: 721px)').addEventListener('change', closeMenu);
  document.querySelector('.copy-email').addEventListener('click', async () => {
    const attempt = ++copyAttempt;
    try {
      await navigator.clipboard.writeText('playt.dev@gmail.com');
      if (attempt === copyAttempt) status.textContent = translations[locale].copied;
    } catch {
      if (attempt === copyAttempt) status.textContent = translations[locale].copyFailed;
    }
  });
  applyLanguage(detectLanguage());
})();
