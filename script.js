const config = window.DFI_CONFIG || {};
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const form = document.querySelector('[data-contact-form]');
const fields = document.querySelector('[data-form-fields]');
const status = document.querySelector('[data-form-status]');
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
    '.intro-grid, .section-heading, .focus-list, .showcase-heading, .showcase-grid, .gallery-copy, .gallery figure, .connect-grid, .contact-grid'
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

/* Contact form ------------------------------------------------- */
if (config.formEndpoint && form && fields && status) {
  fields.disabled = false;
  status.textContent = 'All fields are required. We will only use your details to respond to this enquiry.';
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true; status.textContent = 'Sending your message…';
    try {
      const response = await fetch(config.formEndpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) });
      if (!response.ok) throw new Error('Submission failed');
      form.reset(); status.textContent = 'Thanks — your message was sent successfully.';
    } catch {
      status.textContent = 'Your message could not be sent. Please try again or contact us through our social channels.';
    } finally { submit.disabled = false; }
  });
}
