import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));

async function inspectUserScreenshot() {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const imgPath = path.resolve('C:/Users/NISHANT/.gemini/antigravity/brain/55f986f8-5be6-43c3-81c5-48348c680539/.user_uploaded/media_1793947463857_0ec1072d.png').replace(/\\/g, '/');
  
  await page.goto(`file:///${imgPath}`);

  const colors = await page.evaluate(() => {
    const img = document.querySelector('img');
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Sample footer area (bottom 30% of the image)
    const footerData = ctx.getImageData(0, Math.floor(canvas.height * 0.5), canvas.width, Math.floor(canvas.height * 0.4)).data;
    const footerCounts = {};
    for (let i = 0; i < footerData.length; i += 4) {
      const r = footerData[i];
      const g = footerData[i+1];
      const b = footerData[i+2];
      const a = footerData[i+3];
      if (a > 200 && b > r && b > g) {
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        footerCounts[hex] = (footerCounts[hex] || 0) + 1;
      }
    }

    // Sample logo area (middle top of the page, around y = 200)
    const logoData = ctx.getImageData(Math.floor(canvas.width * 0.25), 150, Math.floor(canvas.width * 0.5), 100).data;
    const logoCounts = {};
    for (let i = 0; i < logoData.length; i += 4) {
      const r = logoData[i];
      const g = logoData[i+1];
      const b = logoData[i+2];
      const a = logoData[i+3];
      if (a > 200 && b > r + 30) {
        const hex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
        logoCounts[hex] = (logoCounts[hex] || 0) + 1;
      }
    }

    return {
      topFooterColors: Object.entries(footerCounts).sort((a,b) => b[1] - a[1]).slice(0, 5),
      topLogoColors: Object.entries(logoCounts).sort((a,b) => b[1] - a[1]).slice(0, 5)
    };
  });

  console.log(colors);
  await browser.close();
}

inspectUserScreenshot().catch(console.error);
