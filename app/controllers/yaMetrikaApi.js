const Site = require('../models/site');
const mongoose = require('../models/mongoose');
const rp = require('request-promise');

const YMetrikaRequest = require('yandex-metrika');
// const oauthToken = process.env.oauthYandexToken;
const oauthToken = 'AQAAAAAmcFxKAATo5lL-0y7rgE-djM-RFArj7T0';
// 'AQAAAAAmcFxKAATo5lL-0y7rgE-djM-RFArj7T0';
const api = new YMetrikaRequest(oauthToken);
const clientId = '0031c3e64b3b4bbca25db4623c21834d';
const clientSecret = '51f17b9ce02747fc94687a0efe6f69e4';

async function getCounterId(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.request.query.siteId)) {
    ctx.throw(404);
  }

  ctx.couterId = await Site.findById(ctx.request.query.siteId).select('idYaMetrika');

  if (!ctx.couterId) {
    ctx.throw(404);
  }
}

async function getStatisticBySite(ctx, next) {
  await getCounterId(ctx);
  let query = await api.get('/stat/v1/data', {
    'ids': ctx.couterId.idYaMetrika,
    'metrics': 'ym:s:pageviews,ym:s:newUsers',
    'dimensions': 'ym:s:date',
    'group': 'day',
    'date1': '7daysAgo',
    'date2': 'yesterday',
    'sort': 'ym:s:date',
    'include_undefined': 'true'
  });
  console.log(query);
  ctx.body = query.data;
  next();
}

async function getTokenByCode(code) {
  let options = {
    method: 'POST',
    uri: 'https://oauth.yandex.ru/token',
    form: {
      grant_type: 'authorization_code', code: code, client_id: clientId, client_secret: clientSecret
    },
    json: true
  };

  let res = await rp(options);
  return res;
}

async function getYandexToken(ctx, next) {
  let code = ctx.request.query.code;
  let res = {access_token: ''};
  if (typeof code !== 'undefined') {
    res = await getTokenByCode(code);
  }
  ctx.redirect('http://localhost:8080/setToken?token=' + res.access_token);
  // ctx.body = res.access_token + '<script>alert(0)</script>';
  await next();
}

module.exports = {getYandexToken, getStatisticBySite};
