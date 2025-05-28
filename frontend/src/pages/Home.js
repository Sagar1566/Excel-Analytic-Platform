import React from 'react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      {user ? (
        <h1 style={styles.heading}>Welcome, {user.name}</h1>
      ) : (
        <div>
          <h1 style={styles.heading}>Welcome to MERN Auth App</h1>
          <p style={styles.text}>
            This is a simple authentication application built with the MERN stack.
            Please login or register to continue.
          </p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    textAlign: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    color: '#333',
  },
  text: {
    fontSize: '1.2rem',
    color: '#666',
    lineHeight: '1.6',
  },
};

export default Home; 