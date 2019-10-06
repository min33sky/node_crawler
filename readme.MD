# Node Crawler

> Node로 크롤러를 만들어 보자.

---

## Modules

- axios
- cheerio
- puppeteer
- xlsx
- csv-parse
- csv-stringify
- mysql2
- sequelize

---

## Settings

**1. Headless mode**

개발할 때는 headless를 `false`로 설정해야 크롤링 되는 모습을 브라우저로 확인할 수 있다.

```js
const browser = await puppeteer.launch({
  headless: false, // default is true
  args: [
    '--window-size=1920,1080', // browser 크기
    '--disable-notifications', // 브라우저 알림 창 제거
  ],
});
```

**2. evaluate**

- dom에 접근하는 메서드들은 `evaluate` 함수 안에서만 사용할 수 있다.

- `evaluate` 내부는 자바스크립트 스코프를 따르지 않아서 인자로 넘겨야 된다.

```js
await page.evaluate(
  (email, password) => {
    document.querySelector('#email').value = email;
    document.querySelector('#pass').value = password;
    document.querySelector('#loginbutton').click();
  },
  EMAIL,
  PASSWORD,
);
```

---

## Problem

- puppeteer `1.20` 버전에서 크로미움에 문제가 발생.

  - 해결: `1.12`버전 || puppeteer-firefox 사용

- axios typeof import error

```js
const { default: axios } = require('axios'); // es5
import * as axios from 'axios'; // es6
```

---

## References

- [try-puppeteer](https://try-puppeteer.appspot.com/)
- [keyboardLayout](https://github.com/GoogleChrome/puppeteer/blob/master/lib/USKeyboardLayout.js)
- [free-proxy](http://spys.one/free-proxy-list/KR/)
