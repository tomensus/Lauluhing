// Renders each <section class="slide"> in slides.html to ../slideN.png (1080x1920)
// and a contact sheet of all slides to ../contact-sheet.png.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(__dirname, 'slides.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const slides = await page.$$('section.slide');
  const files = [];
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(__dirname, '..', `slide${i + 1}.png`);
    await slides[i].screenshot({ path: out });
    files.push(out);
    console.log('wrote', out);
  }

  const sheet = await browser.newPage({ viewport: { width: 1980, height: 500 } });
  const imgs = files.map(f => `<img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">`).join('');
  await sheet.setContent(`<body style="margin:0;padding:30px;background:#eee;display:flex;gap:20px">
    <style>img{width:240px;height:427px;box-shadow:0 0 0 1px #ddd}</style>${imgs}</body>`);
  await sheet.waitForLoadState('load');
  await sheet.screenshot({ path: path.join(__dirname, '..', 'contact-sheet.png'), fullPage: true });
  await browser.close();
})();
