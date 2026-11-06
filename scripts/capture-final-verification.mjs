import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3001/en', { waitUntil: 'networkidle2' });

  // Capture navbar area
  await page.screenshot({
    path: 'public/verification/navbar-final.png',
    clip: { x: 0, y: 0, width: 1440, height: 260 }
  });

  // Capture footer area
  const footerHandle = await page.$('footer');
  if (footerHandle) {
    await footerHandle.screenshot({
      path: 'public/verification/footer-final.png'
    });
  }

  await browser.close();
  console.log('Screenshots captured successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
