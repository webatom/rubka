const mongoose = require('../models/mongoose');
const pick = require('lodash/pick');
const fs = require('fs');

const City = require('../models/city');
const Niche = require('../models/niche');

async function test(ctx, next) {
  let cities = JSON.parse(await fs.readFileSync('cities.json', 'utf8'));
  for (let i = 0; i < cities.length; i++) {
    await City.create(pick(cities[i], City.publicFields));
  }
  ctx.body = 'OK';
  await next();
}

// ============== CITY ====================
async function loadCityById(ctx) {
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

// async function createCity(ctx, next) {
//   let city = await City.create(pick(ctx.request.body, City.publicFields));
//   ctx.body = city.toObject();
//   ctx.status = 201;
//   await next();
// }

// async function updateCity(ctx, next) {
//   await loadCityById(ctx);
//   Object.assign(ctx.cityById, pick(ctx.request.body, City.publicFields));
//   await ctx.cityById.save();
//   ctx.body = ctx.cityById.toObject();
//   await next();
// }

// async function removeCity(ctx, next) {
//   await loadCityById(ctx);
//   await ctx.cityById.remove();
//   ctx.status = 204;
//   await next();
// }

// ============== Niche ====================
async function loadNicheById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.nicheId)) {
    ctx.throw(404);
  }
  ctx.nicheById = await Niche.findById(ctx.params.nicheId);

  if (!ctx.nicheById) {
    ctx.throw(404);
  }
}

async function getCiteNameById(id) {
  let name = await City.findById(id).select('name');
  return name;
}

async function getNichesWithSites(ctx, next) {
  let niches = await Niche.find({}).populate('sites');

  // let promises = [];
  // for (let i = 0; i < niches.length; i++) {
  //   for (let j = 0; j < niches[i].sites; j++) {
  //     const name = getCiteNameById(niches[i].sites[j].cityId);
  //     niches[i].sites[j].cityId = name;
  //     promises.push(name);
  //   }
  // }
  // await Promise.all(promises);

  // console.log(niches);
  if (!niches) {
    ctx.throw(404);
  }

  // ctx.body = niches.toObject().sites;
  ctx.body = niches.map(n => n.toObject());
  await next();
}

async function getAllNiches(ctx, next) {
  let niches = await Niche.find({});
  ctx.status = 200;
  ctx.body = niches.map(n => n.toObject());
  await next();
}

async function getNicheById(ctx, next) {
  await loadNicheById(ctx);
  ctx.body = ctx.nicheById.toObject();
  await next();
}

async function createNiche(ctx, next) {
  let niche = await Niche.create(pick(ctx.request.body, Niche.publicFields));
  ctx.body = niche.toObject();
  ctx.status = 201;
  await next();
}

async function updateNiche(ctx, next) {
  await loadNicheById(ctx);
  Object.assign(ctx.nicheById, pick(ctx.request.body, Niche.publicFields));
  await ctx.nicheById.save();
  ctx.body = ctx.nicheById.toObject();
  await next();
}

async function removeNiche(ctx, next) {
  await loadNicheById(ctx);
  await ctx.nicheById.remove();
  ctx.status = 204;
  await next();
}

module.exports = {test, getAllCities, getCityById, getAllNiches, getNicheById, createNiche, updateNiche, removeNiche, getNichesWithSites};
