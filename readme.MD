# Node Crawler

> Node로 크롤러를 만들어 보자.

## Modules

- axios
- cheerio
- puppeteer
- xlsx
- csv-parse
- csv-stringify

## Problem

- puppeteer `1.20` 버전에서 크로미움에 문제가 발생.

  - 해결: `1.12`버전 || puppeteer-firefox 사용

- axios typeof import error

```js
const { default: axios } = require('axios'); // es5
import * as axios from 'axios'; // es6
```

## References

- [try-puppeteer](https://try-puppeteer.appspot.com/)
