const http = require('http');
require('./models/mongoose');
const historyApiFallback = require('koa2-connect-history-api-fallback');
const Koa = require('koa');
const cors = require('@koa/cors');
const config = require('config');
const err = require('./helpers/error');
const {routes, allowedMethods} = require('./routes');
const app = new Koa();
const send = require('koa-send');
const serve = require('koa-static');
const KoaBody = require('koa-body');

// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');
const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

app.use(cors());
app.use(err);
middlewares.forEach(middleware => {
  app.use(require('./middlewares/' + middleware));
});

const Router = require('koa-router');
const router = new Router();

// router.get('/', require('./routes/login').post);

app.use(router.routes());
app.use(historyApiFallback({ whiteList: ['/api', '/static', '/ku'], verbose: true, index: '/' })); // verbose: true
router.post('/login', KoaBody(), require('./routes/login').post);
router.post('/logout', KoaBody(), require('./routes/logout').post);
app.use(routes());
app.use(allowedMethods());

app.use(async ctx => {
  if ('/' == ctx.path) {
    if (ctx.isAuthenticated()) {
      return send(ctx, '/dist/index.html');
    } else {
      return send(ctx, '/pages/login.html');
    }
  }
  if (/^\/static/.test(ctx.path)) {
    return send(ctx, '/dist/' + ctx.path);
  }
});

app.use(async ctx => {
  if ('ku' == ctx.path) {
    if (ctx.isAuthenticated()) {
      return send(ctx, '/dist/index.html');
    }
  }
});

app.use(serve('../dist/static'));

const server = http.createServer(app.callback()).listen(config.server.port, () => {
  console.log('%s listening at port %d', config.app.name, config.server.port);
});

module.exports = {
  closeServer() {
    server.close();
  }
};
