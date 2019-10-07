const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const db = require('./models');
dotenv.config();

/**
 * 페이스북 글 쓰기
 */
const crawler = async () => {
  try {
    await db.sequelize.sync();
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    await page.goto('http://www.facebook.com');
    await page.type('#email', process.env.EMAIL);
    await page.type('#pass', process.env.PASSWORD);

    await page.waitFor(1000);

    await page.click('#loginbutton');

    await page.waitForResponse((response) => {
      return response.url().includes('login_attempt');
    });

    await page.keyboard.press('Escape');

    await page.waitForSelector('textarea');
    await page.click('textarea');
    await page.waitForSelector('._5rpb > div');
    await page.click('._5rpb > div');

    await page.keyboard.type('테스트.. 테스트 중입니다....');
    await page.waitForSelector('._45wg._69yt button');
    await page.waitFor(5000);
    await page.click('._45wg._69yt button');

    await page.waitFor(10000);

    await page.close();
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
