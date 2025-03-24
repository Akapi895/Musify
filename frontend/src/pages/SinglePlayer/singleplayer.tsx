import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/sidebar';
import './singleplayer.css';

interface Song {
  player_id: number;
  title: string;
  artist: string;
  duration?: number;
  release_date?: string;
  file_url?: string;
  lyrics?: string;
  user_id?: number;
}

interface Playlist {
  playlist_id: number;
  name: string;
  description?: string;
}

const SinglePlayer: React.FC = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSongData = async () => {
      if (!playerId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/player/songs/${playerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch song data oh no');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setSong(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch song data errrrr');
        }

        // Check if song is in favorites
        const favoriteResponse = await fetch(`http://127.0.0.1:8000/api/player/favorites/status/${playerId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (favoriteResponse.ok) {
          const favoriteData = await favoriteResponse.json();
          setIsFavorite(favoriteData.favor === true);
        }

        // Get user playlists
        const playlistsResponse = await fetch('http://127.0.0.1:8000/api/player/playlists/all', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (playlistsResponse.ok) {
          const playlistsData = await playlistsResponse.json();
          if (playlistsData.status === 'success') {
            setPlaylists(playlistsData.data.playlists || []);
          }
        }
      } catch (err) {
        console.error('Error fetching song:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Use sample data as fallback
        setSong({
          player_id: parseInt(playerId as string),
          title: "Sample Song",
          artist: "Sample Artist",
          duration: 240,
          release_date: "2023-01-01",
          file_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
          lyrics: "This is a sample song\nWith sample lyrics\nFor demonstration purposes"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongData();
  }, [playerId, token]);

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      const audioElement = audioRef.current;
      
      const updateTime = () => {
        setCurrentTime(audioElement.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      audioElement.addEventListener('timeupdate', updateTime);
      audioElement.addEventListener('ended', handleEnded);
      
      return () => {
        audioElement.removeEventListener('timeupdate', updateTime);
        audioElement.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleFavorite = async () => {
    if (!playerId || !song) return;

    try {
      const url = isFavorite 
        ? `http://127.0.0.1:8000/api/player/favorites/delete/${playerId}`
        : `http://127.0.0.1:8000/api/player/favorites/add/${playerId}`;
      
      const method = isFavorite ? 'DELETE' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        console.error('Failed to update favorite status');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const addToPlaylist = async (playlistId: number) => {
    if (!playerId || !song) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/player/playlists/add/${playlistId}/songs/${playerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Show success indicator
        alert(`Added "${song.title}" to playlist`);
      } else {
        console.error('Failed to add to playlist');
      }
    } catch (err) {
      console.error('Error adding to playlist:', err);
    } finally {
      setShowPlaylistMenu(false);
    }
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: song?.title || 'Check out this song!',
        text: `Listen to ${song?.title} by ${song?.artist} on Musify`,
        url: window.location.href
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((error) => console.error('Failed to copy', error));
    }
  };

  if (isLoading) {
    return (
      <div className="singleplayer-container">
        <Sidebar activePage="explore" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading song...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="singleplayer-container">
        <Sidebar activePage="explore" />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Failed to load song'}</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="singleplayer-container">
      <Sidebar activePage="explore" />
      
      <div className="singleplayer-content">
        {/* Song header - Two column layout */}
        <div className="song-header">
          {/* Column 1: Song Cover */}
          <div className="song-cover-player">
            <img 
              src={"https://placehold.co/400x400/1DB954/FFFFFF?text=Musify"} 
              alt={song.title} 
            />
          </div>
          
          {/* Column 2: Info and Actions */}
          <div className="song-details">
            {/* Row 1: Song Information */}
            <div className="song-info">
              <span className="song-label">SONG</span>
              <h1 className="song-title-player">{song.title}</h1>
              <p className="song-artist-player">{song.artist}</p>
              <div className="song-meta">
                {song.release_date && (
                  <>
                    <span className="release-date">{new Date(song.release_date).toLocaleDateString()}</span>
                    <span className="dot-separator">•</span>
                  </>
                )}
                <span className="duration">{
                  song.duration ? formatTime(song.duration) : '--:--'
                }</span>
              </div>
            </div>
            
            {/* Row 2: Action Buttons - Circular Grid Layout */}
            <div className="song-action-buttons">
              <button 
                className={`circular-button play-button ${isPlaying ? 'playing' : ''}`}
                onClick={togglePlay}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                    <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                  </svg>
                )}
                <span className="button-label">Play</span>
              </button>
              
              <button 
                className={`circular-button favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isFavorite ? (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="none" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                )}
                <span className="button-label">Favorite</span>
              </button>
              
              <button 
                className="circular-button playlist-button"
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                aria-label="Add to playlist"
              >
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M14 10H3v2h11v-2zm0-4H3v2h11V6zm0 8H3v2h11v-2zm4-4v8l6-4-6-4z" fill="currentColor"/>
                </svg>
                <span className="button-label">Playlist</span>
              </button>
              
              {showPlaylistMenu && (
                <div className="playlist-menu">
                  <div className="playlist-menu-header">
                    <h4>Your Playlists</h4>
                    <button 
                      className="close-menu"
                      onClick={() => setShowPlaylistMenu(false)}
                    >
                      &times;
                    </button>
                  </div>
                  {playlists.length > 0 ? (
                    <ul className="playlists-list">
                      {playlists.map(playlist => (
                        <li 
                          key={playlist.playlist_id}
                          onClick={() => addToPlaylist(playlist.playlist_id)}
                        >
                          {playlist.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-playlists">You don't have any playlists yet.</p>
                  )}
                  <button 
                    className="create-playlist"
                    onClick={() => navigate('/playlists')}
                  >
                    Create New Playlist
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lyrics section */}
        {song.lyrics && (
          <div className="lyrics-section">
            <h2>Lyrics</h2>
            <div className="lyrics-content">
              {song.lyrics.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SinglePlayer;