import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Profile from './pages/Profile/profile';
import Home from './pages/Home/home';
import Playlists from './pages/Playlists/playlists';
import Favourites from './pages/Favourites/favourites';
import MyPlayers from './pages/MyPlayers/myplayers';
import Sidebar from './components/Sidebar/sidebar';
import SinglePlaylist from './pages/SinglePlaylist/singleplaylist';
import SinglePlayer from './pages/SinglePlayer/singleplayer';
import Login from './pages/Login/login';
import Register from './pages/Register/register';
import Upload from './pages/Upload/upload';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Only attempt to check auth if token exists
        if (token) {
          const response = await fetch('http://127.0.0.1:8000/api/user_id', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
          });
          
          // Don't automatically logout on response error, just log it
          if (!response.ok) {
            console.warn('Auth check failed, but not logging out automatically');
            // Do NOT call handleLogout() here
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Do NOT logout on error
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
      localStorage.removeItem('userId');
    }
    console.log('isAuthenticated:', isAuthenticated);
  };

  return (
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
      </div>
    </Router>
  );
}

export default App;
