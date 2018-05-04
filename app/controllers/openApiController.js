const Site = require('../models/site');
// const SiteElement = require('../models/siteElement');

class Res {
  constructor(keyName, value) {
    this.keyName = keyName;
    this.value = value;
  }
}

async function getInfo(ctx, next) {
  // ctx.request.query.token ctx.request.query.utm_term
  let site = await Site.findOne({'token': ctx.request.query.token}).populate([{
    path: 'siteScripts',
    match: {utm_term: ctx.request.query.utm_term},
    // where: {'utm_term': ctx.request.query.utm_term},
    populate: [{
      path: 'scriptVersions',
      populate: [{
        path: 'elementsValue',
        populate: {
          path: 'siteElementId',
          select: 'keyName'
        }
      }]
    }]
  }]);
  let res = [];
  if (!site) {
    ctx.throw(404);
  }
  let values = site.toObject().siteScripts[0].scriptVersions[0].elementsValue;
  for (let i = 0; i < values.length; i++) {
    res.push(new Res(values[i].siteElementId.keyName, values[i].value));
  }
  ctx.body = res;
  next();
}

module.exports = {getInfo};
