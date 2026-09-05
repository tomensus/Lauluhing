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

// Demo audio player simulation (no real audio files - visual/interactive mock)
document.querySelectorAll('[data-demo-player]').forEach((button) => {
  const card = button.closest('.player-controls');
  const fill = card.querySelector('.progress-fill');
  const timeLabel = card.querySelector('.player-time');
  const totalLabel = timeLabel ? timeLabel.textContent.split('/')[1].trim() : '2:00';
  const totalSeconds = parseTime(totalLabel);

  let elapsed = 0;
  let intervalId = null;

  function parseTime(str) {
    const [min, sec] = str.split(':').map(Number);
    return min * 60 + sec;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

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
    // Pause any other playing demo players
    document.querySelectorAll('.play-btn.is-playing').forEach((other) => {
      if (other !== button) other.click();
    });

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

// Order wizard - one question at a time (front-end only demo, no backend wired up yet)
const orderForm = document.getElementById('order-form');
const formNote = document.getElementById('formNote');

if (orderForm) {
  const steps = Array.from(orderForm.querySelectorAll('.wizard-step'));
  const progressFill = document.getElementById('wizardProgressFill');
  const stepLabel = document.getElementById('wizardStepLabel');
  const backBtn = document.getElementById('wizardBack');
  const nextBtn = document.getElementById('wizardNext');

  let current = 0;

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
        refreshNav();
      });
    });
  });

  // Package cards behave the same way as chips, plus they carry a price.
  const packageGroup = document.getElementById('chipPackage');
  packageGroup.querySelectorAll('.package-option').forEach((option) => {
    option.addEventListener('click', () => {
      packageGroup.querySelectorAll('.package-option').forEach((o) => o.classList.remove('is-selected'));
      option.classList.add('is-selected');
      packageGroup.dataset.value = option.dataset.value;
      packageGroup.dataset.price = option.dataset.price;
      refreshNav();
    });
  });

  orderForm.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach((field) => {
    field.addEventListener('input', refreshNav);
  });

  const cardNumberInput = document.getElementById('field-card-number');
  cardNumberInput.addEventListener('input', () => {
    const digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
    cardNumberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
  });

  const cardExpiryInput = document.getElementById('field-card-expiry');
  cardExpiryInput.addEventListener('input', () => {
    const digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
    cardExpiryInput.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
  });

  const cardCvcInput = document.getElementById('field-card-cvc');
  cardCvcInput.addEventListener('input', () => {
    cardCvcInput.value = cardCvcInput.value.replace(/\D/g, '').slice(0, 4);
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
        return Boolean(packageGroup.dataset.value);
      case 9:
        return (
          document.getElementById('field-your-name').value.trim() !== '' &&
          isValidEmail(document.getElementById('field-email').value.trim())
        );
      case 10:
        return (
          document.getElementById('field-card-name').value.trim() !== '' &&
          document.getElementById('field-card-number').value.replace(/\s/g, '').length >= 13 &&
          /^\d{2}\/\d{2}$/.test(document.getElementById('field-card-expiry').value.trim()) &&
          /^\d{3,4}$/.test(document.getElementById('field-card-cvc').value.trim())
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
    nextBtn.textContent = isLast ? `Maksa ${packageGroup.dataset.price || ''}€` : 'Edasi';
    if (isLast) {
      const paymentSummary = document.getElementById('paymentSummary');
      paymentSummary.textContent = packageGroup.dataset.value
        ? `Valitud pakett: ${packageGroup.dataset.value} · Kokku: ${packageGroup.dataset.price}€`
        : 'Valitud pakett: - · Kokku: -';
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
      yourName: document.getElementById('field-your-name').value.trim(),
    };
  }

  backBtn.addEventListener('click', () => {
    if (current > 0) {
      current -= 1;
      showStep(current);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (!isStepValid(current)) return;

    if (current < steps.length - 1) {
      current += 1;
      showStep(current);
      return;
    }

    const answers = collectAnswers();
    formNote.textContent = `Makse õnnestus! Aitäh, ${answers.yourName}! Sinu "${answers.packageName}" tellimus ${answers.personName ? `("${answers.personName}") ` : ''}on kinnitatud - laul valmib peagi ja saadame selle sulle e-postiga. 🎵`;
    orderForm.reset();
    orderForm.querySelectorAll('.chip-option.is-selected, .package-option.is-selected').forEach((c) => c.classList.remove('is-selected'));
    orderForm.querySelectorAll('.chip-group, .package-group').forEach((g) => {
      delete g.dataset.value;
      delete g.dataset.price;
    });
    orderForm.querySelectorAll('.chip-other-input').forEach((i) => { i.hidden = true; });
    current = 0;
    showStep(current);
  });

  showStep(current);
}
