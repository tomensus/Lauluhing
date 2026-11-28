// Meta Pixel with cookie consent.
//
// The pixel is only loaded after the visitor accepts cookies (required in the
// EU). Until then, events are not sent at all. Pages call lhTrack(...) for
// conversion events; if consent hasn't been given (yet), the call is a no-op,
// except that the thank-you page re-sends its Purchase once consent arrives.
(function () {
  const PIXEL_ID = '1087270004327712';
  const CONSENT_KEY = 'lh-cookie-consent'; // 'yes' | 'no'
  let pending = [];
  let loaded = false;

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) { /* private mode */ }
  }

  function loadPixel() {
    if (loaded) return;
    loaded = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
    pending.forEach((args) => window.fbq.apply(null, args));
    pending = [];
  }

  // lhTrack('InitiateCheckout', { value: 29.95, currency: 'EUR' }, { eventID: '...' })
  // Set custom: true for non-standard event names.
  window.lhTrack = function (event, params, options) {
    const opts = options || {};
    const method = opts.custom ? 'trackCustom' : 'track';
    const args = [method, event, params || {}];
    if (opts.eventID) args.push({ eventID: opts.eventID });
    if (loaded && window.fbq) {
      window.fbq.apply(null, args);
    } else if (opts.keepUntilConsent && readConsent() !== 'no') {
      pending.push(args);
    }
  };

  function showBanner() {
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Küpsiste nõusolek');
    banner.innerHTML =
      '<p>Kasutame küpsiseid, et mõõta reklaamide tõhusust ja lehte paremaks teha. ' +
      'Kas lubad seda?</p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-ghost btn-small" data-consent="no">Keeldun</button>' +
      '<button type="button" class="btn btn-primary btn-small" data-consent="yes">Nõustun</button>' +
      '</div>';
    banner.addEventListener('click', (e) => {
      const choice = e.target.closest('[data-consent]');
      if (!choice) return;
      saveConsent(choice.dataset.consent);
      banner.remove();
      if (choice.dataset.consent === 'yes') loadPixel();
      else pending = [];
    });
    document.body.appendChild(banner);
  }

  const consent = readConsent();
  if (consent === 'yes') {
    loadPixel();
  } else if (consent !== 'no') {
    if (document.body) showBanner();
    else document.addEventListener('DOMContentLoaded', showBanner);
  }
})();
