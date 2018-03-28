const mongoose = require('../models/mongoose');
const pick = require('lodash/pick');
const crypto = require('crypto');
const util = require('util');
const randomBytes = util.promisify(crypto.randomBytes);

// const User = require('../models/user');
const Site = require('../models/site');
const SiteVersion = require('../models/siteVersion');
const SiteElement = require('../models/siteElement');

// ============== SITES ====================
async function loadSiteById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  ctx.siteById = await Site.findById(ctx.params.siteId);

  if (!ctx.siteById) {
    ctx.throw(404);
  }
}

async function getAllSites(ctx, next) {
  let sites = await Site.find({});
  ctx.status = 200;
  ctx.body = sites.map(s => s.toObject());
  await next();
}

async function getSiteById(ctx, next) {
  await loadSiteById(ctx);
  ctx.body = ctx.siteById.toObject();
  await next();
}

async function createSite(ctx, next) {
  ctx.request.body.token = (await randomBytes(12)).toString('hex');
  let site = await Site.create(pick(ctx.request.body, Site.publicFields));
  console.log(site);
  ctx.body = site.toObject();
  ctx.status = 201;
  await next();
}

async function updateSite(ctx, next) {
  await loadSiteById(ctx);
  Object.assign(ctx.siteById, pick(ctx.request.body, Site.publicFields));
  await ctx.siteById.save();
  ctx.body = ctx.siteById.toObject();
  await next();
}

async function removeSite(ctx, next) {
  await loadSiteById(ctx);
  await ctx.siteById.remove();
  ctx.status = 204;
  await next();
}

async function getSiteVersionsBySite(ctx, next) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  let siteVersions = await Site.findById(ctx.params.siteId).populate('siteVersions');

  if (!siteVersions) {
    ctx.throw(404);
  }

  ctx.body = siteVersions.toJSON().siteVersions;

  await next();
}

async function getSiteElementsBySite(ctx, next) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  let siteElements = await Site.findById(ctx.params.siteId).populate('siteElements');

  if (!siteElements) {
    ctx.throw(404);
  }

  ctx.body = siteElements.toJSON().siteElements;

  await next();
}

async function saveSiteElements(ctx, next) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  let siteWithElements = await Site.findById(ctx.params.siteId).populate('siteElements');
  let siteElements = await siteWithElements.toJSON().siteElements;

  if (!siteWithElements) {
    ctx.throw(404);
  }

  let inputElements = ctx.request.body;

  for (let i = 0; i < siteElements.length; i++) {
    for (let j = 0; j < inputElements.length; j++) {
      if (siteElements[i].id === inputElements[j].id) {
        // console.log(inputElements[j]);
        // console.log(siteElements[i]);
        let tmp = await SiteElement.findById(siteElements[i].id);
        Object.assign(tmp, pick(inputElements[j], SiteElement.publicFields));
        // console.log(tmp);
        await tmp.save();
        await inputElements.splice(j, 1);
        break;
      }
    }
  }

  for (let i = 0; i < inputElements.length; i++) {
    console.log(inputElements[i]);
    await SiteElement.create(pick(inputElements[i], SiteElement.publicFields));
  }

  ctx.status = 201;
  // await siteElements.map(se => se.remove());
  await next();
}

// ============== SITE VERSIONS ====================
async function loadSiteVersionById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteVersionId)) {
    ctx.throw(404);
  }
  ctx.siteVersionById = await SiteVersion.findById(ctx.params.siteVersionId);

  if (!ctx.siteVersionById) {
    ctx.throw(404);
  }
}

async function getAllSiteVersions(ctx, next) {
  let siteVersions = await SiteVersion.find({});
  ctx.status = 200;
  ctx.body = siteVersions.map(sv => sv.toObject());
  await next();
}

async function getSiteVersionById(ctx, next) {
  await loadSiteVersionById(ctx);
  ctx.body = ctx.siteVersionById.toObject();
  await next();
}

async function createSiteVersion(ctx, next) {
  let siteVersion = await SiteVersion.create(pick(ctx.request.body, SiteVersion.publicFields));
  ctx.body = siteVersion.toObject();
  ctx.status = 201;
  await next();
}

async function updateSiteVersion(ctx, next) {
  await loadSiteVersionById(ctx);
  Object.assign(ctx.siteVersionById, pick(ctx.request.body, SiteVersion.publicFields));
  await ctx.siteVersionById.save();
  ctx.body = ctx.siteVersionById.toObject();
  await next();
}

async function removeSiteVersion(ctx, next) {
  await loadSiteVersionById(ctx);
  await ctx.siteVersionById.remove();
  ctx.status = 204;
  await next();
}

// ============== SITE ELEMENTS ====================

async function loadSiteElementById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteElementId)) {
    ctx.throw(404);
  }
  ctx.siteElementById = await SiteElement.findById(ctx.params.siteElementId);

  if (!ctx.siteElementById) {
    ctx.throw(404);
  }
}

async function getAllSiteElements(ctx, next) {
  let siteElements = await SiteElement.find({});
  ctx.status = 200;
  ctx.body = siteElements.map(se => se.toObject());
  await next();
}

async function getSiteElementById(ctx, next) {
  await loadSiteElementById(ctx);
  ctx.body = ctx.siteElementById.toObject();
  await next();
}

async function createSiteElement(ctx, next) {
  let siteElement = await SiteElement.create(pick(ctx.request.body, SiteElement.publicFields));
  ctx.body = siteElement.toObject();
  ctx.status = 201;
  await next();
}

async function updateSiteElement(ctx, next) {
  await loadSiteElementById(ctx);
  Object.assign(ctx.siteElementById, pick(ctx.request.body, SiteElement.publicFields));
  await ctx.siteElementById.save();
  ctx.body = ctx.siteElementById.toObject();
  await next();
}

async function removeSiteElement(ctx, next) {
  await loadSiteElementById(ctx);
  await ctx.siteElementById.remove();
  ctx.status = 204;
  await next();
}

module.exports = {getAllSites, getSiteById, createSite, updateSite, removeSite, getSiteVersionsBySite, getSiteElementsBySite, getAllSiteVersions, getSiteVersionById, createSiteVersion, updateSiteVersion, removeSiteVersion, getAllSiteElements, getSiteElementById, createSiteElement, updateSiteElement, removeSiteElement, saveSiteElements};
