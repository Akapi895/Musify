import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlaylistItem } from '../../components/MusicItems';
import './playlists.css';

interface Playlist {
  id: number;
  name: string;
  description?: string;
  song_count: number;
  cover_url?: string;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAllPlaylists = async () => {
        try {
          setIsLoading(true);
          const response = await fetch('http://127.0.0.1:8000/api/player/playlists/all', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (!response.ok) {
            throw new Error('Failed to fetch playlists');
          }
      
          const data = await response.json();
          console.log("Playlists data:", data);
          
          // The structure of the response is:
          // { "status": "success", "data": [...playlists] }
          // where each playlist has playlist_id, id, name, etc.
          
          // Check if data.data is an array or has a playlists property
          const playlistsArray = Array.isArray(data.data) 
            ? data.data 
            : data.data?.playlists || [];
          
          setPlaylists(playlistsArray);
          setError(null);
        } catch (error) {
          console.error('Error fetching playlists:', error);
          setError('Failed to load playlists. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      };

    fetchAllPlaylists();
  }, [token]);

  const handlePlaylistClick = (playlistId: number) => {
    navigate(`/playlist/${playlistId}`);
  };

  const handleCreatePlaylist = () => {
    navigate('/profile'); // Navigate to profile page where users can create playlists
  };

  return (
    <div className="playlists-container">
      <div className="playlists-header">
        <h1>All Playlists</h1>
        <button className="create-button" onClick={handleCreatePlaylist}>
          <span style={{ fontSize: "1.5em" }}>+</span> Create Playlist
        </button>
      </div>

      {isLoading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Loading playlists...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : playlists.length === 0 ? (
        <div className="no-content-message">
          <p>No playlists found.</p>
          <button className="secondary-button" onClick={handleCreatePlaylist}>
            Create your first playlist
          </button>
        </div>
      ) : (
        <div className="playlists-grid">
          {playlists.map((playlist) => (
            <PlaylistItem
              key={playlist.id}
              playlist_id={playlist.id}
              name={playlist.name}
              song_count={playlist.song_count}
              onClick={handlePlaylistClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;