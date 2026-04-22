const Mongoose = require('mongoose');

const { Schema } = Mongoose;

const ReportSchema = new Schema({
    targetType: { type: String, enum: ['comment', 'project'], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, maxlength: 200, trim: true, default: '' },
    status: {
        type: String,
        enum: ['open', 'reviewed', 'dismissed'],
        default: 'open',
    },
}, { timestamps: true });

ReportSchema.index({ targetType: 1, targetId: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });

exports.Report = Mongoose.model('Report', ReportSchema);
