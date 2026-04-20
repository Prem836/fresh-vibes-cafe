/* =========================================
   FRESH VIBES CAFE — script.js
   ========================================= */

// ---- Navbar scroll effect ----
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  highlightActiveNav();
});

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinksEl.classList.toggle('open');
  navToggle.classList.toggle('active');
});

// Close menu on nav link click
document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
  link.addEventListener('click', () => {
    navLinksEl.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// ---- Active nav highlighting ----
const sections = document.querySelectorAll('section[id]');

function highlightActiveNav() {
  let currentSection = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) currentSection = sec.getAttribute('id');
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// ---- Hero particles ----
(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const colors = ['rgba(245,179,0,0.15)', 'rgba(76,175,118,0.12)', 'rgba(255,255,255,0.08)'];
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    const size = Math.random() * 16 + 4;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 15 + 10}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    container.appendChild(p);
  }
})();

// =============================================
// ---- POPULAR ITEMS SLIDESHOW ----
// =============================================
(function initSlideshow() {
  const slides      = document.querySelectorAll('.slide');
  const dots        = document.querySelectorAll('.dot');
  const prevBtn     = document.getElementById('slidePrev');
  const nextBtn     = document.getElementById('slideNext');
  const progressBar = document.getElementById('slideProgressBar');
  const counterEl   = document.getElementById('slideCurrentNum');

  if (!slides.length) return;

  const TOTAL       = slides.length;
  const AUTO_DELAY  = 5000; // ms per slide
  let   current     = 0;
  let   timer       = null;
  let   progTimer   = null;
  let   isPaused    = false;

  // ----- Core: go to a specific slide -----
  function goTo(index) {
    // Wrap around
    index = (index + TOTAL) % TOTAL;

    // Deactivate current
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');

    // Activate new
    current = index;
    slides[current].classList.add('active');
    dots[current].classList.add('active');

    // Update counter
    if (counterEl) counterEl.textContent = current + 1;

    // Animate progress bar
    animateProgress();
  }

  // ----- Progress bar animation -----
  function animateProgress() {
    if (!progressBar) return;
    clearTimeout(progTimer);
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    // Force reflow before starting transition
    progressBar.getBoundingClientRect();
    progressBar.style.transition = `width ${AUTO_DELAY}ms linear`;
    progressBar.style.width = '100%';
  }

  // ----- Auto-play -----
  function startAuto() {
    clearInterval(timer);
    timer = setInterval(() => {
      if (!isPaused) goTo(current + 1);
    }, AUTO_DELAY);
  }

  // ----- Pause on hover -----
  const show = document.getElementById('popularSlideshow');
  if (show) {
    show.addEventListener('mouseenter', () => {
      isPaused = true;
      if (progressBar) progressBar.style.animationPlayState = 'paused';
    });
    show.addEventListener('mouseleave', () => {
      isPaused = false;
      if (progressBar) progressBar.style.animationPlayState = 'running';
    });
  }

  // ----- Arrow buttons -----
  if (prevBtn) prevBtn.addEventListener('click', () => { goTo(current - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { goTo(current + 1); startAuto(); });

  // ----- Dot navigation -----
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(parseInt(dot.getAttribute('data-index'), 10));
      startAuto();
    });
  });

  // ----- Keyboard navigation -----
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); startAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); startAuto(); }
  });

  // ----- Touch / swipe support -----
  let touchStartX = 0;
  if (show) {
    show.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    show.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) {
        goTo(dx < 0 ? current + 1 : current - 1);
        startAuto();
      }
    }, { passive: true });
  }

  // ----- Init -----
  goTo(0);
  startAuto();
})();

// ---- Lightbox ----
function openLightbox(src) {
  const lb = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// ---- Reservation date min (today) ----
const dateInput = document.getElementById('res-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

// ---- Reservation form submit ----
const reservationForm = document.getElementById('reservationForm');
const toast = document.getElementById('toast');

if (reservationForm) {
  reservationForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm()) return;

    const btn = document.getElementById('submitReservation');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = '';

    // Simulate API / WhatsApp redirect
    setTimeout(() => {
      const name = document.getElementById('res-name').value.trim();
      const phone = document.getElementById('res-phone-input').value.trim();
      const date = document.getElementById('res-date').value;
      const time = document.getElementById('res-time').value;
      const guests = document.getElementById('res-guests').value;
      const occasion = document.getElementById('res-occasion').value;
      const notes = document.getElementById('res-notes').value.trim();

      // Build WhatsApp message
      const msg = encodeURIComponent(
        `🌿 *Table Reservation – Fresh Vibes Café*\n\n` +
        `👤 Name: ${name}\n` +
        `📞 Phone: ${phone}\n` +
        `📅 Date: ${date}\n` +
        `⏰ Time: ${time}\n` +
        `👥 Guests: ${guests}\n` +
        `🎉 Occasion: ${occasion}\n` +
        (notes ? `📝 Notes: ${notes}\n` : '') +
        `\nPlease confirm my reservation. Thank you!`
      );

      // Open WhatsApp
      window.open(`https://wa.me/919796223627?text=${msg}`, '_blank');

      // Show toast
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 5000);

      // Reset form
      reservationForm.reset();
      btn.disabled = false;
      btnText.style.display = '';
      btnLoading.style.display = 'none';
    }, 1500);
  });
}

function validateForm() {
  const required = ['res-name', 'res-phone-input', 'res-date', 'res-time', 'res-guests'];
  let valid = true;

  required.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
      el.addEventListener('input', () => el.classList.remove('error'), { once: true });
    } else {
      el.classList.remove('error');
    }
  });

  return valid;
}

// ---- Intersection Observer – fade in sections ----
const observers = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.about-grid, .menu-grid, .reservation-wrap, .contact-grid').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(32px)';
  el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  observers.observe(el);
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Run after DOM is ready

