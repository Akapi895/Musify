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

// const playMusic = (song: Song) => {
//   try {
//     console.log("Play music called with song:", song.title, "ID:", song.player_id);
//     console.log("Current song:", currentSong?.title, "ID:", currentSong?.player_id);
    
//     // Check if this is actually a new song (different ID) or the same song
//     if (!currentSong || currentSong.player_id !== song.player_id) {
//       console.log("Loading new song:", song.title);
//             audioRef.current.src = song.file_url;
//       setCurrentSong(song);
//       audioRef.current.currentTime = 0;
//     } else {
//       // Same song, so just log the current position
//       console.log("Resuming existing song from position:", audioRef.current.currentTime);
//       // Don't reset currentTime here
//     }
    
//     // Play the song
//     const playPromise = audioRef.current.play();
    
//     if (playPromise !== undefined) {
//       playPromise
//         .then(() => {
//           console.log("Playback started successfully at:", audioRef.current.currentTime);
//           setIsPlaying(true);
//         })
//         .catch(error => {
//           console.error("Error playing song:", error);
//           setIsPlaying(false);
//         });
//     }
//   } catch (error) {
//     console.error("Error in playMusic function:", error);
//     setIsPlaying(false);
//   }
// };
  
const playMusic = (song: Song) => {
    try {
      if (!song.file_url) {
        console.error("Missing file URL for song:", song);
        return;
      }

      if (!currentSong || currentSong.player_id !== song.player_id) {
        console.log("Loading new song:", song.title);
        audioRef.current.src = song.file_url; // Chỉ đổi src nếu là bài hát mới
        setCurrentSong(song);
        audioRef.current.currentTime = 0;
      } else {
        console.log("Resuming existing song from:", audioRef.current.currentTime);
      }

      // Phát nhạc từ vị trí hiện tại
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error("Error playing song:", error));
    } catch (error) {
      console.error("Error in playMusic function:", error);
      setIsPlaying(false);
    }
  };


    const pauseMusic = () => {
    console.log("Pausing music");
    audioRef.current.pause();
    setIsPlaying(false); // This was incorrectly set to true
  };
  
// const togglePlay = () => {
//   console.log("Toggle play called, isPlaying:", isPlaying);
  
//   if (!currentSong) {
//     console.log("No current song, trying to load from localStorage");
//     const savedSong = localStorage.getItem("current-song");
//     if (savedSong) {
//       try {
//         const parsedSong: Song = JSON.parse(savedSong);
//         playMusic(parsedSong);
//       } catch (e) {
//         console.error("Error parsing saved song:", e);
//       }
//     }
//     return;
//   }
  
//   if (isPlaying) {
//     console.log("Currently playing, so pausing");
//     pauseMusic();
//   } else {
//     console.log("Currently paused, so resuming from:", audioRef.current.currentTime);
//     // The key fix: use the existing audio element's state instead of restarting
//     audioRef.current.play()
//       .then(() => {
//         console.log("Resume successful");
//         setIsPlaying(true);
//       })
//       .catch(err => {
//         console.error("Error resuming playback:", err);
//         setIsPlaying(false);
//       });
//   }
// };

  const togglePlay = () => {
    if (!currentSong) return;

    if (isPlaying) {
      pauseMusic();
    } else {
      console.log("Resuming from:", audioRef.current.currentTime);
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Error resuming playback:", err));
    }
  };


    const setVolume = (newVolume: number) => {
    console.log("Setting volume to:", newVolume);
    const clampedVolume = Math.min(1, Math.max(0, newVolume)); // Limit to 0-1
    audioRef.current.volume = clampedVolume;
        
    setVolumeState(clampedVolume);
  };
  
  const seekTo = (time: number) => {
    if (audioRef.current) {
      console.log("Seeking to:", time);
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