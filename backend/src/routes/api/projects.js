const express = require('express');
const router = express.Router();
const multer = require('multer');

const { Project } = require('../../models/projects');
const { Like } = require('../../models/likes');
const { User } = require('../../models/user');
const auth = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');
const storage = require('../../services/storage');
const { computeScore } = require('../../services/hotScore');

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_PREVIEW_BYTES = 10 * 1024 * 1024;
const MAX_THUMB_BYTES = 1 * 1024 * 1024;

const OWNER_FIELDS = 'username displayName avatarKey country';

const authorFromOwner = (owner) => {
    if (!owner) return null;
    if (typeof owner === 'string' || (owner._bsontype === 'ObjectID')) {
        return { id: String(owner) };
    }
    return {
        id: String(owner._id),
        username: owner.username,
        displayName: owner.displayName || owner.username,
        avatarUrl: owner.avatarKey ? `/files/${owner.avatarKey}` : null,
        country: owner.country || null,
    };
};

const toPublicProject = (p) => ({
    id: p._id,
    author: authorFromOwner(p.owner),
    name: p.name,
    description: p.description,
    published: p.published,
    publishedAt: p.publishedAt,
    likesCount: p.likesCount,
    viewsCount: p.viewsCount,
    forkedFrom: p.forkedFrom,
    forkCount: p.forkCount,
    ownerCountry: p.ownerCountry || null,
    canvasWidth: p.canvasWidth,
    canvasHeight: p.canvasHeight,
    frameCount: p.frameCount,
    fps: p.fps,
    durationMs: p.durationMs,
    previewUrl: p.previewKey ? `/files/${p.previewKey}` : null,
    thumbnailUrl: p.thumbnailKey ? `/files/${p.thumbnailKey}` : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_SOURCE_BYTES },
}).fields([
    { name: 'source', maxCount: 1 },
    { name: 'preview', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
]);

const parseMeta = (body) => {
    const meta = {};
    if (body.name) meta.name = String(body.name).slice(0, 150).trim();
    if (body.description) meta.description = String(body.description).slice(0, 400).trim();
    ['canvasWidth', 'canvasHeight', 'frameCount', 'fps', 'durationMs'].forEach((k) => {
        if (body[k] != null) {
            const n = Number(body[k]);
            if (!Number.isNaN(n)) meta[k] = n;
        }
    });
    if (body.forkedFrom) meta.forkedFrom = body.forkedFrom;
    return meta;
};

router.post('/publish', auth, upload, async (req, res) => {
    try {
        const meta = parseMeta(req.body);
        if (!meta.name) {
            return res.status(400).json({ error: 'Project name is required' });
        }
        const source = req.files?.source?.[0];
        const preview = req.files?.preview?.[0];
        const thumbnail = req.files?.thumbnail?.[0];
        if (!source) return res.status(400).json({ error: 'source file is required' });
        if (!preview) return res.status(400).json({ error: 'preview file is required' });
        if (!thumbnail) return res.status(400).json({ error: 'thumbnail file is required' });
        if (preview.size > MAX_PREVIEW_BYTES) {
            return res.status(413).json({ error: 'preview exceeds size limit' });
        }
        if (thumbnail.size > MAX_THUMB_BYTES) {
            return res.status(413).json({ error: 'thumbnail exceeds size limit' });
        }

        const now = new Date();
        const project = new Project({
            owner: req.user.id,
            ownerCountry: req.user.country || null,
            name: meta.name,
            description: meta.description || '',
            canvasWidth: meta.canvasWidth,
            canvasHeight: meta.canvasHeight,
            frameCount: meta.frameCount,
            fps: meta.fps,
            durationMs: meta.durationMs,
            forkedFrom: meta.forkedFrom || null,
            published: true,
            publishedAt: now,
        });
        project.hotScore = computeScore(0, now);
        project.sourceKey = `projects/${project._id}/source.zip`;
        project.previewKey = `projects/${project._id}/preview.webp`;
        project.thumbnailKey = `projects/${project._id}/thumb.webp`;

        await storage.put(project.sourceKey, source.buffer);
        await storage.put(project.previewKey, preview.buffer);
        await storage.put(project.thumbnailKey, thumbnail.buffer);

        await project.save();
        await User.updateOne({ _id: req.user.id }, { $inc: { publishedCount: 1 } });

        if (meta.forkedFrom) {
            await Project.updateOne({ _id: meta.forkedFrom }, { $inc: { forkCount: 1 } });
        }

        const populated = await Project.findById(project._id).populate('owner', OWNER_FIELDS);
        res.status(201).json({ project: toPublicProject(populated) });
    } catch (err) {
        console.error('publish failed', err);
        res.status(500).json({ error: 'Publish failed' });
    }
});

router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner', OWNER_FIELDS);
        if (!project || project.status !== 'active') {
            return res.status(404).json({ error: 'Project not found' });
        }
        const payload = toPublicProject(project);
        payload.isMine = !!(
            req.user && String(project.owner?._id || project.owner) === String(req.user.id)
        );
        if (req.user) {
            const liked = await Like.exists({ userId: req.user.id, projectId: project._id });
            payload.likedByMe = !!liked;
        } else {
            payload.likedByMe = false;
        }
        res.status(200).json({ project: payload });
    } catch (err) {
        console.error('project fetch failed', err);
        res.status(400).json({ error: 'Invalid project id' });
    }
});

