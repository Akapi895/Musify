import React from 'react';
import { useNavigate } from 'react-router-dom';
import './sidebar.css';
import axios from 'axios';

// Simple inline icon components
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

const MusicNoteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>;

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;

const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;

const PlaylistIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;

interface SidebarProps {
  activePage?: string;
  onLogout?: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      // Call the logout API (in both cases)
      await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // If onLogout prop exists, call it
      if (onLogout) {
        onLogout();
      }
      
      // Clear authentication tokens (in both cases)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      // Always navigate to login
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Even if API call fails, still clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      
      if (onLogout) {
        onLogout();
      }
      
      navigate('/login');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="app-name">Musify</h2>
      </div>

      <div className="sidebar-menu">
        <button 
          className={`sidebar-item ${activePage === 'home' ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <HomeIcon />
          <span>Home</span>
        </button>

        <button 
          className={`sidebar-item ${activePage === 'players' ? 'active' : ''}`}
          onClick={() => navigate('/players')}
        >
          <MusicNoteIcon />
          <span>My Players</span>
        </button>

        <button 
          className={`sidebar-item ${activePage === 'favorites' ? 'active' : ''}`}
          onClick={() => navigate('/favorites')}
        >
          <HeartIcon />
          <span>Favorites</span>
        </button>

        <button 
          className={`sidebar-item ${activePage === 'playlists' ? 'active' : ''}`}
          onClick={() => navigate('/playlists')}
        >
          <PlaylistIcon />
          <span>Playlists</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <button 
          className={`sidebar-item ${activePage === 'profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <UserIcon />
          <span>Profile</span>
        </button>
        
        <button 
          className="sidebar-item logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;