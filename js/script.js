// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('main-nav');

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// FAQ accordion
document.querySelectorAll('.faq-item').forEach((item) => {
  const question = item.querySelector('.faq-question');
  question.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((other) => {
      other.classList.remove('open');
      other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      question.setAttribute('aria-expanded', 'true');
    }
  });
});

// Song players. The audio is only fetched when someone presses play, so the
// demo MP3s (several MB) don't slow down the first page load.
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function stopOtherPlayers(current) {
  document.querySelectorAll('.play-btn.is-playing').forEach((other) => {
    if (other !== current) other.click();
  });
}

document.querySelectorAll('[data-demo-player]').forEach((button) => {
  const card = button.closest('.player-controls');
  const fill = card.querySelector('.progress-fill');
  const timeLabel = card.querySelector('.player-time');
  let totalLabel = timeLabel ? timeLabel.textContent.split('/')[1].trim() : '';
  let audio = null;

  function createAudio() {
    audio = new Audio();
    audio.preload = 'none';
    audio.src = button.dataset.audioSrc;

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration)) totalLabel = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      fill.style.width = `${pct}%`;
      if (timeLabel) timeLabel.textContent = `${formatTime(audio.currentTime)} / ${totalLabel}`;
    });

    audio.addEventListener('ended', () => {
      button.classList.remove('is-playing');
      fill.style.width = '0%';
      if (timeLabel) timeLabel.textContent = `0:00 / ${totalLabel}`;
    });
  }

  button.addEventListener('click', () => {
    if (!button.dataset.audioSrc) return;
    if (!audio) createAudio();
    stopOtherPlayers(button);
    if (audio.paused) {
      audio.play().catch(() => button.classList.remove('is-playing'));
      button.classList.add('is-playing');
    } else {
      audio.pause();
      button.classList.remove('is-playing');
    }
  });
});

// Mobile sticky "order" button: shown once the visitor has scrolled past the
// hero, hidden again while the pricing card or the order form is on screen.
const mobileCta = document.getElementById('mobileCta');
const heroSection = document.querySelector('.hero');
if (mobileCta && heroSection && 'IntersectionObserver' in window) {
  const visible = new Set();
  const update = () => {
    const hide = visible.has('hero') || visible.has('pricing') || visible.has('order');
    mobileCta.classList.toggle('is-hidden', hide);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const key = entry.target.dataset.ctaKey;
      if (entry.isIntersecting) visible.add(key); else visible.delete(key);
    });
    update();
  }, { threshold: 0.15 });
  [[heroSection, 'hero'], [document.getElementById('pricing'), 'pricing'], [document.getElementById('order'), 'order']]
    .forEach(([el, key]) => {
      if (!el) return;
      el.dataset.ctaKey = key;
      observer.observe(el);
    });
  mobileCta.classList.add('is-hidden');
  mobileCta.hidden = false;
}

// Order wizard - one question at a time, submitted to Netlify Forms on completion
const orderForm = document.getElementById('order-form');

