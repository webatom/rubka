const Site = require('../models/site');
const SiteScript = require('../models/siteScript');
const mongoose = require('../models/mongoose');
const rp = require('request-promise');

const YMetrikaRequest = require('yandex-metrika');
const ApiDirect = require('./YandexDirect');
const oauthToken = process.env.oauthYandexToken;
// const oauthToken = 'AQAAAAAmcFxKAATo5tMbon0v0UzdtskD4NbykqY';
// 'AQAAAAAmcFxKAATo5lL-0y7rgE-djM-RFArj7T0';
const api = new YMetrikaRequest(oauthToken);
const clientId = process.env.client_id;
const clientSecret = process.env.clientSecret;

async function getCounterId(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.request.query.siteId)) {
    ctx.throw(404);
  }

  ctx.counterId = await Site.findById(ctx.request.query.siteId).select('idYaMetrika');

  if (!ctx.counterId) {
    ctx.throw(404);
  }
}

async function loadSiteById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }
  ctx.siteById = await Site.findById(ctx.params.siteId);

  if (!ctx.siteById) {
    ctx.throw(404);
  }
}

async function loadSiteScriptById(ctx) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteScriptId)) {
    ctx.throw(404);
  }
  ctx.siteScriptById = await SiteScript.findById(ctx.params.siteScriptId);

  if (!ctx.siteScriptById) {
    ctx.throw(404);
  }
}

async function getStatisticBySite(ctx, next) {
  await getCounterId(ctx);
  let query = await api.get('/stat/v1/data', {
    'ids': ctx.counterId.idYaMetrika,
    'metrics': 'ym:s:pageviews,ym:s:newUsers,ym:s:sumGoalReachesAny',
    'dimensions': 'ym:s:date,ym:s:lastUTMTerm',
    'group': 'day',
    'date1': ctx.request.query.interval,
    'date2': 'today',
    'sort': 'ym:s:date',
    'include_undefined': true
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
  ctx.redirect('http://rubka.herokuapp.com/setToken?token=' + res.access_token);
  // ctx.body = res.access_token + '<script>alert(0)</script>';
  await next();
}

async function setYandexToken(ctx, next) {
  if (!mongoose.Types.ObjectId.isValid(ctx.params.siteId)) {
    ctx.throw(404);
  }

  let site = await Site.findById(ctx.params.siteId);

  if (!site) {
    ctx.throw(404);
  }
  site.oauthTokenYandex = ctx.request.body.oauthTokenYandex;
  await site.save();
  ctx.status = 201;
  await next();
}

async function getDirectCompany(ctx, next) {
  await loadSiteById(ctx);
  let apiDirect = new ApiDirect(ctx.siteById.oauthTokenYandex);
  let res = await apiDirect.get('campaigns', {
    'method': 'get',
    'params': {
      'SelectionCriteria': {},
      'FieldNames':
        ['Name', 'Id']
    }
  });
  ctx.body = res.result.Campaigns;
  await next();
}

async function getDirectGroups(ctx, next) {
  await loadSiteById(ctx);
  let apiDirect = new ApiDirect(ctx.siteById.oauthTokenYandex);
  let res = await apiDirect.get('adgroups', {
    'method': 'get',
    'params': {
      'SelectionCriteria': {'CampaignIds': [
        ctx.siteById.directCompanyId
      ]},
      'FieldNames':
        ['Name', 'Id']
    }
  });
  ctx.body = res.result.AdGroups;
  await next();
}

async function getKeyWords(ctx, next) {
  await loadSiteScriptById(ctx);
  ctx.params.siteId = ctx.siteScriptById.siteId;
  await loadSiteById(ctx);
  let apiDirect = new ApiDirect(ctx.siteById.oauthTokenYandex);
  let res = await apiDirect.get('keywords', {
    'method': 'get',
    'params': {
      'SelectionCriteria': {'AdGroupIds': [
        ctx.siteScriptById.directGroupId
      ]},
      'FieldNames':
        ['Keyword']
    }
  });
  ctx.body = res.result.Keywords;
  await next();
}

async function getAds(ctx, next) {
  await loadSiteScriptById(ctx);
  ctx.params.siteId = ctx.siteScriptById.siteId;
  await loadSiteById(ctx);
  let apiDirect = new ApiDirect(ctx.siteById.oauthTokenYandex);
  let res = await apiDirect.get('ads', {
    'method': 'get',
    'params': {
      'SelectionCriteria': {'AdGroupIds': [
        ctx.siteScriptById.directGroupId
      ]},
      'FieldNames': ['Id'],
      'TextAdFieldNames':
        ['Title', 'Text']
    }
  });
  ctx.body = res.result.Ads;
  await next();
}

async function setUtm(ctx, next) {
  await loadSiteScriptById(ctx);
  ctx.params.siteId = ctx.siteScriptById.siteId;
  await loadSiteById(ctx);
  let apiDirect = new ApiDirect(ctx.siteById.oauthTokenYandex);
  let res = await apiDirect.get('ads', {
    'method': 'get',
    'params': {
      'SelectionCriteria': {'AdGroupIds': [
        ctx.siteScriptById.directGroupId
      ]},
      'FieldNames': ['Id'],
      'TextAdFieldNames':
        ['Href']
    }
  });
  let updateAds = [];

  for (let i = 0; i < res.result.Ads.length; i++) {
    let href = res.result.Ads[i].TextAd.Href;
    let params = href.split('?');
    if (params.length <= 1) {
      res.result.Ads[i].TextAd.Href = params[0] + '?utm_term=' + ctx.siteScriptById.utm_term;
      updateAds.push(res.result.Ads[i]);
    } else {
      let utms = params[1].split('&');
      res.result.Ads[i].TextAd.Href = params[0] + '?';
      let flag = false;
      for (let j = 0; j < utms.length; j++) {
        let tmp = utms[j].split('=');
        if (tmp[0] === 'utm_term') {
          if (tmp[1] === ctx.siteScriptById.utm_term) {
            flag = true;
            break;
          } else {
            tmp[1] = ctx.siteScriptById.utm_term;
          }
        }
        if (j === utms.length - 1) {
          res.result.Ads[i].TextAd.Href += tmp[0] + '=' + tmp[1];
        } else {
          res.result.Ads[i].TextAd.Href += tmp[0] + '=' + tmp[1] + '&';
        }
      }
      if (!flag) {
        updateAds.push(res.result.Ads[i]);
      }
    }
  }
  // console.log(updateAds);
  if (updateAds.length > 0) {
    await updateUtm(apiDirect, updateAds);
  }
  ctx.status = 200;
  await next();
}

async function updateUtm(apiDirect, ads) {
  await apiDirect.get('ads', {
    'method': 'update',
    'params': {
      'Ads': ads
    }
  });
}

module.exports = {getDirectGroups, getDirectCompany, setYandexToken, getYandexToken, getStatisticBySite, getKeyWords, getAds, setUtm};
