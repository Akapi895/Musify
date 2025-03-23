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

// Song Row component (alternative layout for song tables)
// export const SongRow: React.FC<SongProps> = ({ 
//   player_id, 
//   title, 
//   artist, 
//   duration,
//   index,
//   onClick 
// }) => {
//   const navigate = useNavigate();
  
//   const handleClick = () => {
//     if (onClick) {
//       onClick(player_id);
//     } else {
//       navigate(`/player/${player_id}`);
//     }
//   };
  
//   const formatDuration = (seconds?: number) => {
//     if (!seconds) return "--:--";
//     const min = Math.floor(seconds / 60);
//     const sec = Math.floor(seconds % 60);
//     return `${min}:${sec < 10 ? '0' + sec : sec}`;
//   };
  
//   return (
//     <div className="song-row" onClick={handleClick}>
//       <div className="song-number">{index !== undefined ? index + 1 : ""}</div>
//       <div className="song-title">{title}</div>
//       <div className="song-artist">{artist}</div>
//       <div className="song-duration">{duration ? formatDuration(duration) : "--:--"}</div>
//     </div>
//   );
// };

// Song Table Header component
// export const SongTableHeader: React.FC = () => (
//   <div className="song-header song-row">
//     <div className="song-number">#</div>
//     <div className="song-title">Title</div>
//     <div className="song-artist">Artist</div>
//     <div className="song-duration">Duration</div>
//   </div>
// );

// A container for horizontal scrolling lists
export const HorizontalScrollContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <div className="horizontal-scroll">
    {children}
  </div>
);

// A container for song tables
// export const SongTable: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => (
//   <div className="songs-table">
//     {children}
//   </div>
// );