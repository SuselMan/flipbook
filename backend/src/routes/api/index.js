const router = require('express').Router();

const authRoutes = require('./auth');
const projectsRoutes = require('./projects');
const userRoutes = require('./user');
const feedRoutes = require('./feed');
const meRoutes = require('./me');
const usersRoutes = require('./users');
const commentsRoutes = require('./comments');

router.use('/projects', projectsRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/feed', feedRoutes);
router.use('/me', meRoutes);
router.use('/users', usersRoutes);
// Comment routes span both /projects/:id/comments and /comments/:id/...,
// so we mount at the API root.
router.use('/', commentsRoutes);

module.exports = router;
