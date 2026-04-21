const express = require('express');
const router = express.Router();

const { Project } = require('../../models/projects');
const { Like } = require('../../models/likes');
const { toPublicProject, OWNER_FIELDS } = require('./projects');
const optionalAuth = require('../../middleware/optionalAuth');

const decodeCursor = (raw) => {
    if (!raw) return null;
    try {
        return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch {
        return null;
    }
};

const encodeCursor = (obj) =>
    Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');

const sortConfigs = {
    new: { field: 'publishedAt', direction: -1, cursorField: 'publishedAt' },
    top: { field: 'likesCount', direction: -1, cursorField: 'likesCount' },
    hot: { field: 'hotScore', direction: -1, cursorField: 'hotScore' },
};

router.get('/', optionalAuth, async (req, res) => {
    const sort = sortConfigs[req.query.sort] ? req.query.sort : 'new';
    const cfg = sortConfigs[sort];
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 50);
    const cursor = decodeCursor(req.query.cursor);
    const scope = req.query.scope === 'country' ? 'country' : 'global';

    const filter = { published: true, status: 'active' };

    if (scope === 'country') {
        if (!req.user || !req.user.country) {
            return res.status(200).json({
                items: [],
                nextCursor: null,
                scopeFallback: 'needs-country',
            });
        }
        filter.ownerCountry = req.user.country;
    }

    if (cursor) {
        const keyValue = sort === 'new' ? new Date(cursor.key) : cursor.key;
        const cursorOr = [
            { [cfg.field]: { $lt: keyValue } },
            { [cfg.field]: keyValue, _id: { $lt: cursor.id } },
        ];
        if (filter.$or) {
            filter.$and = [{ $or: filter.$or }, { $or: cursorOr }];
            delete filter.$or;
        } else {
            filter.$or = cursorOr;
        }
    }

    const sortSpec = { [cfg.field]: cfg.direction, _id: -1 };

    const items = await Project.find(filter)
        .sort(sortSpec)
        .limit(limit + 1)
        .populate('owner', OWNER_FIELDS);
    const hasMore = items.length > limit;
    const slice = items.slice(0, limit);

    let nextCursor = null;
    if (hasMore) {
        const last = slice[slice.length - 1];
        const keyValue = last[cfg.cursorField];
        nextCursor = encodeCursor({
            key: keyValue instanceof Date ? keyValue.toISOString() : keyValue,
            id: last._id,
        });
    }

    let likedSet = new Set();
    if (req.user && slice.length) {
        const ids = slice.map((p) => p._id);
        const likes = await Like.find(
            { userId: req.user.id, projectId: { $in: ids } },
            'projectId',
        );
        likedSet = new Set(likes.map((l) => String(l.projectId)));
    }

    res.status(200).json({
        items: slice.map((p) => {
            const out = toPublicProject(p);
            out.likedByMe = likedSet.has(String(p._id));
            return out;
        }),
        nextCursor,
        scope,
    });
});

module.exports = router;
