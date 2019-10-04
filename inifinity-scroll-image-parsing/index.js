const puppeteer = require('puppeteer');
const { default: axios } = require('axios');
const fs = require('fs');

fs.readdir('images', (err) => {
  if (err) {
    console.log('images 폴더가 존재하지 않으므로 images 폴더를 생성합니다.');
    fs.mkdirSync('images');
  }
});

/**
 *  인피니티 스크롤을 사용한 페이지 크롤링 하기
 */
const crawler = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production',
    });
    const page = await browser.newPage();
    await page.goto('https://unsplash.com');

    let imageResults = []; // 크롤링 할 이미지 파일들을 담을 배열

    /**
     * ? window.scrollTo vs window.scrollBy
     * ? : window.scrollTo는 절대 주소
     * ? : window.scrollBy는 상대 주소
     */
    while (imageResults.length <= 30) {
      const srcs = await page.evaluate(() => {
        window.scrollTo(0, 0); // 스크롤이 하단에 닿는 걸 예방하기 위해서 최상단으로 이동
        let imgs = []; // 스크롤당 로딩되는 이미지
        const imgEls = Array.from(document.querySelectorAll('._1Nk0C'));
        if (imgEls.length) {
          imgEls.forEach((v) => {
            let src = v.querySelector('img._2zEKz').src;
            if (src) {
              imgs.push(src);
            }
            // ! 자원 낭비를 막기위해서 이미 크롤링 한 부분은 삭제한다.
            // ! 이미지 자체를 지우는게 아니라 이미지를 갖고 있는 컨테이너를 삭제하자 (._1NK0c)
            v.parentElement.removeChild(v);
          });
        }
        // ? 스크롤을 2번 움직인 이유?
        // ? : 사이트의 인피니트스크롤이 1번으로는 반응을 안해서
        window.scrollBy(0, 100);
        setTimeout(() => {
          window.scrollBy(0, 200);
        }, 500);
        return imgs;
      });

      imageResults = imageResults.concat(srcs);

      // 컨테이너(._1NK0c)를 다 삭제했으므로 로딩 후 다시 생기길 기다린다.
      await page.waitForSelector('._1Nk0C');

      console.log('새 이미지 태그 로딩 완료');
    }

    console.log(imageResults); // 크롤링 한 이미지 주소들

    imageResults.forEach(async (image) => {
      const downloadImage = await axios.get(image.replace('/?.*$/g', ''), {
        responseType: 'arraybuffer',
      });
      fs.writeFileSync(
        `images/${new Date().valueOf()}.jpg`,
        downloadImage.data,
      );
    });

    await page.close();
    await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
