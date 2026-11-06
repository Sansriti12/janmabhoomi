import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));

async function checkAll() {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const dir = 'C:/Users/NISHANT/.gemini/antigravity/brain/55f986f8-5be6-43c3-81c5-48348c680539/.user_uploaded/';
  
  for (const f of fs.readdirSync(dir).filter(x => x.endsWith('.png'))) {
    await page.goto(`file:///${dir + f}`);
    const info = await page.evaluate(() => {
      const img = document.querySelector('img');
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Find most common colors
      const counts = {};
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 0; i < data.length; i += 4 * 10) { // step by 10 pixels
        const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        if (a > 200 && b > r && b > g) {
          const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
          counts[hex] = (counts[hex] || 0) + 1;
        }
      }
      return {
        w: canvas.width,
        h: canvas.height,
        topBlues: Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 4)
      };
    });
    console.log(f, info);
  }
  await browser.close();
}
checkAll().catch(console.error);
