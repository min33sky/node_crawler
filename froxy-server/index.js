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
      // froxy ip
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

    await page.close();
    await browser.close();

    // 기존 브라우저를 종료하고 프록시 서버 아이피로 다시 브라우저를 실행
    browser = await puppeteer.launch({
      headless: false,
      args: [
        '--window-size=1920,1080',
        '--disable-notifications',
        `--proxy-server=${filtered[0].ip}`,
      ],
    });
    page = await browser.newPage();
  } catch (error) {
    console.error(error);
  }
};

crawler();
