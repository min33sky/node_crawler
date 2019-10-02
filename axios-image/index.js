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
  });

  const page = await browser.newPage();

  page.setUserAgent(
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
      // 쿼리 스트링 부분을 제거
      const imgResult = await axios.get(results.img.replace(/\?.*$/, ''), {
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
