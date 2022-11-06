import express from 'express';
import constants from './config/constants';
import './config/database';
import middlewareConfig from './config/middleware';
import apiRoutes from './modules';
import path from 'path';
const app = express();
middlewareConfig(app);

app.use('/static', express.static(path.resolve('../web/build/static')));

apiRoutes(app);

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.resolve('../web/build/favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.resolve('../web/build/manifest.json'));
});

app.get('/logo192.png', (req, res) => {
  res.sendFile(path.resolve('../web/build/logo192.png'));
});

app.get('/logo512.png', (req, res) => {
  res.sendFile(path.resolve('../web/build/logo512.png'));
});


app.get('/robots.txt', (req, res) => {
  res.sendFile(path.resolve('../web/build/robots.txt'));
});

app.get('/asset-manifest.json', (req, res) => {
  res.sendFile(path.resolve('../web/build/asset-manifest.json'));
});


app.get('*', (req, res) => {
  res.sendFile(path.resolve('../web/build/index.html'));
});

app.listen(constants.PORT, err => {
  if (err) {
    throw err;
  } else {
    console.log(`Server running on port: ${constants.PORT} 
        --- Running on ${process.env.NODE_ENV} 
        --- Make something great.!`);
  }
});
