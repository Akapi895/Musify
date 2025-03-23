import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongItem } from '../../components/MusicItems';
import './favourites.css';

interface Song {
  player_id: number;
  title: string;
  artist: string;
  duration: number;
  cover_url?: string;
  file_url?: string;
  release_date?: string;
}

const Favourites = () => {
  const [favouriteSongs, setFavouriteSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFavouriteSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/player/favorites/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch favourite songs');
        }

        const data = await response.json();
        console.log("Favourites data:", data);
        
        // The structure of the response is:
        // { "status": "success", "data": { "songs": [...songs] } }
        
        // Get the songs array from the response, with fallbacks for different response structures
        const songsArray = data.data?.songs || 
                          (Array.isArray(data.data) ? data.data : []);
        
        setFavouriteSongs(songsArray);
        setError(null);
      } catch (error) {
        console.error('Error fetching favourite songs:', error);
        setError('Failed to load favourite songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavouriteSongs();
  }, [token]);

  const handlePlaySong = (songId: number) => {
    navigate(`/player/${songId}`);
  };

  return (
    <div className="favourites-container">
      <div className="favourites-header">
        <h1>Your Favourite Songs</h1>
      </div>

      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading favourite songs...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : favouriteSongs.length === 0 ? (
        <div className="no-content-message">
          <p>You haven't added any favourite songs yet.</p>
          <button className="secondary-button" onClick={() => navigate('/playlists')}>
            Discover music to add to your favourites
          </button>
        </div>
      ) : (
        <div className="songs-grid">
          {favouriteSongs.map((song) => (
            <SongItem
              key={song.player_id}
              player_id={song.player_id}
              title={song.title}
              artist={song.artist}
              duration={song.duration}
              cover_url={song.cover_url}
              onClick={handlePlaySong}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favourites;