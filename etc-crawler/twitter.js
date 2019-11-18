const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--disable-notifications',
        '--no-sandbox',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });
    page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    );

    await page.goto('https://twitter.com', {
      waitUntil: 'networkidle0',
    });

    await page.type('.LoginForm-username input', EMAIL);
    await page.type('.LoginForm-password input', PASSWORD);
    await page.waitForSelector('input[type=submit]');
    await page.click('input[type=submit]');

    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
