const Router = require('koa-router');
const KoaBody = require('koa-body');

const {getContent} = require('../controllers/openApiController');

const router = new Router({
  prefix: '/openApi'
});

router
  .post('/get', KoaBody(), getContent);

module.exports = {
  openRoutes() { return router.routes(); },
  openAllowedMethods() { return router.allowedMethods(); }
};
