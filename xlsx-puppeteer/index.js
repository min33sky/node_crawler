const add_to_sheet = require('./add_to_sheet');
const puppeteer = require('puppeteer');
const xlsx = require('xlsx');

const workbook = xlsx.readFile('./xlsx/data.xlsx');

const ws = workbook.Sheets.영화목록;

const records = xlsx.utils.sheet_to_json(ws);

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

    const text = await page.evaluate(() => {
      const score = document.querySelector('.score.score_left .star_score');
      if (score) {
        return score.textContent;
      }
    });

    if (text) {
      console.log(record.제목, '평점', text.trim()); // 응답 순서대로 출력
      const newCell = 'C' + (idx + 2);
      add_to_sheet(ws, newCell, 'n', parseFloat(text.trim()));
    }
    await page.waitFor(1000);
  }
  await page.close();

  xlsx.writeFile(workbook, './xlsx/result.xlsx');

  await browser.close();
};

crawler();
