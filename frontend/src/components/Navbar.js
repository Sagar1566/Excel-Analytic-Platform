import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const handleUpdateProfile = () => {
    // TODO: Implement update profile functionality
    navigate('/update-profile');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.brand}>MERN Auth</Link>
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Home</Link>
          {!user ? (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" style={styles.link}>Admin Dashboard</Link>
              ) : (
                <Link to="/landingpage" style={styles.link}>Dashboard</Link>
              )}
              <div style={styles.profileContainer} ref={dropdownRef}>
                <button 
                  style={styles.profileButton} 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <i className="fas fa-user-circle" style={styles.profileIcon}></i>
                  <span style={styles.userName}>{user.name}</span>
                  <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={styles.chevron}></i>
                </button>
                {isDropdownOpen && (
                  <div style={styles.dropdown}>
                    <button onClick={handleUpdateProfile} style={styles.dropdownItem}>
                      <i className="fas fa-user-edit" style={styles.dropdownIcon}></i>
                      Update Profile
                    </button>
                    <button onClick={handleLogout} style={styles.dropdownItem}>
                      <i className="fas fa-sign-out-alt" style={styles.dropdownIcon}></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#333',
    padding: '1rem 0',
    marginBottom: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: '#fff',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  profileIcon: {
    fontSize: '1.5rem',
  },
  userName: {
    fontSize: '1rem',
  },
  chevron: {
    fontSize: '0.8rem',
    marginLeft: '0.25rem',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginTop: '0.5rem',
    minWidth: '200px',
    zIndex: 1000,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#333',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  dropdownIcon: {
    width: '20px',
    color: '#666',
  },
};

export default Navbar; 