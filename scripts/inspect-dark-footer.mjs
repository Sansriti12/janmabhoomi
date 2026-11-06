import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));

async function inspectDarkFooter() {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const imgPath = path.resolve('C:/Users/NISHANT/.gemini/antigravity/brain/55f986f8-5be6-43c3-81c5-48348c680539/.user_uploaded/media_1793947463857_0ec1072d.png').replace(/\\/g, '/');
  
  await page.goto(`file:///${imgPath}`);

  const sampled = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Look at pixel at x = 100, y = 500 (inside the dark footer in screenshot 1)
    const p1 = ctx.getImageData(100, 500, 1, 1).data;
    const p2 = ctx.getImageData(500, 600, 1, 1).data;
    const p3 = ctx.getImageData(800, 700, 1, 1).data;

    const toHex = (p) => '#' + [p[0], p[1], p[2]].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();

    return {
      dimensions: { width: canvas.width, height: canvas.height },
      p1: toHex(p1),
      p2: toHex(p2),
      p3: toHex(p3),
    };
  });

  console.log(sampled);
  await browser.close();
}

inspectDarkFooter().catch(console.error);
