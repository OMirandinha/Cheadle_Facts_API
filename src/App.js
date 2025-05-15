import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [fact, setFact] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    fetchFact();
  }, []);

  const fetchFact = () => {
    setLoading(true);
    setFade(true);

    setTimeout(() => {
      fetch('http://localhost:5000/random-fact')
        .then(res => res.json())
        .then(data => {
          setFact(data.fact);
          setImage(data.image);
          setLoading(false);
          setFade(false);
        })
        .catch(err => {
          console.error('Error fetching fact:', err);
          setFact('Failed to fetch fact.');
          setLoading(false);
          setFade(false);
        });
    }, 300);
  };

  return (
    <>
      {/* Sakura GIFs in top corners */}
      <img src="sakuratree.gif" className="sakura-top-left" alt="Sakura Left" />
      <img src="sakuratree.gif" className="sakura-top-right" alt="Sakura Right" />

      {/* Decorative Tree */}
      <div className="sakura-tree">
        <div className="tree-trunk"></div>
        <div className="tree-branch branch-1"></div>
        <div className="tree-branch branch-2"></div>
        <div className="tree-branch branch-3"></div>
        <div className="blossom-cluster cluster-1"></div>
        <div className="blossom-cluster cluster-2"></div>
        <div className="blossom-cluster cluster-3"></div>
      </div>

      {/* Falling petals */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * -100}vh`,
            animationDelay: `${Math.random() * 10}s`,
          }}
        ></div>
      ))}

      {/* Main App Content */}
      <div className="App">
        <h1>Random Don Cheadle Fact</h1>

        {image && (
          <img
            src={image}
            alt="Don Cheadle"
            className="fact-image"
          />
        )}

        <p className={`fact ${fade ? 'fade-out' : 'fade-in'}`}>
          {loading ? 'Loading fact...' : fact}
        </p>

        <button onClick={fetchFact}>Get Another Fact</button>
      </div>
    </>
  );
}

export default App;
