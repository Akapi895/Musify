import React, { createContext, useState, useRef, ReactNode, useEffect } from "react";

interface Song {
  player_id: number;
  title: string;
  artist: string;
  file_url: string;
  duration?: number;
}

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playMusic: (song: Song) => void;
  pauseMusic: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  audioRef: React.RefObject<HTMLAudioElement>; 
}

export const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.7);
  
  const audioRef = useRef<HTMLAudioElement>(new Audio());

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    
    // Set initial volume
    audio.volume = volume;
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioRef]);
  
  // Save current song to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('current-song', JSON.stringify(currentSong));
    }
  }, [currentSong]);
  
  // Load saved song on mount
  useEffect(() => {
    const savedSong = localStorage.getItem('current-song');
    if (savedSong) {
      try {
        const parsedSong = JSON.parse(savedSong);
        setCurrentSong(parsedSong);
        
        // Set the audio source but don't autoplay
        audioRef.current.src = parsedSong.file_url;
      } catch (e) {
        console.error('Error loading saved song:', e);
        localStorage.removeItem("current-song"); 
      }
    }
  }, []);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playMusic = (song: Song) => {
    try {
      if (!currentSong || currentSong.player_id !== song.player_id) {
        audioRef.current.src = song.file_url;
        console.log("Playing song from thiss:", song);
        setCurrentSong(song);
      }
      
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error("Error playing song:", error);
          setIsPlaying(false);
        });
    } catch (error) {
      console.error("Failed to play song:", error);
    }
  };
  
  const pauseMusic = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };
  
  const togglePlay = () => {
    if (!currentSong) {
      const savedSong = localStorage.getItem("current-song");
      if (savedSong) {
        try {
          const parsedSong: Song = JSON.parse(savedSong);
          playMusic(parsedSong);
        } catch (e) {
          console.error("Error parsing saved song:", e);
        }
      }
      return;
    }
    
    isPlaying ? pauseMusic() : playMusic(currentSong);
  };
  
  const setVolume = (newVolume: number) => {
    const clampedVolume = Math.min(1, Math.max(0, newVolume)); // Giới hạn từ 0 - 1
    audioRef.current.volume = clampedVolume;
    setVolumeState(clampedVolume);
  };
  
  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <MusicContext.Provider 
      value={{ 
        currentSong, 
        isPlaying, 
        playMusic, 
        pauseMusic, 
        togglePlay,
        setVolume,
        seekTo,
        currentTime,
        duration,
        volume,
        audioRef
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};