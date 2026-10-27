// Usage: node tiktok-shared/video-export.js <video-folder> [--no-captions]
// Renders <folder>/src/index.html frame by frame (the page exposes window.DURATION and
// window.render(t, opts)) and encodes <folder>/video.mp4 (1080x1920, 30 fps, H.264,
// silent audio track for the voiceover). --no-captions writes video-ilma-subtiitriteta.mp4.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const { spawn } = require('child_process');
const path = require('path');

const dir = path.resolve(process.argv[2] || '.');
const captions = !process.argv.includes('--no-captions');
const out = path.join(dir, captions ? 'video.mp4' : 'video-ilma-subtiitriteta.mp4');
const FPS = 30;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.join(dir, 'src', 'index.html'), { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const duration = await page.evaluate(() => window.DURATION);
  const frames = Math.round(duration * FPS);

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000',
    '-shortest', '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  for (let f = 0; f < frames; f++) {
    await page.evaluate(([t, c]) => window.render(t, { captions: c }), [f / FPS, captions]);
    const buf = await page.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('wrote', out, `(${duration}s, ${frames} frames)`);
})();
