const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const config = require('config');
const err = require('./helpers/error');
const {routes, allowedMethods} = require('./routes');
const app = new Koa();

app.use(cors());
app.use(err);
app.use(routes());
app.use(allowedMethods());

const server = http.createServer(app.callback()).listen(config.server.port, () => {
  console.log('%s listening at port %d', config.app.name, config.server.port);
});

module.exports = {
  closeServer() {
    server.close();
  }
};
