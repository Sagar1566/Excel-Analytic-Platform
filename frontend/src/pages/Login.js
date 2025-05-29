import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();
  const { theme } = useTheme();

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/landingpage');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let userData;
      if (isAdminLogin) {
        if (formData.email === 'admin@example.com' && formData.password === 'adminPass123') {
          userData = {
            token: 'fake-admin-token',
            user: { _id: 'admin001', name: 'Admin User', email: formData.email, role: 'admin' },
          };
          await authLogin(userData);
          toast.success('Admin login successful!');
          navigate('/admin');
        } else {
          toast.error('Invalid admin credentials. Use the main login for backend-verified admins.');
        }
      } else {
        const data = await login(formData);
        userData = { token: data.token, user: data.user };
        await authLogin(userData);
        toast.success('Login successful!');
        navigate(data.user.role === 'admin' ? '/admin' : '/landingpage');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginType = () => {
    setIsAdminLogin(!isAdminLogin);
    setFormData({ email: '', password: '' });
  };
  
  const currentStyles = styles(theme, isAdminLogin);

  return (
    <div style={currentStyles.pageContainer}>
      <div style={currentStyles.loginWrapper}>
        <div style={currentStyles.decorativePanel}>
          <h2 style={currentStyles.decorativeTitle}>Welcome Back!</h2>
          <p style={currentStyles.decorativeText}>
            {isAdminLogin 
              ? 'Access the admin control panel.' 
              : 'Sign in to continue to your dashboard.'
            }
          </p>
          <div style={currentStyles.decorativeShape1}></div>
          <div style={currentStyles.decorativeShape2}></div>
        </div>
        <div style={currentStyles.formPanel}>
          <h1 style={currentStyles.heading}>{isAdminLogin ? 'Admin Portal' : 'User Login'}</h1>
          <form onSubmit={handleSubmit} style={currentStyles.form}>
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
                placeholder={isAdminLogin ? "admin@example.com" : "you@example.com"}
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
                placeholder={isAdminLogin ? "Enter admin password" : "Enter your password"}
              />
            </div>
            <button type="submit" disabled={loading} style={currentStyles.button}>
              {loading ? 'Authenticating...' : (isAdminLogin ? 'Login as Admin' : 'Login')}
            </button>
          </form>
          <div style={currentStyles.toggleContainer}>
            <button onClick={toggleLoginType} style={currentStyles.toggleButton}>
              Switch to {isAdminLogin ? 'User' : 'Admin'} Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = (theme, isAdminLogin) => ({
  pageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 70px)',
    padding: '2rem',
    backgroundColor: 'var(--background-primary)',
    transition: 'background-color 0.3s ease',
  },
  loginWrapper: {
    display: 'flex',
    maxWidth: '900px',
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
    backgroundColor: theme === 'dark' ? 'var(--dark-accent-purple)' : 'var(--accent-primary)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    position: 'relative',
    backgroundImage: theme === 'dark' 
      ? 'linear-gradient(45deg, var(--dark-accent-purple), var(--dark-accent-pink), var(--dark-accent-blue))' 
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
    top: '10%',
    left: '10%',
    width: '50px',
    height: '50px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '50%',
    opacity: theme === 'dark' ? 0.7 : 0.3,
  },
  decorativeShape2: {
    position: 'absolute',
    bottom: '15%',
    right: '15%',
    width: '80px',
    height: '80px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    transform: 'rotate(45deg)',
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
        borderColor: theme === 'dark' ? 'var(--dark-accent-pink)' : 'var(--accent-primary)',
        boxShadow: `0 0 0 3px ${theme === 'dark' ? 'rgba(255, 105, 180, 0.3)' : 'rgba(0, 123, 255, 0.2)'}`,
    }
  },
  button: {
    padding: '0.9rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--button-text)',
    backgroundColor: isAdminLogin 
      ? (theme === 'dark' ? 'var(--dark-accent-pink)' : '#c82333') 
      : 'var(--button-background)',
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
  toggleContainer: {
    textAlign: 'center',
    marginTop: '1.5rem',
  },
  toggleButton: {
    padding: '0.6rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--input-border)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease, color 0.3s ease',
    '&:hover': {
        backgroundColor: 'var(--background-secondary)',
        color: 'var(--text-primary)',
    }
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
});

export default Login; 