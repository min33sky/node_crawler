const puppeteer = require('puppeteer');
const fs = require('fs');
const dotenv = require('dotenv');
const ytdl = require('ytdl-core');
dotenv.config();

/**
 * 유튜브 크롤러
 */
const crawler = async () => {
  try {
    // ! 특정 사이트가 제대로 보이지 않아 크롤링되지 않을 때는 크로미움 버전을 바꿔보는게 좋다.
    const browserFetcher = await puppeteer.createBrowserFetcher(); // 크로미움 브라우저를 가져오기 위한 준비
    const revisionInfo = await browserFetcher.download('639850'); // 해당 버전의 크로미움을 다운받는다. (node check_availability.js 실행해서 버전 체크)

    const browser = await puppeteer.launch({
      headless: false,
      executablePath: revisionInfo.executablePath, // 특정 버전의 브라우저 설정
      userDataDir: `C:\Users\Heo-MH\AppData\Local\Google\Chrome\User Data`, // 크롬 유저 데이터 저장소 (자동 로그인용)
      args: ['--window-size=1920,1080', '--disable-notifications'],
    });

    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1080,
    });

    await page.goto('https://www.youtube.com', {
      waitUntil: 'networkidle0', // 모든 네트워크 처리가 완료될 때까지 대기 (동영상 스트리밍에는 사용하면 안됨)
    });

    // 로그인 되지 않았을 경우
    if (!(await page.$('#avatar-btn'))) {
      await page.waitForSelector('#buttons ytd-button-renderer a');

      await page.click('#buttons ytd-button-renderer a'); // 로그인 버튼 클릭

      await page.waitForNavigation({
        waitUntil: 'networkidle2', // networkidle0 보다는 여유 있게 대기
      });

      // 로그인 하기
      await page.waitForSelector('#identifierId');
      await page.type('#identifierId', process.env.EMAIL);
      await page.waitForSelector('#identifierNext');
      await page.click('#identifierNext');

      await page.waitForNavigation({
        waitUntil: 'networkidle2',
      });

      await page.waitForSelector('input[name="password"]');
      // await page.type('input[name="password"]', '1234');
      // ! type 함수가 안 먹힐때는 evaluate로 강제로 넣어주면 된다.
      await page.evaluate((password) => {
        document.querySelector('input[name="password"]').value = password;
      }, process.env.PASSWORD);
      await page.waitFor(3000); // type에 비해 바로 입력되므로 딜레이를 준다.
      await page.waitForSelector('#passwordNext');
      await page.click('#passwordNext');

      await page.waitForNavigation({
        waitUntil: 'networkidle2',
      });
    } else {
      console.log('이미 로그인 중....');
    }

    // 유튜브 인기 동영상 다운로드
    await page.goto('https://www.youtube.com/feed/trending', {
      waitUntil: 'networkidle0',
    });

    await page.waitForSelector('ytd-video-renderer');
    await page.click('ytd-video-renderer');

    const url = await page.url();
    // const title = await page.title();
    // console.log(url, title);

    const info = await ytdl.getInfo(url);
    console.log(info);

    // ytel(url)을 호출하면 readableStream을 리턴하고 pipe로 연결해서 파일을 다운로드 받는다.
    // \u20A9는 대한민국 화폐(원) 표시인데 윈도우에서 경로를 나타날 때 쓰이므로 없애준다.
    ytdl(url).pipe(
      fs.createWriteStream(`${info.title.replace(/\u20A9/g, '')}.mp4`),
    );

    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error(error);
  }
};

crawler();
