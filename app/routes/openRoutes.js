const Router = require('koa-router');
const KoaBody = require('koa-body');

const {getContent} = require('../controllers/openApiController');
const {register} = require('../controllers/registration');

const router = new Router({
  prefix: '/openApi'
});

router
  .post('/get', KoaBody(), getContent)
  .post('/t', KoaBody(), register);

module.exports = {
  openRoutes() { return router.routes(); },
  openAllowedMethods() { return router.allowedMethods(); }
};
