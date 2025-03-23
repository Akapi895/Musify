import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/sidebar';
import { SongItem } from '../../components/MusicItems';
import './home.css';

interface Song {
  id: number;
  player_id?: number; // For compatibility with SongItem
  title: string;
  artist: string;
  cover?: string;
  cover_url?: string; // For compatibility with SongItem
  duration?: number;
}

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
        const featuredResponse = await fetch('http://127.0.0.1:8000/api/player/featured', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Fetch new releases
        const newReleasesResponse = await fetch('http://127.0.0.1:8000/api/player/new-releases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Fetch top 5 favourites
        const favouritesResponse = await fetch('http://127.0.0.1:8000/api/player/favorites/top?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // If backend API is still in progress, use sample data
        if (!featuredResponse.ok || !newReleasesResponse.ok || !favouritesResponse.ok) {
          console.log("Using sample data as API endpoints are not ready");
          
          // Sample featured songs
          setFeaturedSongs([
            { id: 1, player_id: 1, title: 'Shape of You', artist: 'Ed Sheeran', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Shape+of+You', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Shape+of+You' },
            { id: 2, player_id: 2, title: 'Blinding Lights', artist: 'The Weeknd', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Blinding+Lights', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Blinding+Lights' },
            { id: 3, player_id: 3, title: 'Bad Guy', artist: 'Billie Eilish', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Bad+Guy', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Bad+Guy' },
            { id: 4, player_id: 4, title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', cover: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Uptown+Funk', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Uptown+Funk' },
          ]);
          
          // Sample new releases
          setNewReleases([
            { id: 5, player_id: 5, title: 'As It Was', artist: 'Harry Styles', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=As+It+Was', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=As+It+Was' },
            { id: 6, player_id: 6, title: 'STAY', artist: 'The Kid LAROI, Justin Bieber', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=STAY', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=STAY' },
            { id: 7, player_id: 7, title: 'Heat Waves', artist: 'Glass Animals', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=Heat+Waves', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=Heat+Waves' },
            { id: 8, player_id: 8, title: 'Easy On Me', artist: 'Adele', cover: 'https://placehold.co/300x300/E91429/FFFFFF?text=Easy+On+Me', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=Easy+On+Me' },
          ]);
          
          // Sample top 5 favourites
          setTopFavourites([
            { id: 9, player_id: 9, title: 'Bohemian Rhapsody', artist: 'Queen', cover: 'https://placehold.co/300x300/FFD700/000000?text=Bohemian+Rhapsody', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Bohemian+Rhapsody' },
            { id: 10, player_id: 10, title: 'Billie Jean', artist: 'Michael Jackson', cover: 'https://placehold.co/300x300/FFD700/000000?text=Billie+Jean', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Billie+Jean' },
            { id: 11, player_id: 11, title: 'Hotel California', artist: 'Eagles', cover: 'https://placehold.co/300x300/FFD700/000000?text=Hotel+California', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Hotel+California' },
            { id: 12, player_id: 12, title: 'Imagine', artist: 'John Lennon', cover: 'https://placehold.co/300x300/FFD700/000000?text=Imagine', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Imagine' },
            { id: 13, player_id: 13, title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', cover: 'https://placehold.co/300x300/FFD700/000000?text=Sweet+Child', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Sweet+Child' },
          ]);
        } else {
          // Parse actual responses from backend
          const featuredData = await featuredResponse.json();
          const newReleasesData = await newReleasesResponse.json();
          const favouritesData = await favouritesResponse.json();
          
          setFeaturedSongs(featuredData.data.songs || []);
          setNewReleases(newReleasesData.data.songs || []);
          setTopFavourites(favouritesData.data.songs || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Use sample data as fallback
        setFeaturedSongs([
          { id: 1, player_id: 1, title: 'Shape of You', artist: 'Ed Sheeran', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Shape+of+You' },
          { id: 2, player_id: 2, title: 'Blinding Lights', artist: 'The Weeknd', cover_url: 'https://placehold.co/300x300/1DB954/FFFFFF?text=Blinding+Lights' },
        ]);
        setNewReleases([
          { id: 5, player_id: 5, title: 'As It Was', artist: 'Harry Styles', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=As+It+Was' },
          { id: 6, player_id: 6, title: 'STAY', artist: 'The Kid LAROI, Justin Bieber', cover_url: 'https://placehold.co/300x300/E91429/FFFFFF?text=STAY' },
        ]);
        setTopFavourites([
          { id: 9, player_id: 9, title: 'Bohemian Rhapsody', artist: 'Queen', cover_url: 'https://placehold.co/300x300/FFD700/000000?text=Bohemian+Rhapsody' },
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
              <div className="song-grid">
                {topFavourites.map(song => (
                  <SongItem
                    key={song.id || song.player_id}
                    player_id={song.player_id || song.id}
                    title={song.title}
                    artist={song.artist}
                    cover_url={song.cover_url || song.cover}
                    duration={song.duration}
                    onClick={handleSongClick}
                  />
                ))}
                {topFavourites.length === 0 && (
                  <div className="no-content-message">
                    <p>Add songs to your favourites to see them here!</p>
                  </div>
                )}
              </div>
              {topFavourites.length > 0 && (
                <div className="view-more-container">
                  <button className="view-more-button" onClick={() => navigate('/favourites')}>
                    View All Favourites
                  </button>
                </div>
              )}
            </section>
            
            <section className="featured-section">
              <h2>Featured Songs</h2>
              <p className="section-description">Handpicked just for you</p>
              <div className="song-grid">
                {featuredSongs.map(song => (
                  <SongItem
                    key={song.id || song.player_id}
                    player_id={song.player_id || song.id}
                    title={song.title}
                    artist={song.artist}
                    cover_url={song.cover_url || song.cover}
                    duration={song.duration}
                    onClick={handleSongClick}
                  />
                ))}
              </div>
            </section>
            
            <section className="new-releases-section">
              <h2>New Releases</h2>
              <p className="section-description">Fresh music updated weekly</p>
              <div className="song-grid">
                {newReleases.map(song => (
                  <SongItem
                    key={song.id || song.player_id}
                    player_id={song.player_id || song.id}
                    title={song.title}
                    artist={song.artist}
                    cover_url={song.cover_url || song.cover}
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