import React from 'react';
import { Link } from 'react-router-dom'; // For CTA buttons
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import '@fortawesome/fontawesome-free/css/all.min.css'; // For icons

const Home = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const currentStyles = styles(theme);

  // Dynamic text based on user login state
  const welcomeMessage = user ? `Welcome back, ${user.name}!` : 'Welcome to Xlens';
  const subMessage = user 
    ? 'Ready to dive back into your data?' 
    : 'Unlock insights from your data with stunning visualizations.';

  return (
    <div style={currentStyles.pageContainer}>
      {/* Hero Section */}
      <section style={currentStyles.heroSection}>
        <div style={currentStyles.heroTextContainer}>
          <h1 style={currentStyles.heroHeadline}>{welcomeMessage}</h1>
          <p style={currentStyles.heroSubheadline}>{subMessage}</p>
          <div style={currentStyles.ctaContainer}>
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/landingpage'} style={currentStyles.ctaButtonPrimary}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" style={currentStyles.ctaButtonPrimary}>
                  Get Started Free
                </Link>
                <Link to="/login" style={currentStyles.ctaButtonSecondary}>
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
        <div style={currentStyles.heroVisualPlaceholder}>
          {/* You can replace this div with an <img /> or a more complex visual component */}
          <i className="fas fa-chart-pie" style={currentStyles.placeholderIcon}></i>
          <p style={currentStyles.placeholderText}>Engaging Visual Here</p>
        </div>
      </section>

      {/* Key Features Section (Optional) */}
      {!user && (
        <section style={currentStyles.featuresSection}>
          <h2 style={currentStyles.sectionHeadline}>Why Choose Xlens?</h2>
          <div style={currentStyles.featuresGrid}>
            <div style={currentStyles.featureCard}>
              <i className="fas fa-lightbulb" style={currentStyles.featureIcon}></i>
              <h3 style={currentStyles.featureTitle}>Instant Insights</h3>
              <p style={currentStyles.featureText}>Turn complex data into clear, actionable insights in seconds.</p>
            </div>
            <div style={currentStyles.featureCard}>
              <i className="fas fa-palette" style={currentStyles.featureIcon}></i>
              <h3 style={currentStyles.featureTitle}>Beautiful Visuals</h3>
              <p style={currentStyles.featureText}>Create stunning, customizable charts that bring your data to life.</p>
            </div>
            <div style={currentStyles.featureCard}>
              <i className="fas fa-cogs" style={currentStyles.featureIcon}></i>
              <h3 style={currentStyles.featureTitle}>Easy to Use</h3>
              <p style={currentStyles.featureText}>Intuitive interface designed for both beginners and experts.</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

const styles = (theme) => ({
  pageContainer: {
    backgroundColor: 'var(--background-primary)',
    color: 'var(--text-primary)',
    minHeight: 'calc(100vh - 70px)', // Assuming navbar height is approx 70px
    padding: '0 2rem', // Horizontal padding
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  // Hero Section
  heroSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4rem 0',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '2rem',
    flexWrap: 'wrap', // Allow wrapping on smaller screens
  },
  heroTextContainer: {
    flex: 1,
    minWidth: '300px',
    textAlign: 'left',
  },
  heroHeadline: {
    fontSize: '3.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '1.5rem',
    lineHeight: '1.2',
  },
  heroSubheadline: {
    fontSize: '1.3rem',
    color: 'var(--text-secondary)',
    marginBottom: '2.5rem',
    lineHeight: '1.7',
    maxWidth: '500px',
  },
  ctaContainer: {
    display: 'flex',
    gap: '1rem',
  },
  ctaButtonPrimary: {
    padding: '0.9rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: theme === 'dark' ? 'var(--dark-bg-purple)' : '#fff', // Ensure good contrast
    backgroundColor: theme === 'dark' ? 'var(--dark-accent-pink)' : 'var(--accent-primary)',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
    '&:hover': {
      opacity: 0.9,
      transform: 'translateY(-2px)',
    },
  },
  ctaButtonSecondary: {
    padding: '0.9rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: `2px solid ${theme === 'dark' ? 'var(--dark-accent-blue)' : 'var(--accent-primary)'}`,
    borderRadius: '8px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'background-color 0.3s ease, color 0.3s ease, transform 0.1s ease',
    '&:hover': {
      backgroundColor: theme === 'dark' ? 'var(--dark-accent-blue)' : 'var(--accent-primary)',
      color: theme === 'dark' ? '#fff' : '#fff',
      transform: 'translateY(-2px)',
    },
  },
  heroVisualPlaceholder: {
    flex: 1,
    minWidth: '300px',
    height: '400px',
    backgroundColor: 'var(--background-secondary)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    border: `1px dashed var(--card-border)`,
    // Example for dark mode specific visual style
    backgroundImage: theme === 'dark' ? 'linear-gradient(135deg, var(--dark-accent-purple), var(--dark-accent-blue))' : 'none',
  },
  placeholderIcon: {
    fontSize: '5rem',
    color: theme === 'dark' ? 'var(--dark-accent-pink)' : 'var(--accent-primary)',
    marginBottom: '1rem',
  },
  placeholderText: {
    fontSize: '1.2rem',
    color: 'var(--text-secondary)',
  },
  // Features Section
  featuresSection: {
    padding: '4rem 0',
    textAlign: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionHeadline: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '3rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    backgroundColor: 'var(--card-background)',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
    }
  },
  featureIcon: {
    fontSize: '3rem',
    color: theme === 'dark' ? 'var(--dark-accent-pink)' : 'var(--accent-primary)',
    marginBottom: '1.5rem',
  },
  featureTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '0.75rem',
  },
  featureText: {
    fontSize: '1rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
});

export default Home; 