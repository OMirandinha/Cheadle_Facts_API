const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path'); // NEW: required for handling file paths
const cors = require('cors');

const app = express();
const PORT = 5000;
app.use(cors());

let cachedImage = null; // Stores the image on startup
let facts = []; // Array to store facts
let lastFact = ''; // Stores the last fact to prevent repeating

// Path to your facts.txt file
const factsPath = path.resolve('random-facts-app', 'src', 'facts.txt'); 


console.log('Normalized facts path:', factsPath);  // Check for the normalized path

// Read facts from the local text file
function loadFacts() {
  return new Promise((resolve, reject) => {
    fs.readFile(factsPath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading facts file:', err); // Log error in case of failure
        return reject('Failed to load facts');
      }
      facts = data.split('\n').filter(line => line.trim() !== '');
      resolve();
    });
  });
}
3. 


// Read facts from the local text file
function loadFacts() {
  return new Promise((resolve, reject) => {
    fs.readFile(factsPath, 'utf8', (err, data) => {
      if (err) {
        return reject('Failed to load facts');
      }
      facts = data.split('\n').filter(line => line.trim() !== '');
      resolve();
    });
  });
}

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

// Fetches a random fact from the local list, ensuring no repeat
async function fetchRandomFact() {
  if (facts.length === 0) {
    throw new Error('No facts available.');
  }

  let randomFact = facts[Math.floor(Math.random() * facts.length)].trim();

  while (randomFact === lastFact) {
    randomFact = facts[Math.floor(Math.random() * facts.length)].trim();
  }

  lastFact = randomFact;
  return randomFact;
}

// API call for the facts
app.get('/random-fact', async (req, res) => {
  try {
    const fact = await fetchRandomFact();
    res.json({ fact: fact, image: cachedImage });
  } catch (error) {
    console.error('Error fetching fact:', error.message);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Load facts and image, then start server
loadFacts()
  .then(() => {
    console.log('Facts loaded successfully');
    return fetchRandomImage();
  })
  .then(image => {
    cachedImage = image;
    console.log('Cached image selected:', cachedImage);

    app.listen(PORT, () => {
      console.log(`Server is operable on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error during startup:', err);
  });
