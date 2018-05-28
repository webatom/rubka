const User = require('../models/user');

async function register(ctx, next) {
  console.log(ctx.request.body);
  const user = await User.create(ctx.request.body);
  if (!user) {
    ctx.throw(404);
  }
  ctx.status = 201;
  await next();
};

module.exports = {register};
