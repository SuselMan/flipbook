const express = require('express');
const router = express.Router();

const { Comment } = require('../../models/comments');
const { Project } = require('../../models/projects');
const { Report } = require('../../models/reports');
const auth = require('../../middleware/auth');
const optionalAuth = require('../../middleware/optionalAuth');
const { OWNER_FIELDS } = require('./projects');

const MAX_TEXT = 500;
const REPLIES_PER_THREAD = 3;

const decodeCursor = (raw) => {
    if (!raw) return null;
    try { return JSON.parse(Buffer.from(raw, 'base64').toString('utf8')); }
    catch { return null; }
};
const encodeCursor = (obj) => Buffer.from(JSON.stringify(obj), 'utf8').toString('base64');

const toPublicComment = (c, { projectOwnerId, currentUserId } = {}) => {
    const authorId = c.userId?._id || c.userId;
    return {
        id: c._id,
        parentId: c.parentId,
        text: c.text,
        status: c.status,
        author: c.userId && c.userId.username
            ? {
                id: authorId,
                username: c.userId.username,
                displayName: c.userId.displayName || c.userId.username,
                avatarUrl: c.userId.avatarKey ? `/files/${c.userId.avatarKey}` : null,
            }
            : null,
        isOP: !!(projectOwnerId && String(authorId) === String(projectOwnerId)),
        isMine: !!(currentUserId && String(authorId) === String(currentUserId)),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    };
};

// GET /api/projects/:id/comments?cursor=
// Returns top-level active comments for a project, with up to N first replies each.
router.get('/projects/:id/comments', optionalAuth, async (req, res) => {
    const projectId = req.params.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const cursor = decodeCursor(req.query.cursor);

    const project = await Project.findById(projectId, 'owner status');
    if (!project || project.status !== 'active') {
        return res.status(404).json({ error: 'Project not found' });
    }

    const filter = {
        projectId,
        parentId: null,
        status: 'active',
    };
    if (cursor) {
        const key = new Date(cursor.key);
        filter.$or = [
            { createdAt: { $lt: key } },
            { createdAt: key, _id: { $lt: cursor.id } },
        ];
    }

    const items = await Comment.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .populate('userId', OWNER_FIELDS);

    const hasMore = items.length > limit;
    const slice = items.slice(0, limit);
    const nextCursor = hasMore
        ? encodeCursor({
              key: slice[slice.length - 1].createdAt.toISOString(),
              id: slice[slice.length - 1]._id,
          })
        : null;

    const currentUserId = req.user?.id;
    const projectOwnerId = project.owner;

    const threadIds = slice.map((c) => c._id);
    const replies = threadIds.length
        ? await Comment.find({ parentId: { $in: threadIds }, status: 'active' })
            .sort({ createdAt: 1, _id: 1 })
            .populate('userId', OWNER_FIELDS)
        : [];

    const repliesByParent = new Map();
    for (const r of replies) {
        const key = String(r.parentId);
        if (!repliesByParent.has(key)) repliesByParent.set(key, []);
        repliesByParent.get(key).push(r);
    }

    const payload = slice.map((c) => {
        const all = repliesByParent.get(String(c._id)) || [];
        const shown = all.slice(0, REPLIES_PER_THREAD);
        const totalReplies = all.length;
        return {
            ...toPublicComment(c, { projectOwnerId, currentUserId }),
            replies: shown.map((r) => toPublicComment(r, { projectOwnerId, currentUserId })),
            replyCount: totalReplies,
            hasMoreReplies: totalReplies > shown.length,
        };
    });

    res.status(200).json({ items: payload, nextCursor });
});

