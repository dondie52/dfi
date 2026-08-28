const config = window.DFI_CONFIG || {};
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.title = config.siteTitle || document.title;
const yearSlot = document.querySelector('[data-year]');
if (yearSlot) yearSlot.textContent = new Date().getFullYear();
document.querySelectorAll('[data-social-link]').forEach((link) => {
  const key = `${link.dataset.socialLink}Url`;
  if (config[key]) link.href = config[key];
});

/* Navigation --------------------------------------------------- */
const isMenuOpen = () => menuButton?.getAttribute('aria-expanded') === 'true';
const setMenu = (open) => {
  menuButton?.setAttribute('aria-expanded', String(open));
  menuButton?.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  menu?.classList.toggle('is-open', open);
};

menuButton?.addEventListener('click', () => setMenu(!isMenuOpen()));
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || !isMenuOpen()) return;
  setMenu(false);
  menuButton?.focus();
});
document.addEventListener('click', (event) => {
  if (!isMenuOpen() || event.target.closest('.nav')) return;
  setMenu(false);
});

if (header) {
  window.addEventListener(
    'scroll',
    () => header.classList.toggle('is-scrolled', window.scrollY > 12),
    { passive: true }
  );
}

/* Mark the section currently in view in the nav.
   The CTA is excluded: it is a solid accent button, so the accent
   aria-current colour would render its label invisible. */
const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]:not(.button)')];
const spied = navLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter((entry) => entry.section);

if (spied.length && 'IntersectionObserver' in window) {
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const match = spied.find((item) => item.section === entry.target);
        if (!match) return;
        if (entry.isIntersecting) match.link.setAttribute('aria-current', 'location');
        else match.link.removeAttribute('aria-current');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  spied.forEach((entry) => spy.observe(entry.section));
}

/* Motion ------------------------------------------------------- */
/* Reveals are opt-in: the classes that hide content are only ever added
   when motion is allowed, so reduced-motion visitors and no-JS visitors
   both get fully visible content. */
if (!reduceMotion && 'IntersectionObserver' in window) {
  const heroSteps = [...document.querySelectorAll('[data-hero-step]')];
  heroSteps.forEach((el, i) => {
    el.classList.add('hero-step');
    el.style.setProperty('--step', String(i));
  });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => heroSteps.forEach((el) => el.classList.add('is-in')));
  });

  const targets = document.querySelectorAll(
    '.intro-grid, .section-heading, .focus-list, .section-intro, .programmes-grid, .involve-cards, .gallery-copy, .gallery figure, .connect-grid'
  );
  const revealer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
  );
  targets.forEach((el) => {
    el.classList.add('reveal');
    revealer.observe(el);
  });
}
