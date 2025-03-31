import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchProfile, fetchPlaylists, createPlaylist, fetchUserSongs } from "./api";
import "./profile.css";
import { useMusicPlayer } from '../../hooks/useMusicPlayer';

import { 
  PlaylistItem, SongItem,
  HorizontalScrollContainer,
} from '../../components/MusicItems';

// Define types for our data
interface Profile {
  username: string;
  fullname: string;
  email: string;
  dob: string;
  avatar_url: string;
}

interface Playlist {
  id: number;
  name: string;
  song_count: number;
  description?: string;
  cover_url?: string;
}

interface Song {
  player_id: number;
  title: string;
  artist: string;
  duration: number;
  release_date?: string;
  file_url: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" });
  const [showPlaylistForm, setShowPlaylistForm] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const { playMusic } = useMusicPlayer();
  

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile(token!);
        setProfile(profileData.data);
        console.log(profileData.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    const loadPlaylists = async () => {
      try {
        const playlistsData = await fetchPlaylists(token!);
        
        // Transform the API data to match your interface
        const transformedPlaylists = (playlistsData.data.playlists || []).map(playlist => ({
          id: playlist.playlist_id || playlist.id,
          name: playlist.name,
          song_count: playlist.song_count || 0,
          description: playlist.description,
          cover_url: playlist.cover_url
        }));
        
        setPlaylists(transformedPlaylists);
        console.log('Transformed playlists:', transformedPlaylists);
      } catch (error) {
        console.error("Error fetching playlists:", error);
      }
    };

    const loadUserSongs = async () => {
      try {
        const songsData = await fetchUserSongs(token!);
        setUserSongs(songsData.data || []);
        console.log(songsData.data);
      } catch (error) {
        console.error("Error fetching user songs:", error);
      }
    };

    loadProfile();
    loadPlaylists();
    loadUserSongs();
  }, [token]);

  const handleCreatePlaylist = async () => {
    try {
      if (!newPlaylist.name.trim()) {
        alert("Please enter a playlist name");
        return;
      }
  
      const newPlaylistData = await createPlaylist(
        token!,
        newPlaylist.name,
        newPlaylist.description
      );
      
      // Format the new playlist to match your Playlist interface
      const formattedNewPlaylist: Playlist = {
        id: newPlaylistData.data.playlist_id,
        name: newPlaylist.name,
        description: newPlaylist.description,
        song_count: 0 // New playlist has 0 songs initially
      };
      
      // Add the new playlist to the list
      setPlaylists([...playlists, formattedNewPlaylist]);
      
      // Reset the form input fields
      setNewPlaylist({ name: "", description: "" });
      
      // Hide the form
      setShowPlaylistForm(false);
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

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

  const handlePlaylistClick = (playlistId: number) => {
    console.log("Playlist clicked:", playlistId);
    navigate(`/playlist/${playlistId}`);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
      {/* Always show the avatar container, use fallback for the image source */}
      <div className="profile-avatar">
        <img 
          src={"../../../public/assets/avatar/defaut.jpg"} 
          alt="Profile" 
        />
      </div>
      
      <div className="profile-details">
        <h1>{profile?.fullname || "Full Name"}</h1>
        <div className="profile-info-grid">
          <div className="info-item">
            <label>Username:</label>
            <span>{profile?.username || "N/A"}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{profile?.email || "N/A"}</span>
          </div>
          <div className="info-item">
            <label>Date of Birth:</label>
            <span>{profile?.dob || "N/A"}</span>
          </div>
        </div>
      </div>
    </div>

    <section className="playlists-section">
      <div className="section-header">
        <h2>Your Playlists</h2>
        <button 
          className="create-button"
          onClick={() => setShowPlaylistForm(!showPlaylistForm)}
        >
          <span style={{ fontSize: "1.5em" }}>+</span> {showPlaylistForm ? "Cancel" : "New Playlist"}
        </button>
      </div>
      
      {showPlaylistForm && (
        <div className="playlist-form">
          <input
            type="text"
            placeholder="Playlist Name"
            value={newPlaylist.name}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newPlaylist.description}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
          />
          <button onClick={handleCreatePlaylist} className="submit-button">Create</button>
        </div>
      )}

      {/* Conditional rendering for playlist content */}
      {playlists.length === 0 ? (
        <div className="no-content-message">You haven't created any playlists yet.</div>
      ) : (
        <HorizontalScrollContainer>
        {playlists.map((playlist) => (
          <PlaylistItem
          key={playlist.id}
          playlist_id={playlist.id}
          name={playlist.name}
          song_count={playlist.song_count}
          onClick={() => handlePlaylistClick(playlist.id)}
          />
        ))}
      </HorizontalScrollContainer>
      )}
    </section>

    <section className="songs-section">
      <div className="section-header">
        <h2>Your Songs</h2>
        <button 
          className="create-button"
          onClick={() => navigate('/upload')}
        >
          <span style={{ fontSize: "1.5em" }}>+</span> Upload Song
        </button>
      </div>
      
      {/* Conditional rendering for songs content */}
      {userSongs.length === 0 ? (
        <div className="no-content-message">You haven't uploaded any songs yet.</div>
      ) : (
        <div className="song-grid">
          {userSongs.map((song) => (
            <SongItem
              key={song.player_id}
              player_id={song.player_id}
              title={song.title}
              artist={song.artist}
              duration={song.duration}
              file_url={song.file_url}
              onClick={() => handlePlaySong(song)}
            />
          ))}
        </div>
      )}
    </section>
    </div>
  );
};

export default Profile;