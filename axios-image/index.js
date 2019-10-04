const add_to_sheet = require('./add_to_sheet');
const xlsx = require('xlsx');
const puppeteer = require('puppeteer');
const { default: axios } = require('axios'); // ! axios typeof import 문제 해결
const fs = require('fs');

const workbook = xlsx.readFile('./xlsx/data.xlsx');
const ws = workbook.Sheets.영화목록;

const records = xlsx.utils.sheet_to_json(ws);

// ***** 폴더 생성 *********************************************

fs.readdir('poster', (err) => {
  if (err) {
    console.log('poster 폴더가 없어 poster 폴더 생성');
    fs.mkdirSync('poster');
  }
});

fs.readdir('screenshot', (err) => {
  if (err) {
    console.log('screenshot 폴더가 없어 screenshot 폴더 생성');
    fs.mkdirSync('screenshot');
  }
});

// ***** 크롤러 함수 ********************************************

const crawler = async () => {
  const browser = await puppeteer.launch({
    headless: process.env.NODE_ENV === 'production',
    args: ['--window-size=1920,1080'],
  });

  const page = await browser.newPage();

  await page.setViewport({
    width: 1929,
    height: 1080,
  });

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.90 Safari/537.36',
  );

  add_to_sheet(ws, 'C1', 's', '평점');

  for (const [idx, record] of records.entries()) {
    await page.goto(record.링크);

    const results = await page.evaluate(() => {
      const scoreEl = document.querySelector('.score.score_left .star_score');
      let score;
      if (scoreEl) {
        score = scoreEl.textContent;
      }
      let img;
      const imgEl = document.querySelector('.poster img');
      if (imgEl) {
        img = imgEl.src;
      }
      return { score, img };
    });

    if (results.score) {
      console.log(record.제목, '평점', parseFloat(results.score.trim()));
      const newCell = 'C' + (idx + 2);
      add_to_sheet(ws, newCell, 'n', parseFloat(results.score.trim()));
    }

    if (results.img) {
      // 스크린샷 찍기
      await page.screenshot({
        path: `screenshot/${record.제목}.png`,
        fullPage: true,
        // * clip : 특정 부분만 캡쳐하기 (fullpage와 동시 적용 불가)
        // clip: {
        //   x: 100,
        //   y: 100,
        //   width: 300,
        //   height: 300,
        // },
      });

      // 쿼리 스트링 부분을 제거 (쿼리스트링 부분이 이미지 크기 제한을 설정함)
      const imgResult = await axios.get(results.img.replace(/\?.*$/, ''), {
        // 버퍼들의 배열로 응답받는다.
        responseType: 'arraybuffer',
      });
      fs.writeFileSync(`poster/${record.제목}.jpg`, imgResult.data);
    }

    await page.waitFor(1000);
  }

  xlsx.writeFile(workbook, './xlsx/result.xlsx');

  await page.close();
  await browser.close();
};

crawler();
