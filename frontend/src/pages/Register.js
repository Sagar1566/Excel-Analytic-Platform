import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await register(formData);
      login(data);
      toast.success('Registration successful! Welcome to Xlens!');
      navigate('/landingpage');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentStyles = styles(theme);

  return (
    <div style={currentStyles.pageContainer}>
      <div style={currentStyles.registerWrapper}>
        <div style={currentStyles.decorativePanel}>
          <h2 style={currentStyles.decorativeTitle}>Join Xlens Today!</h2>
          <p style={currentStyles.decorativeText}>
            Unlock powerful analytics and stunning visualizations. Create your account to get started.
          </p>
          <div style={currentStyles.decorativeShape1}></div>
          <div style={currentStyles.decorativeShape2}></div>
        </div>
        <div style={currentStyles.formPanel}>
          <h1 style={currentStyles.heading}>Create Your Account</h1>
          <form onSubmit={handleSubmit} style={currentStyles.form}>
            <div style={currentStyles.formGroup}>
              <label htmlFor="name" style={currentStyles.label}>Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={currentStyles.input}
                placeholder="Enter your full name"
              />
            </div>
            <div style={currentStyles.formGroup}>
              <label htmlFor="email" style={currentStyles.label}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={currentStyles.input}
                placeholder="you@example.com"
              />
            </div>
            <div style={currentStyles.formGroup}>
              <label htmlFor="password" style={currentStyles.label}>Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={currentStyles.input}
                placeholder="Create a strong password"
              />
            </div>
            <button type="submit" disabled={loading} style={currentStyles.button}>
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = (theme) => ({
  pageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '2rem',
    backgroundColor: 'var(--background-primary)',
    transition: 'background-color 0.3s ease',
  },
  registerWrapper: {
    display: 'flex',
    maxWidth: '950px',
    width: '100%',
    backgroundColor: 'var(--card-background)',
    borderRadius: '12px',
    boxShadow: theme === 'dark' 
      ? '0 10px 25px rgba(0,0,0,0.3), 0 5px 10px rgba(0,0,0,0.2)' 
      : '0 10px 25px rgba(0,0,0,0.1), 0 5px 10px rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  decorativePanel: {
    flex: 1,
    padding: '3rem 2rem',
    backgroundColor: theme === 'dark' ? 'var(--dark-accent-blue)' : 'var(--accent-secondary)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    backgroundImage: theme === 'dark' 
      ? 'linear-gradient(45deg, var(--dark-accent-blue), var(--dark-accent-pink), var(--dark-accent-purple))'
      : 'none',
    backgroundSize: theme === 'dark' ? '200% 200%' : 'auto',
    animation: theme === 'dark' ? 'gradientShift 10s ease infinite' : 'none',
  },
  decorativeTitle: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  decorativeText: {
    fontSize: '1rem',
    lineHeight: '1.6',
    maxWidth: '300px',
  },
  decorativeShape1: {
    position: 'absolute',
    top: '15%',
    right: '10%',
    width: '60px',
    height: '60px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    transform: 'rotate(-30deg)',
    opacity: theme === 'dark' ? 0.7 : 0.3,
  },
  decorativeShape2: {
    position: 'absolute',
    bottom: '10%',
    left: '15%',
    width: '70px',
    height: '70px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    opacity: theme === 'dark' ? 0.6 : 0.2,
  },
  formPanel: {
    flex: 1.5,
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '2rem',
    color: 'var(--text-primary)',
    fontSize: '1.8rem',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  input: {
    padding: '0.9rem 1rem',
    fontSize: '1rem',
    border: `1px solid var(--input-border)`,
    borderRadius: '6px',
    backgroundColor: 'var(--input-background)',
    color: 'var(--input-text)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    '&::placeholder': {
        color: 'var(--text-secondary)',
        opacity: 0.7
    },
    '&:focus': {
        borderColor: theme === 'dark' ? 'var(--dark-accent-blue)' : 'var(--accent-primary)',
        boxShadow: `0 0 0 3px ${theme === 'dark' ? 'rgba(100, 149, 237, 0.3)' : 'rgba(0, 123, 255, 0.2)'}`,
    }
  },
  button: {
    padding: '0.9rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--button-text)',
    backgroundColor: 'var(--button-background)',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.3s ease, transform 0.1s ease',
    '&:hover': {
        opacity: 0.9,
    },
    '&:active': {
        transform: 'scale(0.98)',
    },
    '&:disabled': {
        opacity: 0.7,
        cursor: 'not-allowed',
    }
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
});

export default Register; 