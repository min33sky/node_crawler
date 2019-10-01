const xlsx = require('xlsx');
const axios = require('axios');
const cheerio = require('cheerio');
const add_to_sheet = require('./add_to_sheet');

const workbook = xlsx.readFile('./xlsx/data.xlsx');

const ws = workbook.Sheets.영화목록; // 엑셀 파일의 시트를 가져온다.
// console.log(workbook.SheetNames); // 시트 목록을 가져온다.
// console.log(ws['!ref']); // 파싱 범위를 알려준다. (A1:B11)

// 파싱 범위 수정 (A2:B11)
// ws['!ref'] = ws['!ref']
//   .split(':')
//   .map((v, i) => {
//     if (i === 0) {
//       return 'A2';
//     }
//     return v;
//   })
//   .join(':');

const records = xlsx.utils.sheet_to_json(ws); // JSON 형식으로 파싱
// const records = xlsx.utils.sheet_to_json(ws, { header: 'A' }); // A열, B열 등... 칼럼명으로 불러온다.
// records.shift(); // 첫 행을 지우는 가장 쉬운 방법

records.forEach((record, idx) => {
  console.log(idx, record.제목, record.링크);
  // console.log(idx, record.A, record.B);
});

const crawler = async () => {
  /**
   * ? for..of 구문 VS Promise.all 구문
   * * for..of는 async, await으로 비동기를 일정한 순서로 출력이 가능하지만 속도가 느리다.
   * * Promise.all은 속도는 빠르지만 출력 순서는 보장하지 못한다.
   */

  for (const [idx, record] of records.entries()) {
    add_to_sheet(ws, 'C1', 's', '평점'); // 엑셀 파일에 행을 삽입한다.
    const response = await axios.get(record.링크);
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const text = $('.score.score_left .star_score').text();
      console.log(record.제목, '평점', text.trim());
      const newCell = 'C' + (idx + 2);
      add_to_sheet(ws, newCell, 'n', parseFloat(text.trim()));
    }
  }

  xlsx.writeFile(workbook, 'xlsx/result.xlsx'); // 해당 파일에 출력

  // await Promise.all(
  //   records.map(async (record) => {
  //     const response = await axios.get(record.링크);
  //     if (response.status === 200) {
  //       const html = response.data;
  //       const $ = cheerio.load(html);
  //       const text = $('.score.score_left .star_score').text();
  //       console.log(record.제목, '평점', text.trim());
  //     }
  //   }),
  // );
};

crawler();
