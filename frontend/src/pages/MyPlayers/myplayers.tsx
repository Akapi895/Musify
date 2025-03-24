import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongItem } from '../../components/MusicItems';
import './myplayers.css';

interface Song {
  player_id: number;
  title: string;
  artist: string;
  duration: number;
  cover_url?: string;
  file_url?: string;
  release_date?: string;
}

const MyPlayers = () => {
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUserSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/player/user/songs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your songs');
        }

        const data = await response.json();
        console.log("User songs data:", data);
        
        // Get the songs array from the response, with fallbacks for different response structures
        const songsArray = data.data?.songs || 
                          (Array.isArray(data.data) ? data.data : []);
        
        setUserSongs(songsArray);
        setError(null);
      } catch (error) {
        console.error('Error fetching user songs:', error);
        setError('Failed to load your songs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserSongs();
  }, [token]);

  const handlePlaySong = (songId: number) => {
    navigate(`/player/${songId}`);
  };

  const handleUploadSong = () => {
    navigate('/upload');
  };

  return (
    <div className="myplayers-container">
      <div className="myplayers-header">
        <h1>Your Songs</h1>
        <button className="create-button" onClick={handleUploadSong}>
          <span style={{ fontSize: "1.5em" }}>+</span> Upload Song
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading your songs...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : userSongs.length === 0 ? (
        <div className="no-content-message">
          <p>You haven't uploaded any songs yet.</p>
          <button className="primary-button" onClick={handleUploadSong}>
            Upload your first song
          </button>
        </div>
      ) : (
        <div className="songs-grid">
          {userSongs.map((song) => (
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

export default MyPlayers;