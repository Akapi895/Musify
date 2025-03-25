import React, { useState, useEffect, useContext } from 'react';
import { MusicContext } from '../../context/MusicContext';
import './musicbar.css';
import { BiPlay, BiPause } from "react-icons/bi";

interface MusicBarProps {
  isAuthenticated: boolean;
}

const MusicBar: React.FC<MusicBarProps> = ({ isAuthenticated }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const musicContext = useContext(MusicContext);

  const { currentSong, isPlaying, playMusic, pauseMusic, setVolume, volume, audioRef } = 
    musicContext ?? {
      currentSong: null,
      isPlaying: false,
      playMusic: () => {},
      pauseMusic: () => {},
      setVolume: () => {},
      volume: 0.5,
      audioRef: { current: null },
    };

  // Cập nhật audio element khi bài hát hoặc trạng thái phát thay đổi
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    // Nếu bài hát thay đổi, cập nhật source và reset thanh tiến trình
    if (audioRef.current.src !== currentSong.file_url) {
      audioRef.current.src = currentSong.file_url;
      setCurrentTime(0);
    }

    // Phát hoặc dừng dựa trên trạng thái `isPlaying`
    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error('Error playing audio:', err);
        pauseMusic();
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, isPlaying, pauseMusic]);

  // Cập nhật volume khi thay đổi
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Cập nhật thời gian hiện tại của bài hát
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // const handlePlayPause = () => {
  //   if (!currentSong) return;
  //   if (audioRef.current?.paused) {
  //     playMusic(currentSong);
  //   } else {
  //     pauseMusic();
  //   }
  // };

  const formatTime = (time?: number): string => {
    if (time === undefined) return "--:--";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

    // const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //   const newVolume = parseFloat(e.target.value);
    //   setVolume(newVolume); // Đồng bộ volume với MusicContext
    // };

    // Nếu context chưa có hoặc chưa đăng nhập, không hiển thị music bar
    if (!musicContext || !isAuthenticated || !currentSong) {
      return null;
      // return <div className="music-bar hidden"></div>;
    }

  return (
    <div className="music-bar">
      <audio 
        ref={audioRef} 
        onEnded={() => pauseMusic()}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
      />
      
      <div className="song-info">
        <div className="song-title">{currentSong.title}</div>
        <div className="song-artist">{currentSong.artist}</div>
      </div>
      
      <div className="player-controls">        
        <button className=".control-btn-music-bar play-pause-btn-music-bar" onClick={() => isPlaying ? pauseMusic() : playMusic(currentSong)}>
          {isPlaying ? <BiPause size={24} color="#fff" /> : <BiPlay size={24} color="#fff" />}
        </button>
      </div>
      
      <div className="progress-container">
        <span className="time current">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="progress-bar"
          min="0"
          max={currentSong.duration || 1} 
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
          onChange={(e) => setVolume(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default MusicBar;
