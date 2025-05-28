import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: authLogin, user } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/landingpage');
      }
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAdminLogin) {
        // Check admin credentials
        if (formData.email === 'admin@gmail.com' && formData.password === 'admin@123') {
          const adminData = {
            token: 'admin-token',
            user: {
              _id: 'admin-id',
              name: 'Admin User',
              email: formData.email,
              role: 'admin'
            }
          };
          await authLogin(adminData);
          toast.success('Admin login successful!');
          navigate('/admin');
        } else {
          toast.error('Invalid admin credentials');
        }
      } else {
        // Regular user login
        const data = await login(formData);
        const userData = {
          token: data.token,
          user: {
            ...data.user,
            role: 'user'
          }
        };
        await authLogin(userData);
        toast.success('Login successful!');
        navigate('/landingpage');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleLoginType = () => {
    setIsAdminLogin(!isAdminLogin);
    setFormData({ email: '', password: '' }); // Clear form when switching
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>{isAdminLogin ? 'Admin Login' : 'User Login'}</h1>
      <div style={styles.toggleContainer}>
        <button
          onClick={toggleLoginType}
          style={styles.toggleButton}
        >
          Switch to {isAdminLogin ? 'User' : 'Admin'} Login
        </button>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder={isAdminLogin ? "admin@gmail.com" : "Enter your email"}
          />
        </div>
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder={isAdminLogin ? "admin@123" : "Enter your password"}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            backgroundColor: isAdminLogin ? '#dc3545' : '#007bff'
          }}
        >
          {loading ? 'Logging in...' : (isAdminLogin ? 'Admin Login' : 'User Login')}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '2rem',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    color: '#333',
  },
  toggleContainer: {
    textAlign: 'center',
    marginBottom: '1.5rem',
  },
  toggleButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    backgroundColor: '#6c757d',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '1rem',
    color: '#333',
  },
  input: {
    padding: '0.5rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginTop: '1rem',
    transition: 'background-color 0.3s',
  },
};

export default Login; 