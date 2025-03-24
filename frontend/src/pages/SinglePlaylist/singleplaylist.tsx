import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/sidebar';
import { SongItem } from '../../components/MusicItems';
import './singleplaylist.css';

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
  description: string;
  user_id: number;
  song_count: number;
  songs: Song[];
}

const SinglePlaylist: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPlaylistData = async () => {
      if (!playlistId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`http://127.0.0.1:8000/api/player/playlists/${playlistId}/all`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch playlist data');
        }

        const data = await response.json();
        if (data.status === 'success') {
          setPlaylist(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch playlist data');
        }
      } catch (err) {
        console.error('Error fetching playlist:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Use sample data as fallback
        setPlaylist({
          playlist_id: parseInt(playlistId),
          name: "My Sample Playlist",
          description: "A collection of awesome songs",
          user_id: 1,
          creator_name: "Music Lover",
          song_count: 4,
          songs: [
            { player_id: 1, title: "Shape of You", artist: "Ed Sheeran", duration: 235 },
            { player_id: 2, title: "Blinding Lights", artist: "The Weeknd", duration: 200 },
            { player_id: 3, title: "Dance Monkey", artist: "Tones and I", duration: 210 },
            { player_id: 4, title: "Watermelon Sugar", artist: "Harry Styles", duration: 174 }
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchPlaylistDetail = async () => {
        if (!playlistId) return;
        
        try {
          // Fetch playlist details
          const detailResponse = await fetch(`http://127.0.0.1:8000/api/player/playlists/one/${playlistId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      
          if (!detailResponse.ok) {
            throw new Error('Failed to fetch playlist details');
          }
      
          const detailData = await detailResponse.json();
          
          if (detailData.status === 'success') {
            setPlaylist(prevPlaylist => {
              if (!prevPlaylist) return null;
              
              return {
                ...prevPlaylist,
                name: detailData.data.name || prevPlaylist.name,
                description: detailData.data.description || prevPlaylist.description,
                user_id: detailData.data.user_id || prevPlaylist.user_id,
                song_count: detailData.data.song_count || prevPlaylist.songs?.length || 0
              };
            });
          }
        } catch (err) {
          console.error('Error fetching playlist details:', err);
        }
      };

    fetchPlaylistData();
    fetchPlaylistDetail();
  }, [playlistId, token]);

  const handleSongClick = (songId: number) => {
    navigate(`/player/${songId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="singleplaylist-container">
        <Sidebar activePage="playlists" />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading playlist...</p>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="singleplaylist-container">
        <Sidebar activePage="playlists" />
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Failed to load playlist'}</p>
          <button className="back-button" onClick={() => navigate('/playlists')}>
            Back to Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="singleplaylist-container">
      <Sidebar activePage="playlists" />
      
      <div className="singleplaylist-content">
        <div className="playlist-header">
          <div className="playlist-cover">
            <img 
              src="https://play-lh.googleusercontent.com/QovZ-E3Uxm4EvjacN-Cv1LnjEv-x5SqFFB5BbhGIwXI_KorjFhEHahRZcXFC6P40Xg" 
              alt={playlist.name} 
            />
          </div>
          
          <div className="playlist-info">
            <span className="playlist-label">PLAYLIST</span>
            <h1 className="playlist-title">{playlist.name}</h1>
            <p className="playlist-description">{playlist.description}</p>
            <div className="playlist-meta">
              <span className="dot-separator">•</span>
              <span className="song-count">{playlist.song_count} songs</span>
              <span className="dot-separator">•</span>
            </div>
          </div>
        </div>
        
        <div className="songs-table-header">
          <div className="song-number">#</div>
          <div className="song-title">TITLE</div>
          <div className="song-artist">ARTIST</div>
          <div className="song-duration">DURATION</div>
        </div>
        
        <div className="songs-list">
          {playlist.songs.length > 0 ? (
            playlist.songs.map((song, index) => (
              <div 
                key={song.player_id} 
                className="song-row"
                onClick={() => handleSongClick(song.player_id)}
              >
                <div className="song-number">{index + 1}</div>
                <div className="song-title-info">
                  <div className="song-cover">
                    <img 
                      src={"https://www.shutterstock.com/image-photo/abstract-design-musical-note-symbol-600nw-1169623948.jpg"} 
                      alt={song.title} 
                    />
                  </div>
                  <div className="song-title">{song.title}</div>
                </div>
                <div className="song-artist">{song.artist}</div>
                <div className="song-duration">
                  {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : '--:--'}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-playlist">
              <p>This playlist doesn't have any songs yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SinglePlaylist;