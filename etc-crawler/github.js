const puppeteer = require('puppeteer');

/**
 * Github Crawler
 */
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

    // 크롤링에 필요한 변수 설정
    let crawlingResults = [];
    let pageNum = 1;
    const keyword = 'crawler';

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    // ! github는 봇으로 크롤링을 감지하기 때문에 userAgent를 설정한다. (사용해도 감지가 안되는건 아니다.)
    page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
    );

    await page.goto(`https://github.com/search?q=${keyword}`);

    while (pageNum <= 5) {
      const r = await page.evaluate(() => {
        const tags = Array.from(document.querySelectorAll('.repo-list-item'));
        const result = [];

        tags.forEach((t) => {
          result.push({
            name:
              t &&
              t.querySelector('p') &&
              t.querySelector('p').textContent.trim(),
            star:
              t &&
              t.querySelector('.muted-link') &&
              t.querySelector('.muted-link').textContent.trim(),
            lang:
              t &&
              t.querySelector('span') &&
              t.querySelector('span').textContent.trim(),
          });
        });

        return result;
      });

      crawlingResults = crawlingResults.concat(r);

      await page.waitForSelector('.next_page');
      await page.click('.next_page');
      pageNum++;

      // ! github는 pjax방식으로 구현되어 있는 SPA이다. 태그들을 응답받아 새로고침 없이 화면을 변경한다.
      await page.waitForResponse((response) => {
        return (
          response.url().startsWith(`https://github.com/search?p=${pageNum}`) &&
          response.status() === 200
        );
      });
      await page.waitFor(3000);
    }

    console.log(crawlingResults.length);
    console.log(crawlingResults);

    await page.close();
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
