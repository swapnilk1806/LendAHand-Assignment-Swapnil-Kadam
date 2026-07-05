import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../slices/authSlice';
import { fetchNotifications } from '../slices/notificationSlice';
import type{ RootState, AppDispatch } from '../store';
import { styles } from '../styles';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { unread } = useSelector((state: RootState) => state.notifications);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) dispatch(fetchNotifications());
  }, [dispatch, user]);

  const menu = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Employees', path: '/employees', admin: true },
    { name: 'Tasks', path: '/tasks' },
    { name: 'Notifications', path: '/notifications' },
    { name: 'Reports', path: '/reports', admin: true },
  ];

  return (
    <div style={styles.layout}>
      <div style={styles.sidebar}>
        <h2 style={styles.logo}>📋 Task Manager</h2>
        <ul style={styles.menu}>
          {menu.map((item) => {
            if (item.admin && user?.role !== 'admin') return null;
            return (
              <li key={item.path} style={{ ...styles.menuItem, background: location.pathname === item.path ? '#374151' : 'transparent' }}>
                <Link to={item.path} style={styles.menuLink}>
                  {item.name}
                  {item.name === 'Notifications' && unread > 0 && (
                    <span style={styles.badge}>{unread}</span>
                  )}
                </Link>
              </li>
            );
          })}
          <li style={styles.menuItem}>
            <button onClick={() => { dispatch(logout()); navigate('/login'); }} style={styles.logoutBtn}>
              Logout
            </button>
          </li>
        </ul>
      </div>
      <div style={styles.main}>
        <header style={styles.header}>
          <div>👋 Welcome, {user?.name || 'User'}</div>
          <div style={styles.headerRight}>
            <span style={{ background: '#e5e7eb', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem' }}>
              {user?.role === 'admin' ? '🔑 Admin' : '👤 Employee'}
            </span>
          </div>
        </header>
        <div style={styles.content}>{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;