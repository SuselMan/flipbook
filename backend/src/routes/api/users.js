const express = require('express');
const router = express.Router();

const { User } = require('../../models/user');
const { Project } = require('../../models/projects');
const { toPublicProject, OWNER_FIELDS } = require('./projects');

const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;
const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'www', 'root', 'me', 'user', 'users', 'feed',
  'project', 'projects', 'editor', 'settings', 'login', 'register',
  'logout', 'signin', 'signup', 'signout', 'help', 'support', 'about',
  'anonymous', 'null', 'undefined',
]);

const avatarUrl = (user) =>
    user.avatarKey ? `/files/${user.avatarKey}` : null;

const toPublicUser = (user) => ({
    id: user._id,
    username: user.username,
    displayName: user.displayName || user.username,
    bio: user.bio || '',
    avatarUrl: avatarUrl(user),
    country: user.country || null,
    karma: user.karma || 0,
    publishedCount: user.publishedCount || 0,
    createdAt: user.created,
});

router.get('/check-username', async (req, res) => {
    const u = String(req.query.u || '').trim().toLowerCase();
    if (!u || !USERNAME_RE.test(u)) {
        return res.status(200).json({ available: false, reason: 'format' });
    }
    if (RESERVED_USERNAMES.has(u)) {
        return res.status(200).json({ available: false, reason: 'reserved' });
    }
    const existing = await User
        .findOne({ username: u }, '_id')
        .collation({ locale: 'en', strength: 2 });
    res.status(200).json({ available: !existing });
});

router.get('/:username', async (req, res) => {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User
        .findOne({ username })
        .collation({ locale: 'en', strength: 2 });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ user: toPublicUser(user) });
});

router.get('/:username/projects', async (req, res) => {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User
        .findOne({ username }, '_id')
        .collation({ locale: 'en', strength: 2 });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 50);
    const cursor = req.query.cursor
        ? (() => {
            try { return JSON.parse(Buffer.from(req.query.cursor, 'base64').toString('utf8')); }
            catch { return null; }
        })()
        : null;

    const filter = { owner: user._id, published: true, status: 'active' };
    if (cursor) {
        const key = new Date(cursor.key);
        filter.$or = [
            { publishedAt: { $lt: key } },
            { publishedAt: key, _id: { $lt: cursor.id } },
        ];
    }
    const items = await Project.find(filter)
        .sort({ publishedAt: -1, _id: -1 })
        .limit(limit + 1)
        .populate('owner', OWNER_FIELDS);
    const hasMore = items.length > limit;
    const slice = items.slice(0, limit);
    const nextCursor = hasMore
        ? Buffer.from(JSON.stringify({
              key: slice[slice.length - 1].publishedAt.toISOString(),
              id: slice[slice.length - 1]._id,
          }), 'utf8').toString('base64')
        : null;
    res.status(200).json({
        items: slice.map(toPublicProject),
        nextCursor,
    });
});

module.exports = router;
module.exports.toPublicUser = toPublicUser;
module.exports.avatarUrl = avatarUrl;
