import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SongItem } from '../../components/MusicItems';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import Sidebar from '../../components/Sidebar/sidebar';
import './explore.css';

interface Song {
  player_id: number;
  title: string;
  artist: string;
  duration: number;
  cover_url?: string;
  file_url: string;
  release_date?: string;
  genre?: string;
}

const Explore: React.FC = () => {
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  // Music player hook for playing songs
  const { playMusic } = useMusicPlayer();
  
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/player/all/songs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch songs');
        }

        const data = await response.json();
        console.log("Explore data:", data);
        
        // Get the songs array from the response, with fallbacks for different response structures
        const songsArray = data.data?.songs || 
                          (Array.isArray(data.data) ? data.data : []);
        
        setAllSongs(songsArray);
        setFilteredSongs(songsArray);
        setError(null);
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError('Failed to load songs. Please try again later.');
        
        // Use sample data for testing if the API fails
        const sampleSongs = [
          {
            player_id: 1,
            title: "Summer Vibes",
            artist: "DJ Sunshine",
            duration: 180,
            cover_url: "https://placehold.co/400x400/FFD700/000000?text=Summer+Vibes",
            file_url: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
            genre: "electronic"
          },
          {
            player_id: 2,
            title: "Midnight Blues",
            artist: "Jazz Quartet",
            duration: 240,
            cover_url: "https://placehold.co/400x400/0088FF/FFFFFF?text=Midnight+Blues",
            file_url: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
            genre: "jazz"
          },
          {
            player_id: 3,
            title: "Rock Anthem",
            artist: "The Legends",
            duration: 210,
            cover_url: "https://placehold.co/400x400/FF0000/FFFFFF?text=Rock+Anthem",
            file_url: "https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3",
            genre: "rock"
          }
        ];
        setAllSongs(sampleSongs);
        setFilteredSongs(sampleSongs);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllSongs();
  }, [token]);

  // Filter songs based on search term and selected category
  useEffect(() => {
    let result = allSongs;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(song => 
        song.title.toLowerCase().includes(term) || 
        song.artist.toLowerCase().includes(term)
      );
    }
    
    setFilteredSongs(result);
  }, [searchTerm, selectedCategory, allSongs]);

  const handlePlaySong = (song: Song) => {
    if (song.file_url) {
      const songWithDefaults: Song = {
        ...song,
        duration: song.duration ?? 0,
      };
      
      // Play the song using the music context
      playMusic(songWithDefaults);
    }
    
    // Navigate to the player page
    navigate(`/player/${song.player_id}`);
  };

  return (
    <div className="explore-container">
      <Sidebar activePage="explore" />
      
      <div className="explore-content">
        <div className="explore-header">
          <h1>Explore Music</h1>
        </div>

        {isLoading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
            <p>Discovering music for you...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredSongs.length === 0 ? (
          <div className="no-content-message">
            <p>No songs found matching your criteria.</p>
            <button className="secondary-button" onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}>
              Clear filters
            </button>
          </div>
        ) : (
          <>
            
            <div className="songs-grid">
              {filteredSongs.map((song) => (
                <SongItem
                  key={song.player_id}
                  player_id={song.player_id}
                  title={song.title}
                  artist={song.artist}
                  duration={song.duration}
                  cover_url={song.cover_url}
                  file_url={song.file_url}
                  onClick={() => handlePlaySong(song)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Explore;