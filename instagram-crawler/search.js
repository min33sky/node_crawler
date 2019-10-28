const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const db = require('./models');
dotenv.config();

/**
 * 인스타그램 검색하기
 */
const crawler = async () => {
  try {
    await db.sequelize.sync(); // db 연결
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications'],
      userDataDir: `C:\Users\Heo-MH\AppData\Local\Google\Chrome\User Data`, // 크롬 유저 데이터 저장소
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    await page.goto('https://www.instagram.com');

    if (await page.$('a[href="/donjasaeng/"]')) {
      console.log('이미 로그인 중입니다..');
    } else {
      await page.waitForSelector('.sqdOP');
      await page.click('.sqdOP');
      await page.waitForNavigation(); // 주소가 바뀔 때 사용하는 메서드 (ex) instagram -> facebook
      await page.type('#email', process.env.EMAIL);
      await page.type('#pass', process.env.PASSWORD);
      await page.waitFor(3000);
      await page.click('#loginbutton');
      await page.waitForNavigation();
      console.log('로그인 성공!!');
    }

    // 검색 인풋창
    await page.waitForSelector('input.x3qfX');
    await page.click('input.x3qfX');
    await page.keyboard.type('국밥');
    await page.waitForSelector('.yCE8d');
    const href = await page.evaluate(() => {
      return document.querySelector('.yCE8d').href;
    });

    await page.waitFor(1000);

    await page.goto(href);

    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
