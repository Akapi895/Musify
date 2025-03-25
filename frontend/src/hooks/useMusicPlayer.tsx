import { useContext } from 'react';
import { MusicContext } from '../context/MusicContext';

export const useMusicPlayer = () => {
  const context = useContext(MusicContext);
  
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicProvider');
  }
  
  return context;
};