const router = require('express').Router();

const authRoutes = require('./auth');
const projectsRoutes = require('./projects');
const userRoutes = require('./user');
const feedRoutes = require('./feed');
const meRoutes = require('./me');
const usersRoutes = require('./users');

router.use('/projects', projectsRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/feed', feedRoutes);
router.use('/me', meRoutes);
router.use('/users', usersRoutes);

module.exports = router;
