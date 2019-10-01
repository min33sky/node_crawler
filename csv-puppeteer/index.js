const parse = require('csv-parse/lib/sync');
const stringify = require('csv-stringify/lib/sync');
const puppeteer = require('puppeteer-firefox');
const fs = require('fs');

const csvData = fs.readFileSync('./csv/data.csv');
const records = parse(csvData.toString());

// *참고: https://try-puppeteer.appspot.com/

const crawler = async () => {
  const result = []; // 결과값을 담을 배열
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'production', // true면 화면이 보이지 않는다. false는 개발용
    ignoreDefaultArgs: ['--disable-extensions'],
  });

  process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    browser.close();
  });

  const page = await browser.newPage();
  page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  );

  for (const [idx, record] of records.entries()) {
    await page.goto(record[1]);

    console.log(await page.evaluate('navigator.userAgent'));

    const text = await page.evaluate(() => {
      const score = document.querySelector('.score.score_left .star_score');
      if (score) {
        return score.textContent;
      }
    });

    if (text) {
      console.log(record[0], '평점', text.trim()); // 응답 순서대로 출력
      result[idx] = [record[0], '평점', text.trim()]; // ! 요청 순서대로 담기 위해서 push대신 index를 사용했다.
    }
    await page.waitFor(1000);
  }
  await page.close();

  // 동시에 여러 창으로 작업하기 (인간이 할 수 없는 작업이므로 걸릴 위험이 높다)
  // await Promise.all(
  //   records.map(async (record, idx) => {
  //     const page = await browser.newPage();

  //     await page.goto(record[1]);

  //     ! document를 사용하려면 evaluate() 안에서만 사용 가능하다.
  //     const text = await page.evaluate(() => {
  //       const score = document.querySelector('.score.score_left .star_score');
  //       if (score) {
  //         return score.textContent;
  //       }
  //     });

  //     if (text) {
  //       console.log(record[0], '평점', text.trim()); // 응답 순서대로 출력
  //       result[idx] = [record[0], '평점', text.trim()]; // ! 요청 순서대로 담기 위해서 push대신 index를 사용했다.
  //     }

  //     await page.close();
  //   }),
  // );
  await browser.close();
  const str = stringify(result); // 2차원 배열을 csv 문자열로 변환
  fs.writeFileSync('./csv/result.csv', str);
};

crawler();
