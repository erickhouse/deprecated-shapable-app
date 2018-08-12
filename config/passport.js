const passport = require('passport');
const request = require('request');
const { OAuth2Strategy } = require('passport-oauth');

const userStore = require('../models/User');
const merchantTypes = userStore.merchantTypes;

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  let [err, user] = await userStore.findOne({id:id});
  done(err, user);
});

const SquareOAuthOptions = {
  authorizationURL: 'https://connect.squareup.com/oauth2/authorize',
  tokenURL: 'https://connect.squareup.com/oauth2/token',
  clientID: process.env.SQUARE_ID,
  clientSecret: process.env.SQUARE_SECRET,
  callbackURL: process.env.SQUARE_CALLBACK_URI,
  passReqToCallback: true
};

const squareStrat = new OAuth2Strategy(SquareOAuthOptions, async (req, accessToken, refreshToken, profile, done) => {

    let err, existingUser, createdUser;
    [err, existingUser] = await userStore.findOne({email: profile.email});
    
    if(existingUser) {
      return done(err, existingUser);
    }

    const user = {
      email: profile.email,
      merchantId : profile.id,
      name : profile.name,
      type : merchantTypes.SQUARE,
      accessToken : accessToken
    };

    await userStore.save(user);
    [err, createdUser] = await userStore.findOne({email: user.email});
    done(err, createdUser);
});

squareStrat.userProfile = (accesstoken, done) => {
  request.get('https://connect.squareup.com/v1/me', {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accesstoken}`,
    }
  }, (error, response, body) => {
    if (error) { return done(error); }
    try {
      const data = JSON.parse(body);
      done(undefined, data);
    } catch (e) {
      return done(e);
    }
  });
};

passport.use('square', squareStrat);


const getCloverProfile = (accesstoken, employeeId, merchantId, done) => {
  request.get(`https://www.clover.com/v3/merchants/${merchantId}/employees/${employeeId}/`, {
    headers: {
      Authorization: `Bearer ${accesstoken}`,
    }
  }, (error, response, body) => {
    if (error) { return done(error); }
    try {
      const data = JSON.parse(body);
      done({ name: data.name, id: merchantId, email: data.email });
    } catch (e) {
      return done(e);
    }
  });
};

const cloverOAuthOptions = {
  authorizationURL: 'https://www.clover.com/oauth/authorize',
  tokenURL: 'https://www.clover.com/oauth/token',
  clientID: process.env.CLOVER_ID,
  clientSecret: process.env.CLOVER_SECRET,
  callbackURL: process.env.CLOVER_CALLBACK_URI,
  passReqToCallback: true
};

const cloverStrat = new OAuth2Strategy(cloverOAuthOptions, (req, accessToken, refreshToken, profile, done) => {
  getCloverProfile(accessToken, req.query.employee_id, req.query.merchant_id, (profile) => {
    let err, existingUser, createdUser;
    [err, existingUser] = await userStore.findOne({email: profile.email});
    
    if(existingUser) {
      return done(err, existingUser);
    }

    const user = {
      email: profile.email,
      merchantId : profile.id,
      name : profile.name,
      type : merchantTypes.CLOVER,
      accessToken : accessToken
    };

    await userStore.save(user);
    [err, createdUser] = await userStore.findOne({email: user.email});
    done(err, createdUser);
  });
});


passport.use('clover', cloverStrat);

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

