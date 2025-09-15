import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import setupAxios from './utils/axiosConfig';

setupAxios();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);