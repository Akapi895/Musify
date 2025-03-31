import React from "react";
import { useNavigate } from "react-router-dom";
import { useMusicPlayer } from '../hooks/useMusicPlayer';

import "./MusicItems.css";

// Types for our props
interface PlaylistProps {
  playlist_id: number;
  name: string;
  song_count?: number;
  onClick?: (id: number) => void;
}

interface SongProps {
  player_id: number;
  title: string;
  artist: string;
  cover_url?: string;
  duration?: number;
  file_url: string;
  onClick?: (song: SongProps) => void;
}

// Playlist component
export const PlaylistItem: React.FC<PlaylistProps> = ({ 
  playlist_id, 
  name, 
  song_count, 
  onClick 
}) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (onClick) {
      onClick(playlist_id);
    } else {
      navigate(`/playlist/${playlist_id}`);
    }
  };
  
  return (
    <div className="playlist-card" onClick={handleClick}>
      <div className="item-cover">
        <img 
          src={"../../public/assets/avatar/playlist.png"}
          alt={name} 
        />
        <div className="play-overlay">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <polygon points="5,3 19,12 5,21" fill="#fff"/>
          </svg>
        </div>
      </div>
      <h3 className="item-title">{name}</h3>
      <p className="item-subtitle">{song_count ?? 0} song{(song_count ?? 0) !== 1 ? 's' : ''}</p>
    </div>
  );
};

// Song component
export const SongItem: React.FC<SongProps> = ({ 
  player_id, 
  title, 
  artist,
  cover_url, 
  duration,
  file_url,
  onClick
  }) => {
    const navigate = useNavigate();
  const { currentSong, isPlaying } = useMusicPlayer();
  
  const handleClick = () => {
    if (onClick) {
      // Pass the complete song object to the onClick handler
      const song = { player_id, title, artist, cover_url, duration, file_url };
      onClick(song);
    } else {
      // Default behavior: navigate to song page
      navigate(`/player/${player_id}`);
    }
  };
    
    const formatDuration = (seconds?: number) => {
      if (!seconds) return "--:--";
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };

    const isActive = !!currentSong && currentSong.player_id === player_id;

    return (
      <div className={`song-card vertical ${isActive ? 'active-song' : ''}`} onClick={handleClick}>
        <div className="item-cover">
          <img 
            src={cover_url || "../../public/assets/avatar/music.jpg"} 
            alt={title} 
          />
          <div className="play-overlay">
            {isActive && isPlaying ? (
              // Pause icon when playing
              <svg viewBox="0 0 24 24" width="24" height="24">
                <rect x="6" y="5" width="4" height="14" fill="#fff"/>
                <rect x="14" y="5" width="4" height="14" fill="#fff"/>
              </svg>
            ) : (
              // Play icon when not playing
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polygon points="5,3 19,12 5,21" fill="#fff"/>
              </svg>
            )}
          </div>
        </div>
        <h3 className="item-title">{title}</h3>
        <p className="item-subtitle">{artist}</p>
        {duration && <p className="item-duration">{formatDuration(duration)}</p>}
      </div>
    );
  };

// A container for horizontal scrolling lists
export const HorizontalScrollContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="horizontal-scroll">
    {children}
  </div>
);