const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const CommentSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500, trim: true },
    parentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
    status: {
        type: String,
        enum: ['active', 'hidden', 'removed'],
        default: 'active',
    },
}, { timestamps: true });

CommentSchema.index({ projectId: 1, parentId: 1, createdAt: -1, _id: -1 });

exports.Comment = Mongoose.model('Comment', CommentSchema);
