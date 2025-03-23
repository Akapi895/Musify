import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/sidebar';
import './home.css';

const Home: React.FC = () => {
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [newReleases, setNewReleases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Fetch featured songs and new releases
    // This is just sample data - in a real app, you would fetch from your API
    const fetchData = async () => {
      try {
        // Simulating API call with sample data
        setTimeout(() => {
          setFeaturedSongs([
            { id: 1, title: 'Shape of You', artist: 'Ed Sheeran', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Shape+of+You' },
            { id: 2, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Blinding+Lights' },
            { id: 3, title: 'Bad Guy', artist: 'Billie Eilish', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Bad+Guy' },
            { id: 4, title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Uptown+Funk' },
          ]);
          
          setNewReleases([
            { id: 5, title: 'As It Was', artist: 'Harry Styles', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=As+It+Was' },
            { id: 6, title: 'STAY', artist: 'The Kid LAROI, Justin Bieber', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=STAY' },
            { id: 7, title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=Heat+Waves' },
            { id: 8, title: 'Easy On Me', artist: 'Adele', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=Easy+On+Me' },
          ]);
          
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleSongClick = (songId: number) => {
    navigate(`/player/${songId}`);
  };
  
  return (
    <div className="home-container">
      <Sidebar activePage="home" />
      
      <div className="home-content">
        <header className="home-header">
          <h1>Welcome to Musify</h1>
          <p>Stream your favorite music</p>
        </header>
        
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading great music for you...</p>
          </div>
        ) : (
          <>
            <section className="featured-section">
              <h2>Featured Songs</h2>
              <div className="song-grid">
                {featuredSongs.map(song => (
                  <div 
                    key={song.id} 
                    className="song-card" 
                    onClick={() => handleSongClick(song.id)}
                  >
                    <div className="song-cover">
                      <img src={song.cover} alt={song.title} />
                      <div className="play-overlay">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <polygon points="5,3 19,12 5,21" fill="#fff"/>
                        </svg>
                      </div>
                    </div>
                    <div className="song-info">
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
            <section className="new-releases-section">
              <h2>New Releases</h2>
              <div className="song-grid">
                {newReleases.map(song => (
                  <div 
                    key={song.id} 
                    className="song-card" 
                    onClick={() => handleSongClick(song.id)}
                  >
                    <div className="song-cover">
                      <img src={song.cover} alt={song.title} />
                      <div className="play-overlay">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          <polygon points="5,3 19,12 5,21" fill="#fff"/>
                        </svg>
                      </div>
                    </div>
                    <div className="song-info">
                      <h3>{song.title}</h3>
                      <p>{song.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;