require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const passport = require('passport');
const path = require('path');

const keys = require('./config/keys');
const routes = require('./routes');

const {database, port} = keys;
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                scriptSrc: ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\''],
            },
        }
    })
);
app.use(cors());
app.use(passport.initialize());

mongoose.set('useCreateIndex', true);
mongoose
    .connect(database.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => {
        console.log('MongoDB Connected!');
        mongoStatus = true;
        require('./services/hotScore').start();
    })
    .catch((error) => {
        console.log(error);
        mongoStatus = error;
    });

require('./config/passport');

const storage = require('./services/storage');
app.use('/files', express.static(storage.ROOT, {
    fallthrough: false,
    maxAge: '1d',
}));

app.use(routes);

app.use(express.static(path.resolve(__dirname, '../../web/build')));
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../web/build/index.html'));
});
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../web/build/index.html'));
});

app.listen(port, () => {
    console.log(`Listening on port ${port}. Visit http://localhost:${port}/ in your browser.`);
});
