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

// Demo audio player simulation (no real audio files — visual/interactive mock)
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

// Order form (front-end only demo — no backend wired up yet)
const orderForm = document.getElementById('order-form');
const formNote = document.getElementById('formNote');

if (orderForm) {
  orderForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formNote.textContent = 'Aitäh! Sinu lugu on teele saadetud — võtame sinuga peagi ühendust. 🎵';
    orderForm.reset();
  });
}
