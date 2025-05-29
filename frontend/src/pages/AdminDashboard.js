import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllUsers } from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to fetch users.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      // In a real application, you would make an API call here
      const updatedUsers = users.map(user => 
        user._id === userId ? { ...user, isActive: !isActive } : user
      );
      setUsers(updatedUsers);
      toast.success('User status updated successfully');
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Admin Dashboard</h1>
        <p style={styles.welcomeText}>Welcome back, {user?.name}</p>
      </div>

      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3>Total Users</h3>
          <p style={styles.statNumber}>{users.length}</p>
        </div>
      </div>

      <div style={styles.userListContainer}>
        <h2 style={styles.subHeading}>User Management</h2>
        <div style={styles.userList}>
          <div style={styles.userHeader}>
            <span style={styles.columnHeader}>Name</span>
            <span style={styles.columnHeader}>Email</span>
            <span style={styles.columnHeader}>Status</span>
            <span style={styles.columnHeader}>Actions</span>
          </div>
          {users.map(user => (
            <div key={user._id} style={styles.userRow}>
              <span style={styles.userName}>{user.name}</span>
              <span style={styles.userEmail}>{user.email}</span>
              <span style={styles.userStatus}>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: user.isActive ? '#28a745' : '#dc3545'
                }}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </span>
              <span style={styles.userActions}>
                <button
                  onClick={() => handleUserStatusChange(user._id, user.isActive)}
                  style={styles.actionButton}
                >
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  heading: {
    fontSize: '2rem',
    color: '#333',
    marginBottom: '0.5rem',
  },
  welcomeText: {
    fontSize: '1.1rem',
    color: '#666',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#007bff',
    marginTop: '0.5rem',
  },
  userListContainer: {
    backgroundColor: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subHeading: {
    fontSize: '1.5rem',
    color: '#333',
    marginBottom: '1.5rem',
  },
  userList: {
    width: '100%',
  },
  userHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
  },
  columnHeader: {
    color: '#495057',
  },
  userRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 2fr 1fr 1fr',
    padding: '1rem',
    borderBottom: '1px solid #dee2e6',
    alignItems: 'center',
  },
  userName: {
    fontWeight: '500',
  },
  userEmail: {
    color: '#666',
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    color: '#fff',
    fontSize: '0.875rem',
  },
  actionButton: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#666',
  },
  error: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#dc3545',
  },
};

export default AdminDashboard;
