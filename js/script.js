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

// Song players: real playback for players with a data-audio-src, a
// visual/interactive mock (no real audio file) for the rest.
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
  let totalLabel = timeLabel ? timeLabel.textContent.split('/')[1].trim() : '2:00';

  if (button.dataset.audioSrc) {
    const audio = new Audio(button.dataset.audioSrc);

    audio.addEventListener('loadedmetadata', () => {
      if (isFinite(audio.duration)) {
        totalLabel = formatTime(audio.duration);
        if (timeLabel) timeLabel.textContent = `0:00 / ${totalLabel}`;
      }
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

    button.addEventListener('click', () => {
      stopOtherPlayers(button);
      if (audio.paused) {
        audio.play();
        button.classList.add('is-playing');
      } else {
        audio.pause();
        button.classList.remove('is-playing');
      }
    });

    return;
  }

  const totalSeconds = (() => {
    const [min, sec] = totalLabel.split(':').map(Number);
    return min * 60 + sec;
  })();

  let elapsed = 0;
  let intervalId = null;

  function stop() {
    clearInterval(intervalId);
    intervalId = null;
    button.classList.remove('is-playing');
  }

  function reset() {
    stop();
    elapsed = 0;
    fill.style.width = '0%';
    if (timeLabel) timeLabel.textContent = `0:00 / ${totalLabel}`;
  }

  button.addEventListener('click', () => {
    stopOtherPlayers(button);

    if (intervalId) {
      stop();
      return;
    }

    button.classList.add('is-playing');
    intervalId = setInterval(() => {
      elapsed += 0.2;
      if (elapsed >= totalSeconds) {
        reset();
        return;
      }
      const pct = (elapsed / totalSeconds) * 100;
      fill.style.width = `${pct}%`;
      if (timeLabel) timeLabel.textContent = `${formatTime(elapsed)} / ${totalLabel}`;
    }, 200);
  });
});

// Order wizard - one question at a time, submitted to Netlify Forms on completion
const orderForm = document.getElementById('order-form');
const formNote = document.getElementById('formNote');

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

  function syncPackageHiddenFields() {
    document.getElementById('hiddenPackage').value = packageGroup.dataset.value || '';
    document.getElementById('hiddenPrice').value = packageGroup.dataset.price || '';
  }

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

  // Package cards behave the same way as chips, plus they carry a price and,
  // where set up, a Stripe Payment Link to redirect to instead of our own
  // (mock) card form.
  const packageGroup = document.getElementById('chipPackage');
  packageGroup.querySelectorAll('.package-option').forEach((option) => {
    option.addEventListener('click', () => {
      packageGroup.querySelectorAll('.package-option').forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      packageGroup.dataset.value = option.dataset.value;
      packageGroup.dataset.price = option.dataset.price;
      if (option.dataset.stripeUrl) {
        packageGroup.dataset.stripeUrl = option.dataset.stripeUrl;
      } else {
        delete packageGroup.dataset.stripeUrl;
      }
      syncPackageHiddenFields();
      // Re-run showStep (not just refreshNav): the package step doubles as
      // the wizard's final step, so picking a package can change whether
      // the next button should read "Jätka maksele" right here, without
      // any step transition to trigger that update otherwise.
      showStep(current);
    });
  });

  orderForm.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach((field) => {
    field.addEventListener('input', refreshNav);
  });

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
        return Boolean(packageGroup.dataset.value);
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
    if (isLast && packageGroup.dataset.stripeUrl) {
      nextBtn.textContent = 'Jätka maksele →';
    } else if (isLast) {
      nextBtn.textContent = 'Lõpeta tellimus';
    } else {
      nextBtn.textContent = 'Edasi';
    }

    progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
    stepLabel.textContent = `Samm ${index + 1}/${steps.length}`;
    refreshNav();
  }

  function collectAnswers() {
    const kellele = document.getElementById('chipKellele').dataset.value;
    const genre = document.getElementById('chipGenre').dataset.value;
    return {
      kellele: kellele === 'muu' ? document.getElementById('kelleleOther').value.trim() : kellele,
      personName: document.getElementById('field-person-name').value.trim(),
      genre: genre === 'muu' ? document.getElementById('genreOther').value.trim() : genre,
      voice: document.getElementById('chipVoice').dataset.value,
      packageName: packageGroup.dataset.value,
      packagePrice: packageGroup.dataset.price,
    };
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
    // with a lot of content like the package cards - can push its own
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

    if (packageGroup.dataset.stripeUrl) {
      const stripeUrl = new URL(packageGroup.dataset.stripeUrl);
      stripeUrl.searchParams.set('client_reference_id', referenceInput.value);
      // Best-effort: don't let a failed/slow form submission block payment.
      submitToNetlify().catch(() => {}).finally(() => {
        window.location.href = stripeUrl.toString();
      });
      return;
    }

    // Fallback for a package without a configured Stripe Payment Link yet.
    submitToNetlify().catch(() => {});
    const answers = collectAnswers();
    const reference = referenceInput.value;
    formNote.textContent = `Aitäh! Sinu "${answers.packageName}" tellimus ${answers.personName ? `("${answers.personName}") ` : ''}on vastu võetud (viide ${reference}) - võtame peagi ühendust, et makse ja laulu üksikasjad kokku leppida. 🎵`;
    orderForm.reset();
    orderForm.querySelectorAll('.chip-option.is-selected, .package-option.is-selected').forEach((c) => c.classList.remove('is-selected'));
    orderForm.querySelectorAll('.chip-group, .package-group').forEach((g) => {
      delete g.dataset.value;
      delete g.dataset.price;
      delete g.dataset.stripeUrl;
    });
    orderForm.querySelectorAll('.chip-other-input').forEach((i) => { i.hidden = true; });
    referenceInput.value = generateReference();
    current = 0;
    showStep(current);
  });

  showStep(current);
}
