const express = require('express');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const LocalStrategy = require('passport-local').Strategy;

const { validPassword } = require('./auth/passwordUtils');
const { sequelize } = require('./db/index');
const { User } = require('./db/index');
const { routes } = require('./routes');

require('dotenv').config();

const app = express();

const CLIENT_PATH = path.join(__dirname, '../client/dist');

app.use(express.static(CLIENT_PATH));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const sessionStore = new SequelizeStore({
  db: sequelize,
});

sessionStore.sync();

// express middleware used to retrieve user sessions from a datastore can find the
// session object because the session Id is stored in the cookie, which is
// provided to the server on every request
app.use(session({
  secret: process.env.SECRET || 'secretcat',
  resave: false,
  saveUninitialized: true,
  store: sessionStore,
  // cookie: {
  //   sameSite: 'None',
  //   secure: true, // requires HTTPS connection
  //   maxAge: 1000 * 60 * 60 * 24, // one day
  //   // maxAge: 1000 * 60, // one minute
  // },
}));

// passport middleware must be used after express-session
app.use(passport.initialize());

// middleware to alter the req object and change the user value that is currently
// the session id (from the client cookie) into the true deserialized user object
app.use(passport.session());

// this is the passport strategy used to authenticate users
passport.use(new LocalStrategy(
  (username, password, cb) => {
    User.findOne({ where: { username } })
      .then((user) => {
        if (!user) {
          return cb(null, false);
        }
        // this function does some magic to verify a users credentials
        if (validPassword(password, user.hash, user.salt)) {
          return cb(null, user);
        }
        return cb(null, false, { invalidPassword: true });
      })
      .catch(err => {
        cb(err);
      });
  },
));

// these two methods are responsible for establishing the user in the session object
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});
// deserializing is the process of pulling the users session info from the session object
passport.deserializeUser((id, cb) => {
  User.findOne({ where: { id } })
    .then((user) => {
      if (!user) { return cb('error'); }
      cb(null, user);
    });
});

app.use('/', routes);

module.exports = {
  app,
};
