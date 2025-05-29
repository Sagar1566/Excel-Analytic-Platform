import React from 'react';
import { useTheme } from '../context/ThemeContext'; // To use theme variables for styling
import '@fortawesome/fontawesome-free/css/all.min.css'; // For social icons

const Footer = () => {
  const { theme } = useTheme();

  const currentYear = new Date().getFullYear();

  // Define styles as a function of theme, similar to other components
  const footerStyles = {
    container: {
      backgroundColor: 'var(--navbar-background)', // Use navbar background or a specific footer background
      color: 'var(--text-secondary)',
      padding: '2rem 1rem',
      textAlign: 'center',
      borderTop: `1px solid ${theme === 'dark' ? 'var(--dark-accent-purple)' : 'var(--card-border)'}`,
      marginTop: 'auto', // Pushes footer to bottom if main content is short
    },
    content: {
      maxWidth: '800px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
    },
    name: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: 'var(--text-primary)',
      margin: 0,
    },
    tagline: {
      fontSize: '0.9rem',
      margin: '0 0 1rem 0',
    },
    linksContainer: {
      display: 'flex',
      gap: '1.5rem',
      marginBottom: '1rem',
    },
    socialLink: {
      color: 'var(--text-secondary)',
      fontSize: '1.5rem',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
    },
    // Hover effect needs to be done via CSS classes or more complex inline style handling
    // For simplicity, direct hover state not in inline style here.
    aboutSection: {
      maxWidth: '600px',
      fontSize: '0.85rem',
      lineHeight: '1.6',
    },
    copyright: {
      fontSize: '0.8rem',
      marginTop: '1rem',
      color: 'var(--text-secondary)',
    },
  };

  // Placeholder links - replace with your actual URLs
  const portfolioLink = "#"; // Replace with your portfolio URL
  const instagramLink = "#"; // Replace with your Instagram URL
  const linkedinLink = "#"; // Replace with your LinkedIn URL

  return (
    <footer style={footerStyles.container}>
      <div style={footerStyles.content}>
        <div>
          <p style={footerStyles.name}>Sagar Gajbhar</p>
          <p style={footerStyles.tagline}>Web Developer | Tech Enthusiast</p> { /* Optional tagline */}
        </div>
        
        <div style={footerStyles.linksContainer}>
          <a href={portfolioLink} target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink} title="Portfolio">
            <i className="fas fa-briefcase"></i>
          </a>
          <a href={linkedinLink} target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink} title="LinkedIn">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href={instagramLink} target="_blank" rel="noopener noreferrer" style={footerStyles.socialLink} title="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          {/* Add other social links here if needed */}
        </div>

        <div style={footerStyles.aboutSection}>
          <p><strong>About Me:</strong> I am a passionate developer focused on creating modern and user-friendly web applications. I enjoy exploring new technologies and continuously improving my skills. Let's connect!</p>
          {/* You can expand this section or link to a separate about page */}
        </div>

        <p style={footerStyles.copyright}>
          &copy; {currentYear} Xlens. All rights reserved. Made with <i className="fas fa-heart" style={{color: 'var(--dark-accent-pink)'}}></i> by Sagar Gajbhar.
        </p>
      </div>
    </footer>
  );
};

export default Footer; 