import React, { useState, useRef, useEffect } from 'react';
import './musicbar.css';

interface Song {
  player_id: number;
  title: string;
  artist: string;
  file_url: string;
  duration: number;
}

interface MusicBarProps {
  isAuthenticated: boolean;
}

const MusicBar: React.FC<MusicBarProps> = ({ isAuthenticated }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Listen for song change events from other components
  useEffect(() => {
    const handleSongChange = (event: CustomEvent) => {
      const song = event.detail.song;
      console.log('Music bar received song:', song);
      setCurrentSong(song);
      setIsPlaying(true);
    };
    
    window.addEventListener('playSong' as any, handleSongChange);
    
    return () => {
      window.removeEventListener('playSong' as any, handleSongChange);
    };
  }, []);
  
  // Update audio element when current song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.file_url;
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
        });
      }
    }
  }, [currentSong]);

  // Control audio playback when isPlaying changes
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error('Error playing audio:', err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Track current time
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  // Don't show the music bar if not authenticated or no song is selected
  if (!isAuthenticated || !currentSong) {
    return null;
  }

  return (
    <div className="music-bar">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
      />
      
      <div className="song-info">
        <div className="song-title">{currentSong.title}</div>
        <div className="song-artist">{currentSong.artist}</div>
      </div>
      
      <div className="player-controls">
        <button className="control-btn prev-btn">
          <i className="fas fa-step-backward"></i>
        </button>
        
        <button className="control-btn play-pause-btn" onClick={handlePlayPause}>
          {isPlaying ? 
            <i className="fas fa-pause"></i> : 
            <i className="fas fa-play"></i>
          }
        </button>
        
        <button className="control-btn next-btn">
          <i className="fas fa-step-forward"></i>
        </button>
      </div>
      
      <div className="progress-container">
        <span className="time current">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={currentSong.duration}
          value={currentTime}
          onChange={handleTimeChange}
        />
        <span className="time total">{formatTime(currentSong.duration)}</span>
      </div>
      
      <div className="volume-container">
        <i className={`fas ${volume === 0 ? 'fa-volume-mute' : volume < 0.5 ? 'fa-volume-down' : 'fa-volume-up'}`}></i>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </div>
  );
};

export default MusicBar;