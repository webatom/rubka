const User = require('../../models/user');
const passport = require('koa-passport');

// паспорт напрямую с базой не работает
passport.serializeUser((user, done) => {
  console.log(user);
  done(null, user.email); // uses _id as idField
  console.log('serializeble');
});

passport.deserializeUser((email, done) => {
  console.log('deserializeUser');
  User.findOne({email: email}, done); // callback version checks id validity automatically
  console.log('out');
});
