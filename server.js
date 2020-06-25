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

app.listen(3000, () => console.log('ready on port 3000'));