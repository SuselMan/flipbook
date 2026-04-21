const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    required: () => this.provider === 'email'
  },
  password: {
    type: String
  },
  provider: {
    type: String,
    default: 'email'
  },
  googleId: {
    type: String
  },
  facebookId: {
    type: String
  },

  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 32,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9_-]+$/,
  },
  displayName: {
    type: String,
    trim: true,
    maxlength: 50,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 200,
    default: '',
  },
  avatarKey: {
    type: String,
    default: null,
  },
  country: {
    type: String,
    match: /^[A-Z]{2}$/,
    default: null,
  },
  countryChangedAt: {
    type: Date,
    default: null,
  },

  karma: { type: Number, default: 0, index: true },
  publishedCount: { type: Number, default: 0 },

  role: {
    type: String,
    enum: ['ROLE_MEMBER', 'ROLE_ADMIN'],
    default: 'ROLE_MEMBER'
  },
  updated: {
    type: Date
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.index(
  { username: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);
UserSchema.index({ country: 1, karma: -1 });

exports.User = Mongoose.model('User', UserSchema);
