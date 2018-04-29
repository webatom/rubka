const mongoose = require('../models/mongoose');
const pick = require('lodash/pick');

// ============== STANDART API ====================
async function loadById(ctx, schema) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.cityId)) {
    ctx.throw(404);
  }
  ctx.cityById = await City.findById(ctx.params.cityId);

  if (!ctx.cityById) {
    ctx.throw(404);
  }
}

async function getAllCities(ctx, next) {
  let cities = await City.find({});
  ctx.status = 200;
  ctx.body = cities.map(c => c.toObject());
  await next();
}

async function getCityById(ctx, next) {
  await loadCityById(ctx);
  ctx.body = ctx.cityById.toObject();
  await next();
}

async function createCity(ctx, next) {
  let city = await City.create(pick(ctx.request.body, City.publicFields));
  ctx.body = city.toObject();
  ctx.status = 201;
  await next();
}

async function updateCity(ctx, next) {
  await loadCityById(ctx);
  Object.assign(ctx.cityById, pick(ctx.request.body, City.publicFields));
  await ctx.cityById.save();
  ctx.body = ctx.cityById.toObject();
  await next();
}

async function removeCity(ctx, next) {
  await loadCityById(ctx);
  await ctx.cityById.remove();
  ctx.status = 204;
  await next();
}

module.exports = {};
