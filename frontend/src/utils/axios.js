import axios from 'axios';
import { toast } from 'react-toastify';

const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const instance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000, // 30 second timeout
    withCredentials: true
});

// Add request interceptor
instance.interceptors.request.use(
    (config) => {
        // For file uploads, remove Content-Type to let browser set it
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        console.error('Response Error:', error);
        
        // Handle network errors
        if (!error.response) {
            toast.error('Network error. Please check your connection.');
            return Promise.reject(error);
        }

        // Handle specific status codes
        switch (error.response.status) {
            case 400:
                toast.error(error.response.data.message || 'Invalid request');
                break;
            case 404:
                toast.error('Resource not found');
                break;
            case 413:
                toast.error('File is too large');
                break;
            case 415:
                toast.error('Unsupported file type');
                break;
            case 500:
                toast.error('Server error. Please try again later.');
                break;
            default:
                toast.error('An error occurred. Please try again.');
        }

        return Promise.reject(error);
    }
);

// Health check function
export const checkServerHealth = async () => {
    try {
        await instance.get('/health');
        console.log('Server is healthy');
        return true;
    } catch (error) {
        console.error('Server health check failed:', error);
        toast.error('Unable to connect to server');
        return false;
    }
};

export default instance;