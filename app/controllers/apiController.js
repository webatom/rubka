const mongoose = require('../models/mongoose');
const pick = require('lodash/pick');
const crypto = require('crypto');
const util = require('util');
const randomBytes = util.promisify(crypto.randomBytes);
// const fs = require('fs');

// const User = require('../models/user');
const Site = require('../models/site');
const SiteScript = require('../models/siteScript');
const SiteElement = require('../models/siteElement');
const ScriptVersion = require('../models/scriptVersion');
const SiteElementValue = require('../models/siteElementValue');

async function test(ctx, next) {
  await SiteElementValue.find({});
  ctx.status = 200;
  await next();
}
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
  console.log(ctx.request.body.token);
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

async function getSiteScriptsBySite(ctx, next) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  let siteScripts = await Site.findById(ctx.params.siteId).populate([{
    path: 'siteScripts',
    model: 'SiteScript',
    populate: [{
      path: 'scriptVersions',
      populate: [{
        path: 'elementsValue',
        model: 'SiteElementValue'
      }]
    }]
  },
  {
    path: 'siteElements'
  }]);
  console.log(siteScripts);
  if (!siteScripts) {
    ctx.throw(404);
  }

  ctx.body = siteScripts.toObject();

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

// ============== SITE SCRIPTS ====================
async function loadSiteScriptById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteScriptId)) {
    ctx.throw(404);
  }
  ctx.siteScriptById = await SiteScript.findById(ctx.params.siteScriptId);

  if (!ctx.siteScriptById) {
    ctx.throw(404);
  }
}

async function getAllSiteScripts(ctx, next) {
  let siteScripts = await SiteScript.find({});
  ctx.status = 200;
  ctx.body = siteScripts.map(sv => sv.toObject());
  await next();
}

async function getSiteScriptById(ctx, next) {
  await loadSiteScriptById(ctx);
  ctx.body = ctx.siteScriptById.toObject();
  await next();
}

async function createScriptVersion(siteScriptId, siteId) {
  let scriptVersion = await ScriptVersion.create(pick({siteScriptId: siteScriptId}, ScriptVersion.publicFields));

  let query = await SiteElement.find({'siteId': siteId});
  let elements = query.map(e => e.toObject());
  await console.log(elements);
  let promises = [];
  for (let i = 0; i < elements.length; i++) {
    let blank = {siteElementId: elements[i].id, scriptVersionId: scriptVersion._id};
    const orderPromise = await SiteElementValue.create(pick(blank, SiteElementValue.publicFields));
    promises.push(orderPromise);
  }
  await Promise.all(promises);
}

async function createSiteScript(ctx, next) {
  let siteScript = await SiteScript.create(pick(ctx.request.body, SiteScript.publicFields));

  // await ScriptVersion.create(pick({siteScriptId: siteScript._id}, ScriptVersion.publicFields));
  await createScriptVersion(siteScript._id, ctx.request.body.siteId);
  ctx.body = siteScript.toObject();
  ctx.status = 201;
  await next();
}

async function updateSiteScript(ctx, next) {
  await loadSiteScriptById(ctx);
  Object.assign(ctx.siteScriptById, pick(ctx.request.body, SiteScript.publicFields));
  await ctx.siteScriptById.save();
  ctx.body = ctx.siteScriptById.toObject();
  await next();
}

async function removeSiteScript(ctx, next) {
  await loadSiteScriptById(ctx);
  await ctx.siteScriptById.remove();
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

module.exports = {test, getAllSites, getSiteById, createSite, updateSite, removeSite, getSiteScriptsBySite, getSiteElementsBySite, getAllSiteScripts, getSiteScriptById, createSiteScript, updateSiteScript, removeSiteScript, getAllSiteElements, getSiteElementById, createSiteElement, updateSiteElement, removeSiteElement, saveSiteElements};
