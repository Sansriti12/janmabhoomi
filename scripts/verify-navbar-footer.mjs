import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function verifyPort(port) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const url = `http://localhost:${port}/en`;
  console.log(`Verifying ${url} ...`);
  await page.goto(url, { waitUntil: 'networkidle2' });

  const evalResult = await page.evaluate(() => {
    const topStrip = document.querySelector('header > div:first-child');
    const homeTab = document.querySelector('nav[aria-label="Main category navigation"] a[href="/en"]');
    const footer = document.querySelector('footer');

    const topStripBg = topStrip ? window.getComputedStyle(topStrip).backgroundColor : null;
    const homeTabBg = homeTab ? window.getComputedStyle(homeTab).backgroundColor : null;
    const homeTabColor = homeTab ? window.getComputedStyle(homeTab).color : null;
    const footerBg = footer ? window.getComputedStyle(footer).backgroundColor : null;

    return {
      topStripBg,
      homeTabBg,
      homeTabColor,
      footerBg,
      isFooterMatchingTopStrip: footerBg === topStripBg && footerBg === 'rgb(1, 107, 183)',
      isHomeTabCleanText: homeTabBg === 'rgba(0, 0, 0, 0)' && homeTabColor === 'rgb(1, 107, 183)',
    };
  });

  console.log(`Results for ${url}:`, JSON.stringify(evalResult, null, 2));
  await browser.close();
}

async function main() {
  await verifyPort(3000);
  await verifyPort(3001);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
