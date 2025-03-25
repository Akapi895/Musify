const MusicBar: React.FC<MusicBarProps> = ({ isAuthenticated }) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const musicContext = useContext(MusicContext);

  // Dữ liệu mặc định nếu `musicContext` chưa có giá trị
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

  // Cập nhật audio khi bài hát hoặc trạng thái phát thay đổi
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    if (audioRef.current.src !== currentSong.file_url) {
      audioRef.current.src = currentSong.file_url;
      setCurrentTime(0);
    }

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
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

  // Cập nhật thời gian hiện tại
  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Nếu không đăng nhập hoặc không có bài hát, chỉ hiển thị UI rỗng
  if (!isAuthenticated || !currentSong) {
    return <div className="music-bar hidden"></div>;
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
        <button className="control-btn prev-btn">
          <i className="fas fa-step-backward"></i>
        </button>
        
        <button className="control-btn play-pause-btn" onClick={() => isPlaying ? pauseMusic() : playMusic(currentSong)}>
          {isPlaying ? <i className="fas fa-pause"></i> : <i className="fas fa-play"></i>}
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
          max={currentSong.duration || 1}
          value={currentTime}
          onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
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
