import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchNotifications, markNotificationRead } from '../slices/notificationSlice';
import type { RootState, AppDispatch } from '../store';
import { styles } from '../styles';

const Notifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { list, unread, loading } = useSelector((state: RootState) => state.notifications);

  const loadNotifications = () => {
    dispatch(fetchNotifications());
  };

  useEffect(() => {
    loadNotifications();
  }, [dispatch]);

  const markRead = async (id: string) => {
    await dispatch(markNotificationRead(id)).unwrap();
    loadNotifications();
  };

  const markAllRead = async () => {
    const unreadIds = list.filter(n => !n.read).map(n => n._id);
    for (const id of unreadIds) {
      await dispatch(markNotificationRead(id)).unwrap();
    }
    loadNotifications();
    toast.success('All notifications marked as read');
  };

  const getIcon = (type: string) => {
    const map: Record<string, string> = {
      task_assigned: '📨',
      task_updated: '🔄',
      task_completed: '✅',
      due_tomorrow: '⏰',
      overdue: '⚠️',
    };
    return map[type] || '📌';
  };

  const getColor = (type: string) => {
    const map: Record<string, string> = {
      task_assigned: '#3b82f6',
      task_updated: '#eab308',
      task_completed: '#22c55e',
      due_tomorrow: '#f59e0b',
      overdue: '#ef4444',
    };
    return map[type] || '#6b7280';
  };

  return (
    <div style={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>🔔 Notifications {unread > 0 && <span style={styles.badge}>{unread}</span>}</h1>
        <div>
          {unread > 0 && <button onClick={markAllRead} style={{ ...styles.smallBtn, background: '#6b7280' }}>Mark All Read</button>}
          <button onClick={loadNotifications} style={{ ...styles.smallBtn, marginLeft: '10px' }}>🔄 Refresh</button>
        </div>
      </div>
      {loading ? (
        <div style={styles.loading}>Loading notifications...</div>
      ) : (
        <div>
          {list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
              <div style={{ fontSize: '3rem' }}>🔕</div>
              <p>No notifications yet</p>
            </div>
          ) : (
            list.map(n => (
              <div key={n._id} style={{ ...styles.notifItem, background: n.read ? '#f9fafb' : '#eff6ff', borderLeft: `4px solid ${getColor(n.type)}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ fontSize: '1.5rem' }}>{getIcon(n.type)}</span>
                  <div>
                    <div style={{ fontWeight: n.read ? 'normal' : 'bold' }}>{n.message}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                {!n.read && <button onClick={() => markRead(n._id)} style={styles.smallBtn}>Mark Read</button>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;