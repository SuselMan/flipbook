const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const ProjectSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 150,
        trim: true,
    },
    description: {
        type: String,
        required: false,
        maxlength: 400,
        trim: true,
        default: '',
    },

    sourceKey: { type: String, required: true },
    previewKey: { type: String },
    thumbnailKey: { type: String },

    published: { type: Boolean, default: false, index: true },
    publishedAt: { type: Date },

    likesCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    hotScore: { type: Number, default: 0 },

    forkedFrom: { type: Schema.Types.ObjectId, ref: 'Project', default: null },
    forkCount: { type: Number, default: 0 },

    ownerCountry: { type: String, default: null },

    canvasWidth: { type: Number },
    canvasHeight: { type: Number },
    frameCount: { type: Number },
    fps: { type: Number, default: 10 },
    durationMs: { type: Number },

    status: {
        type: String,
        enum: ['active', 'hidden', 'removed'],
        default: 'active',
    },
}, { timestamps: true });

ProjectSchema.index({ published: 1, publishedAt: -1, _id: -1 });
ProjectSchema.index({ published: 1, likesCount: -1, _id: -1 });
ProjectSchema.index({ published: 1, hotScore: -1, _id: -1 });
ProjectSchema.index({ published: 1, ownerCountry: 1, publishedAt: -1, _id: -1 });
ProjectSchema.index({ owner: 1, published: 1, updatedAt: -1 });
ProjectSchema.index({ forkedFrom: 1 });

exports.Project = Mongoose.model('Project', ProjectSchema);
