const rp = require('request-promise');

class YandexDirect {
  constructor(token) {
    this.token = token;
  }

  async get(serviceName, body) {
    let options = {
      method: 'POST',
      uri: 'https://api.direct.yandex.com/json/v5/' + serviceName,
      headers: {
        'Authorization': 'Bearer ' + this.token,
        'Accept-Language': 'ru',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body,
      json: true
    };
    let res = await rp(options);
    return res;
  }
}

module.exports = YandexDirect;