if (orderForm) {
  const steps = Array.from(orderForm.querySelectorAll('.wizard-step'));
  const progressFill = document.getElementById('wizardProgressFill');
  const stepLabel = document.getElementById('wizardStepLabel');
  const backBtn = document.getElementById('wizardBack');
  const nextBtn = document.getElementById('wizardNext');

  let current = 0;

  // A short order reference that ties this Netlify Forms submission to its
  // Stripe payment (sent along as client_reference_id), so the two can be
  // matched up without collecting the customer's name/email ourselves.
  const referenceInput = document.getElementById('hiddenReference');
  function generateReference() {
    const stamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `LH-${stamp}-${random}`;
  }
  referenceInput.value = generateReference();

  // Chip-group answers aren't real form fields, so their resolved value is
  // mirrored into a hidden input under a fixed name - that's what actually
  // gets submitted to Netlify Forms.
  const hiddenFieldMap = {
    chipKellele: { hiddenId: 'hiddenKellele', otherId: 'kelleleOther' },
    chipGenre: { hiddenId: 'hiddenGenre', otherId: 'genreOther' },
    chipVoice: { hiddenId: 'hiddenVoice', otherId: null },
  };

  function syncHiddenField(group) {
    const map = hiddenFieldMap[group.id];
    if (!map) return;
    const hiddenInput = document.getElementById(map.hiddenId);
    const value = group.dataset.value;
    hiddenInput.value = value === 'muu' && map.otherId
      ? document.getElementById(map.otherId).value.trim()
      : (value || '');
  }

  // There's a single product, so the order goes straight to its Stripe
  // Payment Link after the last step (add-ons are offered on the Stripe page).
  const ORDER = {
    name: 'Personaalne laul',
    price: '29,95',
    stripeUrl: 'https://buy.stripe.com/5kQbJ172y9KI7d65oW1oI08',
  };
  document.getElementById('hiddenPackage').value = ORDER.name;
  document.getElementById('hiddenPrice').value = ORDER.price;

  // Chip groups behave as single-select buttons that store their value on the group itself.
  orderForm.querySelectorAll('.chip-group').forEach((group) => {
    const otherInput = group.parentElement.querySelector('.chip-other-input');
    group.querySelectorAll('.chip-option').forEach((chip) => {
      chip.addEventListener('click', () => {
        group.querySelectorAll('.chip-option').forEach((c) => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        group.dataset.value = chip.dataset.value;
        if (otherInput) {
          otherInput.hidden = !chip.dataset.other;
          if (chip.dataset.other) otherInput.focus();
        }
        syncHiddenField(group);
        refreshNav();
      });
    });
    if (otherInput) {
      otherInput.addEventListener('input', () => syncHiddenField(group));
    }
  });

  orderForm.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach((field) => {
    field.addEventListener('input', refreshNav);
  });

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isStepValid(index) {
    const step = steps[index];
    if (step.dataset.required !== 'true') return true;

    switch (Number(step.dataset.step)) {
      case 0: {
        const group = document.getElementById('chipKellele');
        if (!group.dataset.value) return false;
        if (group.dataset.value === 'muu') return document.getElementById('kelleleOther').value.trim() !== '';
        return true;
      }
      case 1:
        return document.getElementById('field-person-name').value.trim() !== '';
      case 2:
        return document.getElementById('field-character').value.trim() !== '';
      case 5: {
        const group = document.getElementById('chipGenre');
        if (!group.dataset.value) return false;
        if (group.dataset.value === 'muu') return document.getElementById('genreOther').value.trim() !== '';
        return true;
      }
      case 6:
        return Boolean(document.getElementById('chipVoice').dataset.value);
      case 8:
        return (
          document.getElementById('field-your-name').value.trim() !== '' &&
          isValidEmail(document.getElementById('field-email').value.trim())
        );
      default:
        return true;
    }
  }

  function refreshNav() {
    nextBtn.disabled = !isStepValid(current);
  }

  function showStep(index) {
    steps.forEach((step, i) => { step.hidden = i !== index; });
    backBtn.hidden = index === 0;

    const isLast = index === steps.length - 1;
    nextBtn.textContent = isLast ? 'Jätka maksele →' : 'Edasi';

    progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Samm ${index + 1}/${steps.length}`;
    refreshNav();
  }

  function submitToNetlify() {
    const body = new URLSearchParams(new FormData(orderForm)).toString();
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
  }

  function scrollWizardIntoView() {
    // Center the question itself (not the whole step or card) in the
    // viewport. Centering a taller element - the whole card, or a step
    // with a lot of content - can push its own
    // heading above the visible area on a short phone screen, so we
    // target just the question text, which is always small.
    const activeStep = steps[current];
    const target = activeStep.querySelector('.wizard-question') || activeStep;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  backBtn.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      showStep(current);
      scrollWizardIntoView();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (!isStepValid(current)) return;

    if (current < steps.length - 1) {
      current += 1;
      showStep(current);
      scrollWizardIntoView();
      return;
    }

    const stripeUrl = new URL(ORDER.stripeUrl);
    stripeUrl.searchParams.set('client_reference_id', referenceInput.value);
    const email = document.getElementById('field-email').value.trim();
    if (email) stripeUrl.searchParams.set('prefilled_email', email);
    // Best-effort: don't let a failed/slow form submission block payment.
    submitToNetlify().catch(() => {}).finally(() => {
      window.location.href = stripeUrl.toString();
    });
  });

  showStep(current);
}
