import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password
        }),
      });
      
      // Handle API response
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Store user ID in localStorage for persistence
        localStorage.setItem('userId', data.data.user_id);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Cập nhật trạng thái đăng nhập
        onLogin();
        
        navigate('/home');
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to Musify</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="icon-box">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 9C7.7625 9 6.70312 8.55938 5.82188 7.67813C4.94063 6.79688 4.5 5.7375 4.5 4.5C4.5 3.2625 4.94063 2.20312 5.82188 1.32188C6.70312 0.440625 7.7625 0 9 0C10.2375 0 11.2969 0.440625 12.1781 1.32188C13.0594 2.20312 13.5 3.2625 13.5 4.5C13.5 5.7375 13.0594 6.79688 12.1781 7.67813C11.2969 8.55938 10.2375 9 9 9ZM0 18V14.85C0 14.2125 0.164062 13.6266 0.492188 13.0922C0.820312 12.5578 1.25625 12.15 1.8 11.8688C2.9625 11.2875 4.14375 10.8516 5.34375 10.5609C6.54375 10.2703 7.7625 10.125 9 10.125C10.2375 10.125 11.4563 10.2703 12.6562 10.5609C13.8562 10.8516 15.0375 11.2875 16.2 11.8688C16.7438 12.15 17.1797 12.5578 17.5078 13.0922C17.8359 13.6266 18 14.2125 18 14.85V18H0ZM2.25 15.75H15.75V14.85C15.75 14.6437 15.6984 14.4562 15.5953 14.2875C15.4922 14.1187 15.3562 13.9875 15.1875 13.8938C14.175 13.3875 13.1531 13.0078 12.1219 12.7547C11.0906 12.5016 10.05 12.375 9 12.375C7.95 12.375 6.90937 12.5016 5.87812 12.7547C4.84687 13.0078 3.825 13.3875 2.8125 13.8938C2.64375 13.9875 2.50781 14.1187 2.40469 14.2875C2.30156 14.4562 2.25 14.6437 2.25 14.85V15.75ZM9 6.75C9.61875 6.75 10.1484 6.52969 10.5891 6.08906C11.0297 5.64844 11.25 5.11875 11.25 4.5C11.25 3.88125 11.0297 3.35156 10.5891 2.91094C10.1484 2.47031 9.61875 2.25 9 2.25C8.38125 2.25 7.85156 2.47031 7.41094 2.91094C6.97031 3.35156 6.75 3.88125 6.75 4.5C6.75 5.11875 6.97031 5.64844 7.41094 6.08906C7.85156 6.52969 8.38125 6.75 9 6.75Z" fill="white"/>
              </svg>
            </div>
            <input
              type="text" // Changed from email to text
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Username"
            />
          </div>
          <div className="form-group">
            <div className="icon-box">
              <svg width="23" height="12" viewBox="0 0 23 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 8C5.45 8 4.97917 7.80417 4.5875 7.4125C4.19583 7.02083 4 6.55 4 6C4 5.45 4.19583 4.97917 4.5875 4.5875C4.97917 4.19583 5.45 4 6 4C6.55 4 7.02083 4.19583 7.4125 4.5875C7.80417 4.97917 8 5.45 8 6C8 6.55 7.80417 7.02083 7.4125 7.4125C7.02083 7.80417 6.55 8 6 8ZM6 12C4.33333 12 2.91667 11.4167 1.75 10.25C0.583333 9.08333 0 7.66667 0 6C0 4.33333 0.583333 2.91667 1.75 1.75C2.91667 0.583333 4.33333 0 6 0C7.11667 0 8.12917 0.275 9.0375 0.825C9.94583 1.375 10.6667 2.1 11.2 3H20L23 6L18.5 10.5L16.5 9L14.5 10.5L12.375 9H11.2C10.6667 9.9 9.94583 10.625 9.0375 11.175C8.12917 11.725 7.11667 12 6 12ZM6 10C6.93333 10 7.75417 9.71667 8.4625 9.15C9.17083 8.58333 9.64167 7.86667 9.875 7H13L14.45 8.025L16.5 6.5L18.275 7.875L20.15 6L19.15 5H9.875C9.64167 4.13333 9.17083 3.41667 8.4625 2.85C7.75417 2.28333 6.93333 2 6 2C4.9 2 3.95833 2.39167 3.175 3.175C2.39167 3.95833 2 4.9 2 6C2 7.1 2.39167 8.04167 3.175 8.825C3.95833 9.60833 4.9 10 6 10Z" fill="white"/>
              </svg>
            </div>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Password"
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
            <>
              <span className="loading-spinner"></span>
              Logging in...
            </>
          ) : 'Login'}
          </button>
        </form>
      </div>
      
      <div className="register-link">
        <p>Don't you have an account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  );
};

export default Login;