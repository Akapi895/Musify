import { useState, useEffect } from 'react';
import { MusicProvider } from "./context/MusicContext";
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile/profile';
import Home from './pages/Home/home';
import Playlists from './pages/Playlists/playlists';
import Favourites from './pages/Favourites/favourites';
import MyPlayers from './pages/MyPlayers/myplayers';
import Sidebar from './components/Sidebar/sidebar';
import MusicBar from './components/MusicBar/musicbar';
import SinglePlaylist from './pages/SinglePlaylist/singleplaylist';
import SinglePlayer from './pages/SinglePlayer/singleplayer';
import Explore from './pages/Explore/explore';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import Upload from './pages/Upload/upload';
import './App.css';

function App() {
  // Always start with isAuthenticated set to false
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // On initial load, check if we're in development and clear auth state
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('Development mode detected - clearing authentication state');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setIsAuthenticated(false);
    } else {
      // Only in production, check local storage
      setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
    }

    // Add a timeout to ensure the loading state is visible briefly
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Keep the rest of your auth check logic for when user is actually authenticated
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          const response = await fetch('http://127.0.0.1:8000/api/user_id', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
          
          if (!response.ok) {
            console.warn('Auth check failed, but not logging out automatically');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
  
    if (isAuthenticated) {
      checkAuthStatus();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = async () => {
    try {
      await fetch('http://127.0.0.1:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
    console.log('isAuthenticated:', isAuthenticated);
  };

  // Show loading screen while initializing
  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return (
    <MusicProvider>
      <Router>
        <div className="app">
          {/* Nếu đăng nhập, hiển thị sidebar */}
          {isAuthenticated && <Sidebar onLogout={handleLogout} />}
          
          <div className={`content ${isAuthenticated ? 'content-authenticated' : ''}`}>
            <Routes>
              {/* Đăng nhập / Đăng ký */}
              <Route 
                path="/login" 
                element={
                  isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />
                }
              />
              <Route 
                path="/register" 
                element={
                  isAuthenticated ? <Navigate to="/home" /> : <Register />
                }
              />

              {/* Các trang yêu cầu đăng nhập */}
              <Route 
                path="/home" 
                element={
                  isAuthenticated ? <Home /> : <Navigate to="/login" />
                }
              />
              <Route 
                path="/profile" 
                element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
              />
              <Route 
                path="/playlist/:playlistId" 
                element={isAuthenticated ? <SinglePlaylist /> : <Navigate to="/login" />}
              />
              <Route 
                path="/player/:playerId" 
                element={isAuthenticated ? <SinglePlayer /> : <Navigate to="/login" />}
              />
              <Route 
                path="/myplayers" 
                element={isAuthenticated ? <MyPlayers /> : <Navigate to="/login" />}
              />
              <Route 
                path="/explore" 
                element={isAuthenticated ? <Explore /> : <Navigate to="/login" />}
              />
              <Route 
                path="/favourites" 
                element={isAuthenticated ? <Favourites /> : <Navigate to="/login" />}
              />
              <Route 
                path="/playlists" 
                element={isAuthenticated ? <Playlists /> : <Navigate to="/login" />}
              />
              <Route 
                path="/upload" 
                element={isAuthenticated ? <Upload /> : <Navigate to="/login" />}
              />
              {/* Trang gốc / */}
              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
              />
            </Routes>
          </div>
          <MusicBar isAuthenticated={isAuthenticated} />
          {/* {isAuthenticated && <Sidebar onLogout={handleLogout} />} */}
        </div>
      </Router>      
    </MusicProvider>

  );
}

export default App;
