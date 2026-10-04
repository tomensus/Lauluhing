// Renders each <section class="slide"> in slides.html to ../slide-N.png (1080x1920).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const slides = await page.$$('section.slide');
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(__dirname, '..', `slide-${i + 1}.png`);
    await slides[i].screenshot({ path: out });
    console.log('wrote', out);
  }
  await browser.close();
})();
