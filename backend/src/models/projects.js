const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const ProjectSchema = new Schema({
    owner: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
        validate: {
            validator: (v) => {
                return v.length <= 150;
            }
        }
    },
    description: {
        type: String,
        required: false,
        validate: {
            validator: (v) => {
                return v.length <= 400;
            }
        }
    },
    // TODO: add validation for this fields
    draft: {
        type: String,
        required: true,
    },
    preview: {
        type: String,
        required: true,
    },
    movie: {
        type: String,
        required: true,
    },
    published: {
        type: Boolean,
        required: false,
        default: false,
    }
});

module.exports = Mongoose.model('Project', ProjectSchema);
