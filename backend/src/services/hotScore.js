const cron = require('node-cron');
const { Project } = require('../models/projects');
const { User } = require('../models/user');

const HOT_K = 24;
const HOT_WINDOW_DAYS = 7;

const computeScore = (likes, publishedAt, now = Date.now()) => {
    const base = Math.log10(Math.max(0, likes) + 1);
    const ageHours = Math.max(0, (now - new Date(publishedAt).getTime()) / 3_600_000);
    return Number((base - ageHours / HOT_K).toFixed(6));
};

const recomputeHotScores = async () => {
    const since = new Date(Date.now() - HOT_WINDOW_DAYS * 24 * 3_600_000);
    const projects = await Project.find(
        { published: true, status: 'active', publishedAt: { $gte: since } },
        'likesCount publishedAt',
    );
    const now = Date.now();
    const ops = projects.map((p) => ({
        updateOne: {
            filter: { _id: p._id },
            update: { $set: { hotScore: computeScore(p.likesCount, p.publishedAt, now) } },
        },
    }));
    if (ops.length) await Project.bulkWrite(ops);
    return ops.length;
};

const recomputeKarma = async () => {
    const pipeline = [
        { $match: { published: true, status: 'active' } },
        { $group: {
            _id: '$owner',
            karma: { $sum: '$likesCount' },
            publishedCount: { $sum: 1 },
        } },
    ];
    const totals = await Project.aggregate(pipeline);
    const ops = totals.map((t) => ({
        updateOne: {
            filter: { _id: t._id },
            update: { $set: { karma: t.karma, publishedCount: t.publishedCount } },
        },
    }));
    // reset users who have no published projects left
    const activeUserIds = totals.map((t) => t._id);
    await User.updateMany(
        { _id: { $nin: activeUserIds }, $or: [{ karma: { $gt: 0 } }, { publishedCount: { $gt: 0 } }] },
        { $set: { karma: 0, publishedCount: 0 } },
    );
    if (ops.length) await User.bulkWrite(ops);
    return ops.length;
};

const start = () => {
    Promise.all([recomputeHotScores(), recomputeKarma()])
        .catch((err) => console.error('initial recompute failed', err));
    cron.schedule('*/10 * * * *', async () => {
        try {
            const [hot, karma] = await Promise.all([recomputeHotScores(), recomputeKarma()]);
            console.log(`[cron] hotScore: ${hot} projects, karma: ${karma} users`);
        } catch (err) {
            console.error('cron failed', err);
        }
    });
};

module.exports = { start, computeScore, recomputeHotScores, recomputeKarma };
