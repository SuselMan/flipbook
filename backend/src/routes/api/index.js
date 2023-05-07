const router = require('express').Router();

const authRoutes = require('./auth');
const projectsRoutes = require('./projects');
const userRoutes = require('./user');

router.use('/projects', projectsRoutes);
router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;
