const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const LikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false } });

LikeSchema.index({ userId: 1, projectId: 1 }, { unique: true });
LikeSchema.index({ projectId: 1 });

exports.Like = Mongoose.model('Like', LikeSchema);
