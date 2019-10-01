const parse = require('csv-parse/lib/sync');
const fs = require('fs');

const csv = fs.readFileSync('./csv/data.csv'); // 파일을 읽어서 버퍼로 리턴
const records = parse(csv.toString('utf-8')); // 버퍼를 문자열로 변환 후 2차원 배열로 변환한다.

records.forEach((record, idx) => {
  console.log(idx, record);
});
