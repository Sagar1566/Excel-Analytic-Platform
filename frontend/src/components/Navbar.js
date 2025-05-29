import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsDropdownOpen(false);
  };

  const handleUpdateProfile = () => {
    navigate('/update-profile');
    setIsDropdownOpen(false);
  };

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

  const navStyle = {
    ...styles.nav,
    backgroundColor: 'var(--navbar-background)',
    color: 'var(--navbar-text)',
    borderBottom: `1px solid ${theme === 'dark' ? 'var(--dark-accent-purple)' : 'var(--card-border)'}`
  };
  const linkStyle = { ...styles.link, color: 'var(--navbar-text)' };
  const brandStyle = { ...styles.brand, color: 'var(--navbar-text)' };
  const profileButtonStyle = { ...styles.profileButton, color: 'var(--navbar-text)' };
  const dropdownItemStyle = { ...styles.dropdownItem, color: 'var(--text-primary)' };
  const themeToggleButtonStyle = { ...styles.themeToggleButton, color: 'var(--navbar-text)' };

  return (
    <nav style={navStyle}>
      <div style={styles.container}>
        <Link to="/" style={brandStyle}>Xlens</Link>
        <div style={styles.linksContainer}>
          <Link to="/" style={linkStyle} className="nav-link-hover">Home</Link>
          {!user ? (
            <>
              <Link to="/login" style={linkStyle} className="nav-link-hover">Login</Link>
              <Link to="/register" style={linkStyle} className="nav-link-hover">Register</Link>
            </>
          ) : (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" style={linkStyle} className="nav-link-hover">Admin</Link>
              ) : (
                <Link to="/landingpage" style={linkStyle} className="nav-link-hover">Dashboard</Link>
              )}
              <div style={styles.profileContainer} ref={dropdownRef}>
                <button style={profileButtonStyle} onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="nav-link-hover">
                  <i className="fas fa-user-circle" style={styles.profileIcon}></i>
                  <span style={styles.userName}>{user.name}</span>
                  <i className={`fas fa-chevron-${isDropdownOpen ? 'up' : 'down'}`} style={styles.chevron}></i>
                </button>
                {isDropdownOpen && (
                  <div style={styles.dropdown}>
                    <button onClick={handleUpdateProfile} style={dropdownItemStyle} className="dropdown-item-hover">
                      <i className="fas fa-user-edit" style={styles.dropdownIcon}></i>
                      Update Profile
                    </button>
                    <button onClick={handleLogout} style={dropdownItemStyle} className="dropdown-item-hover">
                      <i className="fas fa-sign-out-alt" style={styles.dropdownIcon}></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button onClick={toggleTheme} style={themeToggleButtonStyle} className="theme-toggle-hover" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <i className="fas fa-moon"></i> : <i className="fas fa-sun"></i>}
          </button>
        </div>
      </div>
    </nav>
  );
};

const dynamicStyles = `
  .nav-link-hover:hover {
    background-color: var(--background-secondary);
    opacity: 0.8;
  }
  .dropdown-item-hover:hover {
    background-color: var(--background-secondary);
  }
  .theme-toggle-hover:hover {
    opacity: 0.7;
  }
`;

const ModernNavbarGlobalStyles = () => <style>{dynamicStyles}</style>;

const styles = {
  nav: {
    padding: '0.8rem 0',
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
    position: 'sticky',
    top: 0,
    zIndex: 1020,
    width: '100%',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    textDecoration: 'none',
    fontSize: '1.7rem',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  linksContainer: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out',
    fontWeight: '500',
    fontSize: '0.95rem'
  },
  profileContainer: {
    position: 'relative',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.6rem 0.8rem',
    borderRadius: '6px',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, opacity 0.2s ease-in-out',
    fontWeight: '500',
  },
  profileIcon: {
    fontSize: '1.3rem',
  },
  userName: {
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  chevron: {
    fontSize: '0.7rem',
    marginLeft: '0.3rem',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    backgroundColor: 'var(--card-background)',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    minWidth: '220px',
    zIndex: 1000,
    border: '1px solid var(--card-border)',
    padding: '0.5rem 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.8rem 1.2rem',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  },
  dropdownIcon: {
    width: '18px',
    color: 'var(--text-secondary)',
    marginRight: '0.25rem'
  },
  themeToggleButton: {
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1.3rem',
    padding: '0.5rem 0.6rem',
    lineHeight: '1',
    transition: 'color 0.2s ease-in-out, opacity 0.2s ease-in-out, background-color 0.2s ease-in-out',
  },
};

export default Navbar; 