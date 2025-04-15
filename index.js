const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 5000;
const cors = require('cors');
app.use(cors());

let cachedImage = null; // Stores the image on startup

// Fetches a random image from Wikipedia
async function fetchRandomImage() {
  try {
    const pageTitle = 'Don_Cheadle';
    const imagesResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        prop: 'images',
        titles: pageTitle,
        origin: '*',
      }
    });

    const pages = imagesResponse.data.query.pages;
    const images = Object.values(pages)[0].images;

    const filteredImages = images.filter(img => {
      const title = img.title.toLowerCase();
      return (
        !title.endsWith('.svg') &&
        !title.includes('logo') &&
        !title.includes('icon')
      );
    });

    if (filteredImages.length === 0) {
      throw new Error('No suitable images found.');
    }

    const randomImage = filteredImages[Math.floor(Math.random() * filteredImages.length)];

    const imageInfoRes = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        titles: randomImage.title,
        prop: 'imageinfo',
        iiprop: 'url',
        origin: '*',
      }
    });

    const imagePage = Object.values(imageInfoRes.data.query.pages)[0];
    return imagePage.imageinfo?.[0]?.url || null;
  } catch (err) {
    console.error('Error fetching random Wikipedia image:', err.message);
    return null;
  }
}

// API call for the facts
app.get('/random-fact', async (req, res) => {
  try {
    const response = await axios.get('https://en.wikipedia.org/api/rest_v1/page/summary/Don_Cheadle');
    const extract = response.data.extract;
    const sentences = extract.match(/[^\.!\?]+[\.!\?]+/g);
    const randomFact = sentences[Math.floor(Math.random() * sentences.length)].trim();

    res.json({ fact: randomFact, image: cachedImage });
  } catch (error) {
    console.error('Error fetching data from source', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Fetches image on startup and then start the server
fetchRandomImage().then(image => {
  cachedImage = image;
  console.log('Cached image selected:', cachedImage);

  app.listen(PORT, () => {
    console.log(`Server is operable on port ${PORT}`);
  });
});
