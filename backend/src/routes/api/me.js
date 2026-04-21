const express = require('express');
const router = express.Router();
const multer = require('multer');

const { User } = require('../../models/user');
const { Project } = require('../../models/projects');
const { toPublicProject, OWNER_FIELDS } = require('./projects');
const { toPublicUser } = require('./users');
const auth = require('../../middleware/auth');
const storage = require('../../services/storage');

const decodeCursor = (raw) => {
    if (!raw) return null;
    try { return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
    catch { return null; }
};
const encodeCursor = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');

const COUNTRY_RE = /^[A-Z]{2}$/;
const COUNTRY_CHANGE_COOLDOWN_MS = 7 * 24 * 3_600 * 1000;

router.get('/', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const payload = toPublicUser(user);
    payload.email = user.email;
    payload.countryChangedAt = user.countryChangedAt;
    res.status(200).json({ user: payload });
});

router.patch('/', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.displayName !== undefined) {
        const dn = String(req.body.displayName).trim().slice(0, 50);
        if (dn.length === 0) return res.status(400).json({ error: 'Display name cannot be empty.' });
        user.displayName = dn;
    }
    if (req.body.bio !== undefined) {
        user.bio = String(req.body.bio)
            .replace(/[\r\n]+/g, ' ')
            .trim()
            .slice(0, 200);
    }
    if (req.body.country !== undefined) {
        const raw = req.body.country;
        const next = raw ? String(raw).toUpperCase() : null;
        if (next && !COUNTRY_RE.test(next)) {
            return res.status(400).json({ error: 'Invalid country code.' });
        }
        if (next !== user.country) {
            const last = user.countryChangedAt ? user.countryChangedAt.getTime() : 0;
            if (last && Date.now() - last < COUNTRY_CHANGE_COOLDOWN_MS) {
                const daysLeft = Math.ceil(
                    (COUNTRY_CHANGE_COOLDOWN_MS - (Date.now() - last)) / (24 * 3_600_000)
                );
                return res.status(429).json({
                    error: `Country can be changed again in ${daysLeft} day(s).`,
                });
            }
            user.country = next;
            user.countryChangedAt = new Date();
        }
    }

    await user.save();
    const payload = toPublicUser(user);
    payload.email = user.email;
    payload.countryChangedAt = user.countryChangedAt;
    res.status(200).json({ user: payload });
});

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 },
}).single('avatar');

router.post('/avatar', auth, avatarUpload, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!req.file) return res.status(400).json({ error: 'Avatar file is required.' });
    if (!/^image\/(webp|png|jpeg)$/.test(req.file.mimetype)) {
        return res.status(400).json({ error: 'Avatar must be webp, png or jpeg.' });
    }

    const key = `avatars/${user._id}/avatar.webp`;
    await storage.put(key, req.file.buffer);
    user.avatarKey = key;
    await user.save();

    const payload = toPublicUser(user);
    payload.email = user.email;
    res.status(200).json({ user: payload });
});

router.delete('/avatar', auth, async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.avatarKey) {
        await storage.remove(user.avatarKey).catch(() => {});
        user.avatarKey = null;
        await user.save();
    }
    res.status(200).json({ user: toPublicUser(user) });
});

router.get('/projects', auth, async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 24, 1), 50);
    const cursor = decodeCursor(req.query.cursor);
    const filter = { owner: req.user.id, status: 'active' };
    if (cursor) {
        const key = new Date(cursor.key);
        filter.$or = [
            { updatedAt: { $lt: key } },
            { updatedAt: key, _id: { $lt: cursor.id } },
        ];
    }
    const items = await Project.find(filter)
        .sort({ updatedAt: -1, _id: -1 })
        .limit(limit + 1)
        .populate('owner', OWNER_FIELDS);
    const hasMore = items.length > limit;
    const slice = items.slice(0, limit);
    const nextCursor = hasMore
        ? encodeCursor({
              key: slice[slice.length - 1].updatedAt.toISOString(),
              id: slice[slice.length - 1]._id,
          })
        : null;
    res.status(200).json({ items: slice.map(toPublicProject), nextCursor });
});

module.exports = router;
