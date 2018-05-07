const Site = require('../models/site');
const ScriptVersion = require('../models/scriptVersion');

class Res {
  constructor(keyName, value) {
    this.keyName = keyName;
    this.value = value;
  }
}

/**
 * Возвращает список элементов по token и utm_term
 * @param  {ctx.request.query.token} token  token - уникальный идентификатор сайта
 * @param  {ctx.request.query.utm_term} utm_tern  utm-метка (идентификатор сценария)
 * @return {res} массив элементов с keyName и value
 */
async function getContent(ctx, next) {
  // ctx.request.query.token ctx.request.query.utm_term
  let query = await Site.findOne({'token': ctx.request.query.token}).populate([{
    path: 'siteScripts',
    match: {utm_term: ctx.request.query.utm_term}
  }]);

  if (!query || !query.toObject().siteScripts[0]) {
    ctx.throw(404);
  }

  let siteScript = query.toObject().siteScripts[0];

  query = await ScriptVersion.findOne({'siteScriptId': siteScript.id, 'isActive': true}).populate([{
    path: 'elementsValue',
    populate: {
      path: 'siteElementId'
    }
  }]);

  if (!query) {
    ctx.throw(404);
  }

  let res = [];
  let values = query.toObject().elementsValue;
  for (let i = 0; i < values.length; i++) {
    if (values[i].isEmpty) {
      res.push(new Res(values[i].siteElementId.keyName, ''));
    } else {
      if (values[i].value == '') {
        continue;
      }
      res.push(new Res(values[i].siteElementId.keyName, values[i].value));
    }
  }

  ctx.body = res;
  next();
}

module.exports = {getContent};