router.post('/:id/fork', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('owner', OWNER_FIELDS);
        if (!project || !project.published || project.status !== 'active') {
            return res.status(404).json({ error: 'Project not found' });
        }
        await Project.updateOne({ _id: project._id }, { $inc: { forkCount: 1 } });
        res.status(200).json({
            project: toPublicProject(project),
            forkedFrom: String(project._id),
        });
    } catch (err) {
        console.error('fork failed', err);
        res.status(500).json({ error: 'Fork failed' });
    }
});

router.post('/:id/like', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || !project.published || project.status !== 'active') {
            return res.status(404).json({ error: 'Project not found' });
        }
        try {
            await Like.create({ userId: req.user.id, projectId: project._id });
            await Project.updateOne({ _id: project._id }, { $inc: { likesCount: 1 } });
        } catch (err) {
            if (err.code !== 11000) throw err;
        }
        const updated = await Project.findById(project._id, 'likesCount publishedAt owner');
        await Project.updateOne(
            { _id: updated._id },
            { $set: { hotScore: computeScore(updated.likesCount, updated.publishedAt) } },
        );
        res.status(200).json({ likesCount: updated.likesCount, likedByMe: true });
    } catch (err) {
        console.error('like failed', err);
        res.status(500).json({ error: 'Like failed' });
    }
});

router.delete('/:id/like', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Project not found' });
        const result = await Like.deleteOne({ userId: req.user.id, projectId: project._id });
        if (result.deletedCount) {
            await Project.updateOne(
                { _id: project._id, likesCount: { $gt: 0 } },
                { $inc: { likesCount: -1 } },
            );
        }
        const updated = await Project.findById(project._id, 'likesCount publishedAt');
        await Project.updateOne(
            { _id: updated._id },
            { $set: { hotScore: computeScore(updated.likesCount, updated.publishedAt) } },
        );
        res.status(200).json({ likesCount: updated.likesCount, likedByMe: false });
    } catch (err) {
        console.error('unlike failed', err);
        res.status(500).json({ error: 'Unlike failed' });
    }
});

router.get('/:id/source', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project || project.status !== 'active') {
            return res.status(404).json({ error: 'Project not found' });
        }
        const isOwner = String(project.owner) === String(req.user.id);
        if (!isOwner && !project.published) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        if (!project.sourceKey || !(await storage.exists(project.sourceKey))) {
            return res.status(404).json({ error: 'Source missing' });
        }
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename="project-${project._id}.zip"`);
        storage.get(project.sourceKey).pipe(res);
    } catch (err) {
        console.error('source fetch failed', err);
        res.status(500).json({ error: 'Failed to stream source' });
    }
});

module.exports = router;
module.exports.toPublicProject = toPublicProject;
module.exports.OWNER_FIELDS = OWNER_FIELDS;
