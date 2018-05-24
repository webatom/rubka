const Router = require('koa-router');
const KoaBody = require('koa-body');
const { getAllSites, getSiteById, createSite, updateSite, removeSite, getSiteScriptsBySite, getSiteElementsBySite,
  getAllSiteScripts, getSiteScriptById, createSiteScript, updateSiteScript, removeSiteScript,
  getAllSiteElements, getSiteElementById, createSiteElement, updateSiteElement, removeSiteElement, saveSiteElements, createScriptVersion, removeScriptVersion, updateScriptVersion } =
  require('../controllers/apiController');
const {getNichesWithSites, getAllCities, getCityById, getAllNiches, getNicheById, createNiche, updateNiche, removeNiche} = require('../controllers/apiController1');
// const {getAll, create} = require('../controllers/mainApi');
const {getContent} = require('../controllers/openApiController');
const {getDirectGroups, getDirectCompany, setYandexToken, getYandexToken, getStatisticBySite, getKeyWords, getAds, setUtm} = require('../controllers/yaMetrikaApi');

const router = new Router({
  prefix: '/api'
});
/* eslint-disable no-multi-spaces */
router
  .get('/o',                                  getContent)
  .get('/getStatistic',                       getStatisticBySite)
  .get('/getYandexToken',                     getYandexToken)
  .patch('/setYandexToken/:siteId',           KoaBody(), setYandexToken)
  .get('/getCompany/:siteId',                 getDirectCompany)
  .get('/getDirectGroups/:siteId',            getDirectGroups)
  .get('/getKeywords/:siteScriptId',          getKeyWords)
  .get('/getAds/:siteScriptId',               getAds)
  .post('/setUtm/:siteScriptId',              KoaBody(), setUtm)
  // .get('/test',                               test)
  .get('/cities',                             getAllCities)
  .get('/cities/:cityId',                     getCityById)
  // niches
  .get('/niches',                             getAllNiches)
  .get('/niches/:nicheId',                    getNicheById)
  .post('/niches/',                           KoaBody(), createNiche)
  .patch('/niches/:nicheId',                  KoaBody(), updateNiche)
  .delete('/niches/:nicheId',                 removeNiche)
  .get('/nichesWithSites',                    getNichesWithSites)
  // sites
  .get('/sites',                              getAllSites)
  .get('/sites/:siteId',                      getSiteById)
  .post('/sites/',                            KoaBody(), createSite)
  .patch('/sites/:siteId',                    KoaBody(), updateSite)
  .delete('/sites/:siteId',                   removeSite)
  .get('/sites/:siteId/siteScripts',          KoaBody(), getSiteScriptsBySite)
  .get('/sites/:siteId/siteElements',         KoaBody(), getSiteElementsBySite)
  .post('/sites/:siteId/saveSiteElements/',   KoaBody(), saveSiteElements)
  // site Scripts
  .get('/siteScripts',                        getAllSiteScripts)
  .get('/siteScripts/:siteScriptId',          getSiteScriptById)
  .post('/siteScripts/',                      KoaBody(), createSiteScript)
  .patch('/siteScripts/:siteScriptId',        KoaBody(), updateSiteScript)
  .delete('/siteScripts/:siteScriptId',       removeSiteScript)
  // scriptVersion
  .post('/scriptVersions/',                   KoaBody(), createScriptVersion)
  .delete('/scriptVersions/:scriptVersionId', removeScriptVersion)
  .patch('/scriptVersions/:scriptVersionId',  KoaBody(), updateScriptVersion)
  // site elements
  .get('/siteElements',                       getAllSiteElements)
  .get('/siteElements/:siteElementId',        getSiteElementById)
  .post('/siteElements/',                     KoaBody(), createSiteElement)
  .patch('/siteElements/:siteElementId',      KoaBody(), updateSiteElement)
  .delete('/siteElements/:siteElementId',     removeSiteElement);

/* eslint-enable */
module.exports = {
  routes() { return router.routes(); },
  allowedMethods() { return router.allowedMethods(); }
};
