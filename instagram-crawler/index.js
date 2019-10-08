const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

/**
 * 인스타그램 크롤링
 * : 인피니티 스크롤 (virtualized list)가 적용되어 있다.
 * : 일정한 개수(8개)의 게시물까지만 로딩되어 있고 dom을 지워도 새로운 dom이 로딩되지 않는다.
 * : 기존 인피니티 스크롤 크롤링과는 다른 방식으로 진행.
 */
const crawler = async () => {
  try {
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

    await page.waitForSelector('article');

    let results = []; // 크롤링 결과 배열
    let prevPostId = ''; // 이전에 크롤링 한 게시물 ID
    while (results.length < 10) {
      // 더 보기 버튼 클릭하기
      const moreButton = await page.$('button.sXUSN');
      if (moreButton) {
        await page.evaluate((btn) => {
          btn.click();
        }, moreButton);
      }

      const newPost = await page.evaluate(() => {
        // 인스타그램은 게시물들이 article 태그로 구분이 쉽게 되어있다.
        const article = document.querySelector('article');
        const postId =
          article.querySelector('.c-Yi7') &&
          article.querySelector('.c-Yi7').href;
        const name =
          article.querySelector('h2') &&
          article.querySelector('h2').textContent;
        const img =
          article.querySelector('.KL4Bh img') &&
          article.querySelector('.KL4Bh img').src;
        const content =
          article.querySelector('.C4VMK > span') &&
          article.querySelector('.C4VMK > span').textContent;

        return {
          postId,
          name,
          img,
          content,
        };
      });

      // 이전에 크롤링 한 게시물이 아닐 때만 결과에 포함시킨다.
      if (newPost.postId !== prevPostId) {
        console.log(newPost);
        if (!results.find((v) => v.postId === newPost.postId)) {
          results.push(newPost);
        }
      }

      prevPostId = newPost.postId;

      await page.waitFor(500);

      //  스크롤을 내려서 새로운 게시물 크롤링 준비
      await page.evaluate(() => {
        window.scrollBy(0, 800);
      });
    }

    console.log('#### 결과물 개수 : ', results.length);

    await page.close();
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
