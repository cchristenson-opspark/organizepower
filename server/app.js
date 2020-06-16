/* eslint-disable max-len */
const express = require('express');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const { User } = require('./db/index');
// const { apiRouter } = require('./api');
const { router } = require('./routes/login');

const app = express();

const CLIENT_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_PATH));
app.use(express.json());
app.use(cors());

// allow express to use sessions, not sure if the secret is necessary or helpful

// express middleware used to retrieve user sessions from a datastore can find the session object because the session Id is stored in the cookie, which is provided to the server on every request
// NOTE: cookie-parser middleware is no longer needed
app.use(session({ secret: 'cats' }));

// passport middleware must be used after express-session
app.use(passport.initialize());

// middleware to alter the req object and change the user value that is currently the session id (from the client cookie) into the true deserialized user object

app.use(passport.session());

passport.use(new LocalStrategy((username, password, done) => {
  return User.findOrCreate({ where: { username, password } }).then((user) => {
    console.log(user);
    return done(null, user);
  });
}));

// basic "strategy" for user authentication
// passport.use(new LocalStrategy((username, password, done) => {
//   User.findOne({ username }, (err, user) => {
//     if (err) { return done(err); }
//     if (!user) {
//       return done(null, false, { message: 'Incorrect username.' });
//     }
//     if (!user.validPassword(password)) {
//       return done(null, false, { message: 'Incorrect password.' });
//     }
//     return done(null, user);
//   })
//     .catch(err => console.error(err));
// }));

// these two methods will keep user session alive
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// app.post('/login',
//   passport.authenticate('local', {
//     successRedirect: '/',
//     failureRedirect: '/login',
//   }));

// app.use('/', apiRouter);
app.use('/', router);

module.exports = {
  app,
};
