const pick = require('lodash/pick');

async function getAll(Schema, ctx, next) {
  let t = await Schema.find({});
  ctx.status = 200;
  ctx.body = t.map(x => x.toObject());
  await next();
}

async function create(Schema, ctx, next) {
  let t = await Schema.create(pick(ctx.request.body, Schema.publicFields));
  ctx.body = t.toObject();
  ctx.status = 201;
  await next();
}

module.exports = {getAll, create};
