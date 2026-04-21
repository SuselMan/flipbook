const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const passport = require('passport');

const UserModel = require('../../models/user');
const PasswordReset = require('../../models/passwordReset');
const mailer = require('../../services/mailer');
const limiter = require('../../middleware/limiter');
const keys = require('../../config/keys');

const { secret, tokenLife } = keys.jwt;
const { User } = UserModel;

const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'www', 'root', 'me', 'user', 'users', 'feed',
  'project', 'projects', 'editor', 'settings', 'login', 'register',
  'logout', 'signin', 'signup', 'signout', 'help', 'support', 'about',
  'anonymous', 'null', 'undefined',
]);

router.post('/login', limiter(), async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    return res.status(400).json({ error: 'You must enter an email address.' });
  }

  if (!password) {
    return res.status(400).json({ error: 'You must enter a password.' });
  }

  const user = await User.findOne({ email })
  if (!user || !user.password) {
    return res
      .status(400)
      .send({ error: 'No user found for this email address.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      error: 'Incorrect password.'
    });
  }

  const payload = {
    id: user.id
  };

  jwt.sign(payload, secret, { expiresIn: tokenLife }, (error, token) => {
    res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    });
  });
});

router.post('/register', limiter(), async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = req.body.password;
  const usernameRaw = String(req.body.username || '').trim().toLowerCase();
  const displayName = String(req.body.displayName || '').trim().slice(0, 50);
  const country = req.body.country ? String(req.body.country).toUpperCase() : null;

  if (!email) {
    return res.status(400).json({ error: 'You must enter an email address.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!usernameRaw || !USERNAME_RE.test(usernameRaw)) {
    return res.status(400).json({ error: 'Username must be 3-32 chars (a-z, 0-9, _, -).' });
  }
  if (RESERVED_USERNAMES.has(usernameRaw)) {
    return res.status(400).json({ error: 'That username is reserved.' });
  }
  if (country && !COUNTRY_RE.test(country)) {
    return res.status(400).json({ error: 'Invalid country code.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'That email address is already in use.' });
  }

  const existingUsername = await User
    .findOne({ username: usernameRaw })
    .collation({ locale: 'en', strength: 2 });
  if (existingUsername) {
    return res.status(400).json({ error: 'That username is already taken.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = new User({
    email,
    password: hash,
    username: usernameRaw,
    displayName: displayName || usernameRaw,
    country,
    countryChangedAt: country ? new Date() : null,
  });
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'That username or email is already in use.' });
    }
    throw err;
  }

  const payload = { id: user.id };
  jwt.sign(payload, secret, { expiresIn: tokenLife }, (error, token) => {
    res.status(201).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });
  });
});

router.post('/forgot', limiter(), async (req, res) => {
  const email = req.body.email;

  if (!email) {
    return res.status(400).json({ error: 'You must enter an email address.' });
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    return res.status(400).json({
      error: `This email - ${email} not found.`
    });
  }

  const passwordResetId = uuid.v4();
  const passwordReset = new PasswordReset({
    email,
    passwordResetId
  });

  await passwordReset.save()

  await mailer.sendMail(email, 'reset', passwordResetId);

  res.status(200).json({
    success: true,
    message: 'Please check your email for the link to reset your password.'
  });
});

router.post('/reset/:token', limiter(), async (req, res) => {
  const password = req.body.password;

  if (!password) {
    return res.status(400).json({ error: 'You must enter a password.' });
  }

  const passwordReset = await PasswordReset.findOneAndDelete({ passwordResetId: req.params.token });
  if (!passwordReset) {
    return res.status(400).json({ error: 'Invalid or expired password reset id.' });
  }

  const resetUser = await User.findOne({ email: passwordReset.email });
  if (!resetUser) {
    return res.status(400).json({ error: 'This user was deleted.' });
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);

  resetUser.password = hash;

  await resetUser.save()
  await mailer.sendMail(resetUser.email, 'reset-confirmation');

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please login with your new password.'
  });
});

router.get('/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    accessType: 'offline',
    approvalPrompt: 'force'
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };

    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {
      const jwt = `Bearer ${token}`;

      const htmlWithEmbeddedJWT = `
        <html>
          <script>
            // Save JWT to localStorage
            window.localStorage.setItem('token', '${jwt}');
            // Redirect browser to root of application
            window.location.href = '/';
          </script>
        </html>
      `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

router.get('/facebook',
  passport.authenticate('facebook', {
    session: false,
    scope: ['public_profile', 'email']
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/',
    session: false
  }),
  (req, res) => {
    const payload = {
      id: req.user.id
    };

    jwt.sign(payload, secret, { expiresIn: tokenLife }, (err, token) => {
      const jwt = `Bearer ${token}`;

      const htmlWithEmbeddedJWT = `
        <html>
          <script>
            // Save JWT to localStorage
            window.localStorage.setItem('token', '${jwt}');
            // Redirect browser to root of application
            window.location.href = '/';
          </script>
        </html>       
      `;

      res.send(htmlWithEmbeddedJWT);
    });
  }
);

module.exports = router;
