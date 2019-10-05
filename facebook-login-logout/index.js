const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

/**
 * 페이스북 로그인, 로그아웃
 */
const crawler = async () => {
  try {
    const EMAIL = process.env.email;
    const PASSWORD = process.env.password;
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    await page.goto('https://www.facebook.com');

    // * pupppeteer method로 로그인 하기
    await page.type('#email', EMAIL); // 해당 위치에 타이핑 하기
    await page.type('#pass', PASSWORD);
    await page.hover('#loginbutton'); // 마우스 올려놓기
    await page.waitFor(3000);
    await page.click('#loginbutton');
    // 로그인 응답이 올 때까지 기다린다.
    await page.waitForResponse((response) => {
      // * 개발자 도구의 네트워크탭에서 로그인 요청과 관련있는 걸 찾아보자.
      // * 페이스북의 경우엔 url에 login_attempt가 포함되어 있다.
      return response.url().includes('login_attempt');
    });
    await page.waitFor(3000);
    await page.keyboard.press('Escape'); // ESC키 누르기 (크롤링 시 검은화면이 뜨는 경우)

    // 로그아웃 하기
    await page.click('#pageLoginAnchor');
    await page.waitForSelector('li.navSubmenu:last-child');
    await page.waitFor(3000);
    await page.click('li.navSubmenu:last-child');

    // ! click이 안될 경우
    // await page.evaluate(() => {
    //   document.querySelector('li.navSubmenu:last-child').click();
    // })

    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
