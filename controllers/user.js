const { promisify } = require('util');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const userStore = require('../models/User');

const randomBytesAsync = promisify(crypto.randomBytes);

/**
 * GET /login
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login'
  });
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = (req, res) => {
  req.logout();
  req.session.destroy((err) => {
    if (err) console.log('Error : Failed to destroy the session during logout.', err);
    req.user = null;
    res.redirect('/');
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res) => {
  res.render('account/profile', {
    title: 'Account Management'
  });
};

/**
 * POST /account/profile
 * Update profile information.
 */
exports.postUpdateProfile = async (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  let err, user;
  [err, user] = await userStore.findOne({id: req.user.id});

  if(!user || err) {
    req.flash('errors', { msg: 'Failed to update account information' });
    return res.redirect('/account');
  }
  user.email = req.body.email;
  user.name = req.body.name;

  err = await userStore.save(user);

  if (err) {
    if (err.code === 11000) {
        req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
        return res.redirect('/account');
    }
    return next(err);
  }

  req.flash('success', { msg: 'Profile information has been updated.' });
  res.redirect('/account');
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = async (req, res, next) => {
  let userId = req.user.id;
  req.logout();
  let err = await userStore.removeById(userId);
  if (err) { return next(err); }
  req.flash('info', { msg: 'Your account has been deleted.' });
  res.redirect('/');
  // square / clover premissions need to be cleared because 
  // if the user tries to login again it will look like nothing happened
};





