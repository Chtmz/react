import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Data View', href: '/data', icon: '📋' },
    { name: 'Upload Files', href: '/upload', icon: '📁' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>PO Management</h2>
          <p>Welcome, {user?.name}</p>
        </div>
        
        <nav>
          <ul className="nav-menu">
            {navigation.map((item) => (
              <li key={item.name} className="nav-item">
                <Link
                  to={item.href}
                  className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ padding: '24px', marginTop: 'auto' }}>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ width: '100%' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;