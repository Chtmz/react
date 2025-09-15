import axios from 'axios';

// Configure axios defaults for production
const setupAxios = () => {
  // Set base URL based on environment
  const baseURL = process.env.REACT_APP_API_URL || 'https://new-production-351f.up.railway.app';
  
  axios.defaults.baseURL = baseURL;
  axios.defaults.timeout = 30000; // 30 seconds
  
  // Add request interceptor to include auth token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

export default setupAxios;