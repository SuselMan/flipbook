const express = require('express');
const router = express.Router();

const ProjectModel = require('../../models/projects');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');
const storageClient = require('tiny-storage-client');

const multer  = require('multer');
const uuid = require("uuid");
const storage = multer.memoryStorage()
const upload = multer({ storage })

const { Project } = ProjectModel;


const s3storage = storageClient([{
    accessKeyId: 'YCAJEzz4gVGPxXab_rVuFx0aE',
    secretAccessKey: 'YCNxUoJ8De5DoNHNgWsh9v_OSD-Bvjl2tQIXkCcf',
    url: 'storage.yandexcloud.net',
    region: 'ru-central1'
}]);

router.get('/list', async (req, res) => {
    const projects = await ProjectModel.find({})
    res.status(200).json({ projects });
});

router.get('/list/:id', auth, async (req, res) => {
    const id = req.params.id;

    let project;
    try {
        project = await Project.findById(id);
    } catch(error) {
        return res.status(400).json({
            error: 'Your request could not be processed. Please try again.'
        });
    }

    res.status(200).json({ project });
});

router.post('/add', upload.single('file'), async (req, res) => {
    const body = req.body;
    const file = req.file;

    const projectId = uuid.v4();

    s3storage.uploadFile('vorobro-projects', `${projectId}.zip`, file.buffer, (err, resp) => {
        if (err) {
            return res.status(500).json({ error: 'Something went wrong' });
        } else {
            if(resp.statusCode === 200) {
                res.status(200).json({
                    success: true,
                    message: 'Project saved successfully.'
                });
            } else {
                return res.status(resp.statusCode).json({ error: resp.buffer.toString() });
            }
        }
        /**
         * Request reponse:
         * - resp.body
         * - resp.headers
         * - resp.statusCode
         */
    })

    console.log('body', body, file);

    // if (!password) {
    //     return res.status(400).json({ error: 'You must enter a password.' });
    // }

});

module.exports = router;
