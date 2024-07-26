const express = require('express');
const mongoose = require('mongoose');
const ShortUrl = require('./models/shortUrl');
const path = require('path');
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/urlShortener').then(() => {
  console.log('Connected to MongoDB!');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err.message);
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Route to get all short URLs and render the index page
app.get('/', async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.render('index', { shortUrls: shortUrls });
  } catch (err) {
    console.error('Error fetching short URLs:', err.message);
    res.sendStatus(500);
  }
});

// Route to create a new short URL
app.post('/shortUrls', async (req, res) => {
  try {
    await ShortUrl.create({ full: req.body.fullUrl });
    res.redirect('/');
  } catch (err) {
    console.error('Error creating short URL:', err.message);
    res.sendStatus(500);
  }
});

// Route to redirect to the full URL based on the short URL
app.get('/:shortUrl', async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (shortUrl == null) return res.sendStatus(404);

    shortUrl.clicks++;
    await shortUrl.save();

    res.redirect(shortUrl.full);
  } catch (err) {
    console.error('Error processing short URL:', err.message);
    res.sendStatus(500);
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