// GET /api/comments/:id/replies?cursor=
// Paginated replies under a given top-level comment.
router.get('/comments/:id/replies', optionalAuth, async (req, res) => {
    const parentId = req.params.id;
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);
    const cursor = decodeCursor(req.query.cursor);

    const parent = await Comment.findById(parentId, 'projectId');
    if (!parent) return res.status(404).json({ error: 'Comment not found' });

    const project = await Project.findById(parent.projectId, 'owner');

    const filter = { parentId, status: 'active' };
    if (cursor) {
        const key = new Date(cursor.key);
        filter.$or = [
            { createdAt: { $gt: key } },
            { createdAt: key, _id: { $gt: cursor.id } },
        ];
    }
    const items = await Comment.find(filter)
        .sort({ createdAt: 1, _id: 1 })
        .limit(limit + 1)
        .populate('userId', OWNER_FIELDS);

    const hasMore = items.length > limit;
    const slice = items.slice(0, limit);
    const nextCursor = hasMore
        ? encodeCursor({
              key: slice[slice.length - 1].createdAt.toISOString(),
              id: slice[slice.length - 1]._id,
          })
        : null;

    const currentUserId = req.user?.id;
    const projectOwnerId = project?.owner;
    res.status(200).json({
        items: slice.map((c) => toPublicComment(c, { projectOwnerId, currentUserId })),
        nextCursor,
    });
});

// POST /api/projects/:id/comments
router.post('/projects/:id/comments', auth, async (req, res) => {
    const projectId = req.params.id;
    const project = await Project.findById(projectId, 'owner status published');
    if (!project || project.status !== 'active' || !project.published) {
        return res.status(404).json({ error: 'Project not found' });
    }

    const text = String(req.body.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return res.status(400).json({ error: 'Comment cannot be empty.' });
    if (text.length > MAX_TEXT) {
        return res.status(400).json({ error: `Max ${MAX_TEXT} characters.` });
    }

    let parentId = null;
    if (req.body.parentId) {
        const parent = await Comment.findById(req.body.parentId, 'projectId parentId status');
        if (!parent || String(parent.projectId) !== String(projectId)) {
            return res.status(400).json({ error: 'Invalid parent comment.' });
        }
        if (parent.status !== 'active') {
            return res.status(400).json({ error: 'Parent comment is not available.' });
        }
        // One level of nesting — replies to replies attach to the top-level root.
        parentId = parent.parentId ? parent.parentId : parent._id;
    }

    const comment = await Comment.create({
        projectId,
        userId: req.user.id,
        text,
        parentId,
    });
    const populated = await Comment.findById(comment._id).populate('userId', OWNER_FIELDS);
    res.status(201).json({
        comment: toPublicComment(populated, {
            projectOwnerId: project.owner,
            currentUserId: req.user.id,
        }),
    });
});

// DELETE /api/comments/:id
// Author or admin can remove. Marks status='removed'.
router.delete('/comments/:id', auth, async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.status === 'removed') {
        return res.status(404).json({ error: 'Comment not found' });
    }
    const isAuthor = String(comment.userId) === String(req.user.id);
    const isAdmin = req.user.role === 'ROLE_ADMIN';
    if (!isAuthor && !isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    comment.status = 'removed';
    await comment.save();
    res.status(200).json({ success: true });
});

// POST /api/comments/:id/hide — project owner can hide a comment on their post.
router.post('/comments/:id/hide', auth, async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment || comment.status === 'removed') {
        return res.status(404).json({ error: 'Comment not found' });
    }
    const project = await Project.findById(comment.projectId, 'owner');
    if (!project || String(project.owner) !== String(req.user.id)) {
        return res.status(403).json({ error: 'Only the project owner can hide comments.' });
    }
    comment.status = comment.status === 'hidden' ? 'active' : 'hidden';
    await comment.save();
    res.status(200).json({ success: true, status: comment.status });
});

// POST /api/comments/:id/report
router.post('/comments/:id/report', auth, async (req, res) => {
    const comment = await Comment.findById(req.params.id, '_id status');
    if (!comment || comment.status === 'removed') {
        return res.status(404).json({ error: 'Comment not found' });
    }
    const reason = String(req.body.reason || '').slice(0, 200).trim();
    try {
        await Report.create({
            targetType: 'comment',
            targetId: comment._id,
            reporterId: req.user.id,
            reason,
        });
    } catch (err) {
        console.error('report failed', err);
        return res.status(500).json({ error: 'Failed to submit report.' });
    }
    res.status(201).json({ success: true });
});

module.exports = router;
