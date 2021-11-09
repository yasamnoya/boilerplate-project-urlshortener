require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const Url = require('./url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.once('open', () => console.log('Connected to Database'));

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
  const cleanUrl = req.body.url.replace(/https?:\/\//, "").replace(/\/$/, "");
  dns.lookup(cleanUrl, (err, addr) => {
    if (err) {
      return res.json({ error: "invalid url" });
    }
  });
  const url = await Url.create({ url: cleanUrl });
  res.json(url);
});

app.get('/api/shorturl/:id', async (req, res) => {
  const url = await Url.findById(req.params.id);
  if (!url) {
    return res.status(404).send("shorturl not found");
  };
  res.redirect(`http://${url.url}`);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
