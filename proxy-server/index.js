const puppeteer = require('puppeteer');
const db = require('./models');

const crawler = async () => {
  await db.sequelize.sync();
  try {
    let browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1920,1080', '--disable-notifications'],
    });

    let page = await browser.newPage();

    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    await page.goto('http://spys.one/free-proxy-list/KR/');

    const proxies = await page.evaluate(() => {
      // proxy ip
      const ips = Array.from(
        document.querySelectorAll('tr > td:first-of-type > .spy14'),
      ).map((v) => v.textContent.replace(/document\.write\(.+\)/, ''));

      // type (HTTP, HTTS, ...)
      const types = Array.from(
        document.querySelectorAll('tr > td:nth-of-type(2)'),
      )
        .slice(4)
        .map((v) => v.textContent);

      // latency
      const latencies = Array.from(
        document.querySelectorAll('tr > td:nth-of-type(6) .spy1'),
      ).map((v) => v.textContent);

      // 프록시 관련 객체들의 배열로 리턴한다.
      return ips.map((v, i) => {
        return {
          ip: v,
          type: types[i],
          latency: latencies[i],
        };
      });
    });

    // HTTP로 시작되는 Type만 필터링하고 latency가 낮은거부터 정렬을 한다.
    const filtered = proxies
      .filter((v) => v.type.startsWith('HTTP'))
      .sort((p, c) => p.latency - c.latency);

    console.log(filtered);

    // db에 저장
    await Promise.all(
      filtered.map(async (value) => {
        // ! upsert : DB에 있는건 수정, 없는건 생성
        return db.proxy.upsert({
          ip: value.ip,
          type: value.type,
          latency: value.latency,
        });
      }),
    );

    await page.close();
    await browser.close();

    const fastestProxy = await db.proxy.findOne({
      offset: 1,
      order: [['latency', 'ASC']],
    });

    console.log('fastestProxy', fastestProxy);

    // 기존 브라우저를 종료하고 프록시 서버 아이피로 다시 브라우저를 실행
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--disable-notifications',
        `--proxy-server=${fastestProxy.ip}`,
      ],
    });

    // 시크릿 창으로 실행하기
    const context = await browser.createIncognitoBrowserContext();
    const context2 = await browser.createIncognitoBrowserContext();
    const context3 = await browser.createIncognitoBrowserContext();
    console.log(await browser.browserContexts());

    const page1 = await context.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();
    await page1.goto(
      'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%82%B4+%EC%95%84%EC%9D%B4%ED%94%BC',
    );
    await page2.goto(
      'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%82%B4+%EC%95%84%EC%9D%B4%ED%94%BC',
    );
    await page3.goto(
      'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%82%B4+%EC%95%84%EC%9D%B4%ED%94%BC',
    );

    page = await browser.newPage();
    await page.goto(
      'https://search.naver.com/search.naver?sm=top_hty&fbm=1&ie=utf8&query=%EB%82%B4+%EC%95%84%EC%9D%B4%ED%94%BC',
    );
    await page.waitFor(10000);
    await page.close();
    await browser.close();
    await db.sequelize.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
