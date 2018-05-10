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
  let site = await Site.create(pick(ctx.request.body, Site.publicFields));
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
  console.log(ctx.siteById._id);
  // TODO remove sitescripts and siteelements
  // let query = SiteScript.find({'siteId': ctx.siteById._id});
  // console.log(query);
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
    model: 'SiteScript'
    // populate: [{
    //   path: 'scriptVersions',
    //   populate: [{
    //     path: 'elementsValue',
    //     model: 'SiteElementValue'
    //   }]
    // }]
  },
  {
    path: 'siteElements'
  }]);
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
        let tmp = await SiteElement.findById(siteElements[i].id);
        Object.assign(tmp, pick(inputElements[j], SiteElement.publicFields));
        await tmp.save();
        await inputElements.splice(j, 1);
        break;
      }
    }
  }

  let query = await Site.findById(ctx.params.siteId).populate([{
    path: 'siteScripts',
    populate: {
      path: 'scriptVersions',
      select: '_id'
    }
  }]);

  let tmp = query.toJSON().siteScripts;
  let versions = [];
  await tmp.map(x => versions = versions.concat(x.scriptVersions));
  console.log(versions);
  let promises = [];

  for (let i = 0; i < inputElements.length; i++) {
    console.log(inputElements[i]);
    let element = await SiteElement.create(pick(inputElements[i], SiteElement.publicFields));
    for (let j = 0; j < versions.length; j++) {
      let blank = {siteElementId: element._id, scriptVersionId: versions[j].id};
      console.log(blank);
      const orderPromise = SiteElementValue.create(pick(blank, SiteElementValue.publicFields));
      promises.push(orderPromise);
    }
  }

  await Promise.all(promises);

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
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteScriptId)) {
    ctx.throw(404);
  }
  let siteScript = await SiteScript.findById(ctx.params.siteScriptId).populate([{
    path: 'scriptVersions',
    populate: {
      path: 'elementsValue',
      options: { sort: { 'siteElementId': 1 } }
      // populate: {
      //   path: 'siteElementId'
      // }
    }
  }]);

  if (!siteScript) {
    ctx.throw(404);
  }
  ctx.body = siteScript.toObject();
  await next();
}

async function addScriptVersion(siteScriptId, siteId) {
  let scriptVersion = await ScriptVersion.create(pick({siteScriptId: siteScriptId}, ScriptVersion.publicFields));

  let query = await SiteElement.find({'siteId': siteId});
  let elements = query.map(e => e.toObject());
  await console.log(elements);
  let promises = [];
  for (let i = 0; i < elements.length; i++) {
    let blank = {siteElementId: elements[i].id, scriptVersionId: scriptVersion._id};
    // AWAIT???
    const orderPromise = SiteElementValue.create(pick(blank, SiteElementValue.publicFields));
    promises.push(orderPromise);
  }
  await Promise.all(promises);

  return scriptVersion.toObject().id;
}

async function createSiteScript(ctx, next) {
  let siteScript = await SiteScript.create(pick(ctx.request.body, SiteScript.publicFields));

  // await ScriptVersion.create(pick({siteScriptId: siteScript._id}, ScriptVersion.publicFields));
  await addScriptVersion(siteScript._id, ctx.request.body.siteId);
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

async function deleteScriptVersionsBySiteScript(siteScriptId) {
  await ScriptVersion.deleteMany({'siteScriptId': siteScriptId});
}

async function removeSiteScript(ctx, next) {
  await loadSiteScriptById(ctx);
  await deleteScriptVersionsBySiteScript(ctx.loadSiteScriptById.id);
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
  await deleteElementValuesBySiteElement(ctx.siteElementById._id);
  await ctx.siteElementById.remove();
  ctx.status = 204;
  await next();
}

async function deleteElementValuesBySiteElement(siteElementId) {
  await SiteElementValue.deleteMany({'siteElementId': siteElementId});
}

// ================== SCRIPT VERSION ===============

async function loadScriptVersionById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.scriptVersionId)) {
    ctx.throw(404);
  }
  ctx.scriptVersionById = await ScriptVersion.findById(ctx.params.scriptVersionId);

  if (!ctx.scriptVersionById) {
    ctx.throw(404);
  }
}

async function createScriptVersion(ctx, next) {
  let svId = await addScriptVersion(ctx.request.body.siteScriptId, ctx.request.body.siteId);
  let res = await ScriptVersion.findById(svId).populate([{
    path: 'elementsValue',
    options: { sort: { 'siteElementId': 1 } }
  }]);
  ctx.body = res.toObject();
  ctx.status = 201;
  await next();
}

async function removeScriptVersion(ctx, next) {
  await loadScriptVersionById(ctx);
  await deleteElementsValueByScriptVersion(ctx.scriptVersionById._id);
  await ctx.scriptVersionById.remove();
  ctx.status = 204;
  await next();
}

async function deleteElementsValueByScriptVersion(scriptVersionId) {
  await SiteElementValue.deleteMany({'scriptVersionId': scriptVersionId});
}

async function updateScriptVersion(ctx, next) {
  await loadScriptVersionById(ctx);
  Object.assign(ctx.scriptVersionById, pick(ctx.request.body, ScriptVersion.publicFields));
  await ctx.scriptVersionById.save();
  console.log(ctx.request.body.elementsValue);
  for (let i = 0; i < ctx.request.body.elementsValue.length; i++) {
    let sev = await SiteElementValue.findById(ctx.request.body.elementsValue[i].id);
    Object.assign(sev, pick(ctx.request.body.elementsValue[i], SiteElementValue.publicFields));
    await sev.save();
  }
  ctx.body = ctx.scriptVersionById.toObject();
  await next();
}

module.exports = {test, getAllSites, getSiteById, createSite, updateSite, removeSite, getSiteScriptsBySite, getSiteElementsBySite, getAllSiteScripts, getSiteScriptById, createSiteScript, updateSiteScript, removeSiteScript, getAllSiteElements, getSiteElementById, createSiteElement, updateSiteElement, removeSiteElement, saveSiteElements, createScriptVersion, removeScriptVersion, updateScriptVersion};
