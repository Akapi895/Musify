import React from "react";
import { useNavigate } from "react-router-dom";
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
  onClick?: (id: number) => void;
  index?: number;
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
          src={"https://play-lh.googleusercontent.com/QovZ-E3Uxm4EvjacN-Cv1LnjEv-x5SqFFB5BbhGIwXI_KorjFhEHahRZcXFC6P40Xg"}
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
    duration,
    onClick
  }) => {
    const navigate = useNavigate();
    
    const handleClick = () => {
      if (onClick) {
        onClick(player_id);
      } else {
        navigate(`/player/${player_id}`);
      }
    };
    
    const formatDuration = (seconds?: number) => {
      if (!seconds) return "--:--";
      const min = Math.floor(seconds / 60);
      const sec = Math.floor(seconds % 60);
      return `${min}:${sec < 10 ? '0' + sec : sec}`;
    };
    
    return (
      <div className="song-card vertical" onClick={handleClick}>
        <div className="item-cover">
          <img 
            src={"https://www.shutterstock.com/image-photo/abstract-design-musical-note-symbol-600nw-1169623948.jpg"} 
            alt={title} 
          />
          <div className="play-overlay">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <polygon points="5,3 19,12 5,21" fill="#fff"/>
            </svg>
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