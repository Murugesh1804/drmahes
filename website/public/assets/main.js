
/* ── HEADER SCROLL ── */
window.addEventListener('scroll', () => {
  const h = document.getElementById('header');
  if (h) h.classList.toggle('scrolled', window.scrollY > 48);
}, { passive: true });

/* ── HAMBURGER ── */
const hamburgerBtn = document.getElementById('hamburgerBtn');
const mobileNav = document.getElementById('mobileNav');

if (hamburgerBtn && mobileNav) {
  hamburgerBtn.addEventListener('click', () => {
    const open = hamburgerBtn.classList.toggle('open');
    mobileNav.classList.toggle('open', open);
    hamburgerBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.addEventListener('click', e => {
    if (e.target === mobileNav) closeMobileNav();
  });
}

function closeMobileNav() {
  if (!hamburgerBtn || !mobileNav) return;
  hamburgerBtn.classList.remove('open');
  mobileNav.classList.remove('open');
  hamburgerBtn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ── FAQs ── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ── REDIRECTS (www to non-www) ── */
if (window.location.hostname.startsWith('www.')) {
  window.location.replace(window.location.href.replace('www.', ''));
}

