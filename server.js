const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const permapin = require('./api/permapin');

const app = express();app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html')); 
});

app.get('/permapin/:hash', (req, res) => {
  permapin(req, res);
});

app.post('/permapin/:hash', (req, res) => {
  permapin(req, res);
});

app.listen((process.env.PORT || 8080), (process.env.HOST || '0.0.0.0'), () => console.log('ready on port 8080'));