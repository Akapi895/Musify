import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/sidebar';
import { SongItem, HorizontalScrollContainer } from '../../components/MusicItems';
import './home.css';

interface Song {
  id: number;
  player_id?: number;
  title: string;
  artist: string;
  cover?: string;
  duration?: number;
}

// Custom scroll controls component
const ScrollControls: React.FC<{
  scrollContainerId: string;
}> = ({ scrollContainerId }) => {
  const scrollLeft = () => {
    const container = document.getElementById(scrollContainerId);
    if (container) {
      container.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById(scrollContainerId);
    if (container) {
      container.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  return (
    <div className="scroll-controls">
      <button className="scroll-button" onClick={scrollLeft} aria-label="Scroll left">
        &#8592;
      </button>
      <button className="scroll-button" onClick={scrollRight} aria-label="Scroll right">
        &#8594;
      </button>
    </div>
  );
};

const Home: React.FC = () => {
  const [featuredSongs, setFeaturedSongs] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [topFavourites, setTopFavourites] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch featured songs
        const featuredResponse = await fetch('http://127.0.0.1:8000/api/home/featured', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Fetch new releases
        const newReleasesResponse = await fetch('http://127.0.0.1:8000/api/home/new-releases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Fetch top 5 favourites
        const favouritesResponse = await fetch('http://127.0.0.1:8000/api/home/favorites/top?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const featuredData = await featuredResponse.json();
        const newReleasesData = await newReleasesResponse.json();
        const favouritesData = await favouritesResponse.json();
        
        setFeaturedSongs(featuredData.data.songs || []);
        setNewReleases(newReleasesData.data.songs || []);
        setTopFavourites(favouritesData.data.songs || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use sample data as fallback
        setFeaturedSongs([
          { id: 1, player_id: 1, title: 'Shape of You', artist: 'Ed Sheeran'},
          { id: 2, player_id: 2, title: 'Blinding Lights', artist: 'The Weeknd'},
        ]);
        setNewReleases([
          { id: 5, player_id: 5, title: 'As It Was', artist: 'Harry Styles'},
          { id: 6, player_id: 6, title: 'STAY', artist: 'The Kid LAROI, Justin Bieber'},
        ]);
        setTopFavourites([
          { id: 9, player_id: 9, title: 'Bohemian Rhapsody', artist: 'Queen'},
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [token]);
  
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
            <section className="top-favourites-section">
              <h2>Top 5 Favourite Songs</h2>
              <p className="section-description">Your most loved tracks</p>
              <div className="two-column-container">
                {/* Left column with heading and image */}
                <div className="favourites-info-column">
                  <div className="favourite-image-container">
                    <img 
                      src={'https://img.freepik.com/free-photo/earth-with-headphones-with-glittery-effect-black-background_1048-2890.jpg'} 
                      alt="Top favourites" 
                      className="favourite-cover-image" 
                    />
                    <div className="favourite-image-overlay">
                      <div className="favourite-count">{topFavourites.length}</div>
                      <div className="favourite-label">Top Tracks</div>
                    </div>
                  </div>
                  {topFavourites.length > 0 && (
                    <button className="view-more-button" onClick={() => navigate('/favourites')}>
                      View Your Favourites
                    </button>
                  )}
                </div>
                
                {/* Right column with songs in vertical list */}
                <div className="favourites-songs-column">
                  {topFavourites.length > 0 ? (
                    <div className="vertical-song-list">
                      {topFavourites.map((song, index) => (
                        <div 
                          key={song.id || song.player_id} 
                          className="vertical-song-item"
                          onClick={() => handleSongClick(song.player_id || song.id)}
                        >
                          <div className="song-number">{index + 1}</div>
                          <div className="song-image">
                            <img src={'https://placehold.co/60x60/FFD700/000000?text=Song'} alt={song.title} />
                          </div>
                          <div className="song-info">
                            <div className="song-title">{song.title}</div>
                            <div className="song-artist">{song.artist}</div>
                          </div>
                          <div className="song-play-button">
                            <svg viewBox="0 0 24 24" width="24" height="24">
                              <polygon points="8,5 19,12 8,19" fill="currentColor"/>
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-content-message">
                      <p>Add songs to your favourites to see them here!</p>
                      <button className="secondary-button" onClick={() => navigate('/explore')}>
                        Explore Music
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>
            
            <section className="featured-section">
              <div className="section-header">
                <h2>Featured Songs</h2>
                <ScrollControls scrollContainerId="featured-scroll" />
              </div>
              <p className="section-description">Handpicked just for you</p>
              <div className="horizontal-scroll" id="featured-scroll">
                {featuredSongs.map(song => (
                  <SongItem
                    key={song.id || song.player_id}
                    player_id={song.player_id || song.id}
                    title={song.title}
                    artist={song.artist}
                    duration={song.duration}
                    onClick={handleSongClick}
                  />
                ))}
              </div>
            </section>
            
            <section className="new-releases-section">
              <div className="section-header">
                <h2>New Releases</h2>
                <ScrollControls scrollContainerId="new-releases-scroll" />
              </div>
              <p className="section-description">Fresh music updated weekly</p>
              <div className="horizontal-scroll" id="new-releases-scroll">
                {newReleases.map(song => (
                  <SongItem
                    key={song.id || song.player_id}
                    player_id={song.player_id || song.id}
                    title={song.title}
                    artist={song.artist}
                    duration={song.duration}
                    onClick={handleSongClick}
                  />
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