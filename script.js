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
      // Freeze the progress bar visually at its current position
      if (progressBar) {
        const computed = getComputedStyle(progressBar).width;
        const containerWidth = progressBar.parentElement.offsetWidth;
        const pct = containerWidth ? (parseFloat(computed) / containerWidth * 100).toFixed(2) : '0';
        progressBar.style.transition = 'none';
        progressBar.style.width = pct + '%';
      }
    });
    show.addEventListener('mouseleave', () => {
      isPaused = false;
      // Resume the progress bar for the remaining duration
      if (progressBar) {
        progressBar.style.transition = `width ${AUTO_DELAY}ms linear`;
        progressBar.style.width = '100%';
      }
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

// Auto-detect: use live URL if hosted, localhost if running locally
const BACKEND_URL = (window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '')
  ? 'http://localhost:3001/api/reservations'
  : 'https://fresh-vibes-backend.onrender.com/api/reservations';

if (reservationForm) {
  reservationForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const btn       = document.getElementById('submitReservation');
    const btnText   = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btn.disabled = true;
    btnText.classList.add('btn-hidden');
    btnLoading.classList.remove('btn-hidden');
    btnLoading.textContent = 'Submitting…';

    // Collect form data
    const name     = document.getElementById('res-name').value.trim();
    const phone    = document.getElementById('res-phone-input').value.trim();
    const email    = (document.getElementById('res-email') ? document.getElementById('res-email').value.trim() : '');
    const date     = document.getElementById('res-date').value;
    const time     = document.getElementById('res-time').value;
    const guests   = document.getElementById('res-guests').value;
    const occasion = document.getElementById('res-occasion').value;
    const notes    = document.getElementById('res-notes').value.trim();

    // ── Try backend first ──────────────────────────────────────────────────
    let backendSuccess = false;
    try {
      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, date, time, guests, occasion, notes }),
        signal: AbortSignal.timeout(8000)   // 8s timeout
      });

      const data = await res.json();

      if (res.ok && data.success) {
        backendSuccess = true;
        // Show success toast with email note
        const toastText = toast.querySelector('span:last-child');
        if (toastText) toastText.textContent = email
          ? 'We\'ll contact you to confirm. A confirmation email is on its way!'
          : 'We\'ll call you shortly to confirm your booking.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 6000);
        reservationForm.reset();
      } else if (res.status >= 400 && res.status < 500) {
        // Validation error from server — show to user, do NOT fall back to WhatsApp
        backendSuccess = true; // prevent WhatsApp fallback
        const toastText = toast.querySelector('span:last-child');
        const toastIcon = toast.querySelector('.toast-icon');
        if (toastIcon) toastIcon.textContent = '⚠️';
        if (toastText) toastText.textContent = data.error || 'Please check your details and try again.';
        toast.classList.add('show');
        setTimeout(() => { toast.classList.remove('show'); if (toastIcon) toastIcon.textContent = '✅'; }, 6000);
        btn.disabled = false;
        btnText.classList.remove('btn-hidden');
        btnLoading.classList.add('btn-hidden');
        return;
      } else {
        throw new Error(data.error || 'Backend error');
      }

    } catch (err) {
      console.warn('Backend unavailable, falling back to WhatsApp:', err.message);
    }

    // ── WhatsApp fallback (if backend is offline) ──────────────────────────
    if (!backendSuccess) {
      const occasionLabels = {
        regular: 'Regular Meal', birthday: 'Birthday Celebration 🎂',
        anniversary: 'Anniversary 💑', family: 'Family Get-Together',
        business: 'Business Lunch', other: 'Other'
      };
      const guestLabels = {
        '1': '1 Person', '2': '2 People', '3': '3 People', '4': '4 People',
        '5': '5 People', '6': '6 People', '7-10': '7–10 People', '10+': '10+ People (Group)'
      };
      const dateObj  = new Date(date + 'T00:00:00');
      const niceDate = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      const [hh, mm] = time.split(':');
      const timeObj  = new Date();
      timeObj.setHours(+hh, +mm);
      const niceTime    = timeObj.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
      const guestLabel  = guestLabels[guests] || guests;
      const cleanNotes  = notes && !['nil','n/a','none'].includes(notes.toLowerCase()) ? notes : '';
      const msg = encodeURIComponent(
        `🌿 *Table Reservation – Fresh Vibes Café*\n\n` +
        `👤 *Name:* ${name}\n📞 *Phone:* ${phone}\n` +
        `📅 *Date:* ${niceDate}\n⏰ *Time:* ${niceTime}\n` +
        `👥 *Guests:* ${guestLabel}\n🎉 *Occasion:* ${occasionLabels[occasion] || occasion}\n` +
        (cleanNotes ? `📝 *Notes:* ${cleanNotes}\n` : '') +
        `\nPlease confirm my reservation. Thank you! 🙏`
      );
      window.open(`https://wa.me/919796223627?text=${msg}`, '_blank');
      const toastText = toast.querySelector('span:last-child');
      if (toastText) toastText.textContent = '📲 Redirecting you to WhatsApp to complete your booking!';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 5000);
      reservationForm.reset();
    }

    btn.disabled = false;
    btnText.classList.remove('btn-hidden');
    btnLoading.classList.add('btn-hidden');
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

  // Phone: must be exactly 10 digits (optionally prefixed with +91 or 0)
  const phoneEl = document.getElementById('res-phone-input');
  if (phoneEl && phoneEl.value.trim()) {
    const digits = phoneEl.value.trim().replace(/[\s\-().+]/g, '');
    const bareDigits = digits.startsWith('91') && digits.length === 12 ? digits.slice(2) : digits;
    if (!/^[6-9]\d{9}$/.test(bareDigits)) {
      phoneEl.classList.add('error');
      valid = false;
      phoneEl.title = 'Please enter a valid 10-digit Indian mobile number.';
      phoneEl.addEventListener('input', () => { phoneEl.classList.remove('error'); phoneEl.title = ''; }, { once: true });
    }
  }

  // Email: basic format check if provided
  const emailEl = document.getElementById('res-email');
  if (emailEl && emailEl.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailEl.value.trim())) {
      emailEl.classList.add('error');
      valid = false;
      emailEl.addEventListener('input', () => emailEl.classList.remove('error'), { once: true });
    }
  }

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

