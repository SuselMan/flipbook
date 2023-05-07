const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const ProjectSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

module.exports = Mongoose.model('PasswordReset', ProjectSchema);
