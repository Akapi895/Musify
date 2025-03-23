// API functions for profile page
// tested
export const fetchProfile = async (token: string) => {
  const response = await fetch('http://127.0.0.1:8000/api/profile/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }
  
  return await response.json();
};
  
  export const fetchPlaylists = async (token: string) => {
    const response = await fetch('http://127.0.0.1:8000/api/profile/playlists', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    return await response.json();
  };
  
  // tested
  export const createPlaylist = async (token: string, name: string, description: string = '') => {
    const response = await fetch('http://127.0.0.1:8000/api/profile/playlists/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        description
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create playlist');
    }
    
    return await response.json();
  };
  
  export const fetchUserSongs = async (token: string) => {
    const response = await fetch('http://127.0.0.1:8000/api/player/user/songs', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user songs');
    }
    
    return await response.json();
  };