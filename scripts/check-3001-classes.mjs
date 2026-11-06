import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3001/en', { waitUntil: 'networkidle2' });

  const info = await page.evaluate(() => {
    const el = document.querySelector('nav[aria-label="Main category navigation"] a[href="/en"]');
    return {
      className: el?.className,
      color: window.getComputedStyle(el).color,
      inlineStyle: el?.getAttribute('style')
    };
  });

  console.log('3001 Home tab info:', info);
  await browser.close();
}

main().catch(console.error);
