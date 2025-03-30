import axios from 'axios';

// Get API URL from environment or use default
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default configs
const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
axiosClient.interceptors.request.use(
  async (config) => {
    // You can add auth tokens or other headers here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // You can handle specific error statuses here
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Handle unauthorized error
      // For example, redirect to login or refresh token
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient; 