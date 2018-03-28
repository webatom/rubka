const Router = require('koa-router');
const KoaBody = require('koa-body');
const {getAllSites, getSiteById, createSite, updateSite, removeSite, getSiteVersionsBySite, getSiteElementsBySite,
  getAllSiteVersions, getSiteVersionById, createSiteVersion, updateSiteVersion, removeSiteVersion,
  getAllSiteElements, getSiteElementById, createSiteElement, updateSiteElement, removeSiteElement, saveSiteElements } =
  require('../controllers/apiController');

const router = new Router({
  prefix: '/api'
});
/* eslint-disable no-multi-spaces */
router
  // sites
  .get('/sites',                              getAllSites)
  .get('/sites/:siteId',                      getSiteById)
  .post('/sites/',                            KoaBody(), createSite)
  .patch('/sites/:siteId',                    KoaBody(), updateSite)
  .delete('/sites/:siteId',                   removeSite)
  .get('/sites/:siteId/siteVersions',         KoaBody(), getSiteVersionsBySite)
  .get('/sites/:siteId/siteElements',         KoaBody(), getSiteElementsBySite)
  .post('/sites/:siteId/saveSiteElements/',    KoaBody(), saveSiteElements)
  // site versions
  .get('/siteVersions',                       getAllSiteVersions)
  .get('/siteVersions/:siteVersionId',        getSiteVersionById)
  .post('/siteVersions/',                     KoaBody(), createSiteVersion)
  .patch('/siteVersions/:siteVersionId',      KoaBody(), updateSiteVersion)
  .delete('/siteVersions/:siteVersionId',     removeSiteVersion)
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
