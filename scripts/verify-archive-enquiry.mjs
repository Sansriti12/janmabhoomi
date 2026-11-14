import puppeteer from 'puppeteer-core';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100 });

  console.log('1. Testing English Archive Enquiry page: http://localhost:3000/en/archive-enquiry ...');
  const enRes = await page.goto('http://localhost:3000/en/archive-enquiry', { waitUntil: 'networkidle2' });
  console.log('EN Status:', enRes.status());

  const pageTitle = await page.$eval('h1', el => el.textContent.trim());
  console.log('EN Page Title:', pageTitle);

  // Take screenshot of form
  await page.screenshot({ path: 'public/verification/archive-enquiry-en.png' });

  // Test form validation by clicking Submit without filling
  console.log('2. Testing validation errors on empty submit ...');
  await page.click('button[type="submit"]');
  await new Promise(r => setTimeout(r, 400));
  const errorText = await page.evaluate(() => {
    const alert = document.querySelector('[role="alert"]');
    return alert ? alert.textContent : null;
  });
  console.log('Validation alert text:', errorText);

  // Fill in valid details
  console.log('3. Filling form with valid enquiry data ...');
  await page.type('#fullName', 'Dr. Kirit Parekh');
  await page.type('#contactNumber', '9820198201');
  await page.type('#email', 'kirit.parekh@example.com');
  await page.select('#publication', 'janmabhoomi');
  await page.select('#year', '1947');
  await page.select('#infoType', 'historical');
  await page.type('#additionalDetails', 'Seeking front page reports published during August 1947 covering Indian Independence dispatches.');
  
  // Consent checkbox
  await page.click('input[type="checkbox"]');

  // Submit enquiry
  console.log('4. Submitting form ...');
  await page.click('button[type="submit"]');

  // Wait for success confirmation
  await page.waitForSelector('h2', { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  const successInfo = await page.evaluate(() => {
    const heading = document.querySelector('h2')?.textContent?.trim();
    const refCode = document.querySelector('span.font-mono')?.textContent?.trim();
    return { heading, refCode };
  });
  console.log('Submission result:', JSON.stringify(successInfo, null, 2));

  // Screenshot success confirmation
  await page.screenshot({ path: 'public/verification/archive-enquiry-success.png' });

  // 5. Test Gujarati Archive Enquiry page
  console.log('5. Testing Gujarati Archive Enquiry page: http://localhost:3000/gu/archive-enquiry ...');
  const guRes = await page.goto('http://localhost:3000/gu/archive-enquiry', { waitUntil: 'networkidle2' });
  console.log('GU Status:', guRes.status());
  const guTitle = await page.$eval('h1', el => el.textContent.trim());
  console.log('GU Page Title:', guTitle);

  await page.screenshot({ path: 'public/verification/archive-enquiry-gu.png' });

  await browser.close();
  console.log('All browser verification tests completed successfully!');
}

main().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
