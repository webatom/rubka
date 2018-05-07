const Site = require('../models/site');
const mongoose = require('../models/mongoose');

const YMetrikaRequest = require('yandex-metrika');
// TODO получать его тоже
const oauthToken = process.env.oauthYandexToken;
// const oauthToken = '';
const api = new YMetrikaRequest(oauthToken);

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
  // ctx.body = await api.get(`/management/v1/counter/${ctx.couterId.idYaMetrika}`);
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
  // console.log(query);
  ctx.body = query.data;
  next();
}

module.exports = {getStatisticBySite};
