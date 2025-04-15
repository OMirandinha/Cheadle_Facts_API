import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [fact, setFact] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false); // State to control fading effect

  // Fetches the image once on startup
  useEffect(() => {
    fetch('http://localhost:5000/random-fact')
      .then(res => res.json())
      .then(data => {
        setFact(data.fact);
        setImage(data.image); // Set image on startup
      })
      .catch(err => {
        console.error('Error fetching fact:', err);
        setFact('Failed to fetch fact.');
      });
  }, []);

  // Fetches a new fact on button press with fading transition
  const fetchFact = () => {
    setLoading(true); // Show loading state
    setFade(true); // Start fading out the current fact

    // Waits for the fade-out transition to complete before updating the fact
    setTimeout(() => {
      fetch('http://localhost:5000/random-fact')
        .then(res => res.json())
        .then(data => {
          setFact(data.fact); // Only update fact
          setLoading(false);
          setFade(false); // Start fading in the new fact
        })
        .catch(err => {
          console.error('Error fetching fact:', err);
          setFact('Failed to fetch fact.');
          setLoading(false);
          setFade(false);
        });
    }, 300); // Wait for 300ms to allow fading out before changing fact
  };

  return (
    <div className="App">
      <h1>Random Don Cheadle Fact</h1>

      {/* Show the image only once (on startup) */}
      {image && (
        <img
          src={image}
          alt="Don Cheadle"
          style={{ width: '300px', borderRadius: '10px', marginBottom: '20px' }}
        />
      )}

      {/* Show loading text if the fact is loading */}
      {loading ? (
        <p>Loading fact...</p>
      ) : (
        <p
          className={`fact ${fade ? 'fade-out' : 'fade-in'}`}
          style={{ marginBottom: '20px' }}
        >
          {fact}
        </p>
      )}

      {/* Button to fetch new fact */}
      <button onClick={fetchFact} style={{ padding: '10px 20px', borderRadius: '8px' }}>
        Get Another Fact
      </button>
    </div>
  );
}

export default App;
