// Usage: node tiktok-shared/export.js <carousel-folder>
// Renders each <section class="slide"> in <folder>/src/slides.html at 2x, downsamples to
// <folder>/slideN.png at the slide's own size (1080x1920, or 1080x1440 with body.r34),
// and writes contact-sheet.png plus safe-zone-check.png
// (slide 1 with TikTok's UI zones tinted blue; not for posting).
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');

const dir = path.resolve(process.argv[2] || '.');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(dir, 'src', 'slides.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);

  // Downsample on a canvas so the 2x render becomes a crisp PNG at the slide's CSS size.
  const shrink = await browser.newPage();
  const downsample = async (buf, W, H) => {
    const b64 = await shrink.evaluate(async ({ src, W, H }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const cv = document.createElement('canvas');
      cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, W, H);
      return cv.toDataURL('image/png').split(',')[1];
    }, { src: 'data:image/png;base64,' + buf.toString('base64'), W, H });
    return Buffer.from(b64, 'base64');
  };

  const slides = await page.$$('section.slide');
  const files = [];
  for (let i = 0; i < slides.length; i++) {
    const out = path.join(dir, `slide${i + 1}.png`);
    const { width, height } = await slides[i].boundingBox();
    fs.writeFileSync(out, await downsample(await slides[i].screenshot(), width, height));
    files.push(out);
    console.log('wrote', out);
  }

  await page.evaluate(() => document.body.classList.add('debug'));
  const box = await slides[0].boundingBox();
  fs.writeFileSync(path.join(dir, 'safe-zone-check.png'), await downsample(await slides[0].screenshot(), box.width, box.height));

  const sheet = await browser.newPage({ viewport: { width: 40 + 260 * files.length, height: 500 } });
  const imgs = files.map(f => `<img src="data:image/png;base64,${fs.readFileSync(f).toString('base64')}">`).join('');
  await sheet.setContent(`<body style="margin:0;padding:30px;background:#eee;display:flex;gap:20px;width:max-content">
    <style>img{width:240px;height:auto;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.12)}</style>${imgs}</body>`);
  await sheet.screenshot({ path: path.join(dir, 'contact-sheet.png'), fullPage: true });
  await browser.close();
})();
