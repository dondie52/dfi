const config = window.DFI_CONFIG || {};
const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const menu = document.querySelector('[data-menu]');
const form = document.querySelector('[data-contact-form]');
const fields = document.querySelector('[data-form-fields]');
const status = document.querySelector('[data-form-status]');

document.title = config.siteTitle || document.title;
document.querySelector('[data-year]').textContent = new Date().getFullYear();
document.querySelectorAll('[data-social-link]').forEach((link) => {
  const key = `${link.dataset.socialLink}Url`;
  if (config[key]) link.href = config[key];
});

const closeMenu = () => { menuButton?.setAttribute('aria-expanded', 'false'); menu?.classList.remove('is-open'); };
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open)); menu.classList.toggle('is-open', !open);
});
menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 12), { passive: true });

if (config.formEndpoint) {
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
