import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];

const executablePath = chromePaths.find((p) => fs.existsSync(p));

async function inspectLogos() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--allow-file-access-from-files']
  });

  const page = await browser.newPage();

  const logoFiles = [
    'janmabhoomi-logo.svg',
    'janmabhoomi-official-logo.svg',
    'janmabhoomi-official-logo.png',
    'janmabhoomi-logo.png',
    'janmabhoomi-logo.jpeg'
  ];

  for (const file of logoFiles) {
    const fullPath = path.resolve('public/assets/logos', file).replace(/\\/g, '/');
    if (!fs.existsSync(fullPath)) continue;

    console.log('\n--- Checking:', file);
    await page.goto(`file:///${fullPath}`);

    const result = await page.evaluate(() => {
      // If it's an SVG document
      const svg = document.querySelector('svg');
      if (svg) {
        const fills = Array.from(svg.querySelectorAll('[fill]')).map(el => el.getAttribute('fill'));
        return { type: 'svg', fills: Array.from(new Set(fills)) };
      }
      // If it's an image
      const img = document.querySelector('img');
      if (img) {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        // Count non-white, non-black colors (blue tones: b > r and b > g)
        const colorCounts = {};
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];
          if (a > 128 && b > r + 30 && b > g) {
            const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
            colorCounts[hex] = (colorCounts[hex] || 0) + 1;
          }
        }
        const sorted = Object.entries(colorCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        return { type: 'raster', topBlues: sorted };
      }
      return { type: 'unknown' };
    });

    console.log(result);
  }

  await browser.close();
}

inspectLogos().catch(console.error);
