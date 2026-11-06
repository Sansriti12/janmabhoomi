import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Users\\NISHANT\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
];
const executablePath = chromePaths.find((p) => fs.existsSync(p));

async function verifyFooterDarker() {
  const browser = await puppeteer.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.goto('http://localhost:3001/en', { waitUntil: 'networkidle2' });

  const metrics = await page.evaluate(() => {
    const topStrip = document.querySelector('header > div:first-child');
    const homeTab = document.querySelector('nav[aria-label="Main category navigation"] a[href="/en"]');
    const footer = document.querySelector('footer');

    const topStripBg = topStrip ? window.getComputedStyle(topStrip).backgroundColor : null;
    const homeTabBg = homeTab ? window.getComputedStyle(homeTab).backgroundColor : null;
    const style = window.getComputedStyle(footer);
    const rect = footer.getBoundingClientRect();

    return {
      topStripBg,
      homeTabBg,
      footerBg: style.backgroundColor,
      borderTopColor: style.borderTopColor,
      textColor: style.color,
      height: Math.round(rect.height),
      isExactMatchToHeaderAndTab:
        style.backgroundColor === topStripBg &&
        style.backgroundColor === homeTabBg &&
        style.backgroundColor === 'rgb(1, 107, 183)'
    };
  });

  console.log('Footer metrics:', metrics);

  const footerHandle = await page.$('footer');
  if (footerHandle) {
    const shotPath = path.resolve('public/verification/footer-dark-verified.png');
    await footerHandle.screenshot({ path: shotPath });
    // Also copy to artifact directory
    fs.copyFileSync(shotPath, 'C:/Users/NISHANT/.gemini/antigravity/brain/55f986f8-5be6-43c3-81c5-48348c680539/footer-dark-verified.png');
    console.log('Screenshot saved to public/verification and artifact directory.');
  }

  await browser.close();
}

verifyFooterDarker().catch(console.error);
