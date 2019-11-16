const puppeteer = require('puppeteer');

/**
 * 아마존 크롤러
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

    let goodsResult = [];

    await Promise.all(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(async (v) => {
        const page = await browser.newPage();
        await page.setViewport({
          width: 1080,
          height: 1080,
        });

        const keyword = 'mouse';
        /**
         * 잘 만들어진 사이트들은
         * 검색어를 직접 입력하는 것보다 주소창으로 접근하는 것이 더 효율적이다.
         */
        await page.goto(`https://www.amazon.com/s?k=${keyword}&page=${v}`, {
          waitUntil: 'networkidle0',
        });

        const r = await page.evaluate(() => {
          const result = [];
          const tags = Array.from(
            document.querySelectorAll('.s-result-list > div'),
          );

          tags.forEach((t) => {
            result.push({
              name:
                t &&
                t.querySelector('h2') &&
                t.querySelector('h2').textContent.trim(),
              price:
                t &&
                t.querySelector('.a-offscreen') &&
                t.querySelector('.a-offscreen').textContent.trim(),
            });
          });

          return result;
        });

        goodsResult = goodsResult.concat(r);
      }),
    );

    console.log(goodsResult.length);
    console.log(goodsResult[0]);

    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
