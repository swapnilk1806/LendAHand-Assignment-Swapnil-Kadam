import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Pie, Bar } from 'react-chartjs-2';
import { fetchDashboard } from '../slices/dashboardSlice';
import type { RootState, AppDispatch } from '../store';
import { styles } from '../styles';
import '../chartConfig'; // registers ChartJS

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, recentTasks, recentEmployees, loading } = useSelector((state: RootState) => state.dashboard);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user) dispatch(fetchDashboard());
  }, [dispatch, user]);

  if (loading || !stats) return <div style={styles.loading}>Loading Dashboard...</div>;

  const pieData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [{ data: [stats.pending, stats.inProgress, stats.completed, stats.cancelled], backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171'] }],
  };
  const barData = {
    labels: ['Tasks'],
    datasets: [{ label: 'Total', data: [stats.totalTasks] }, { label: 'Completed', data: [stats.completed] }],
  };

  return (
    <div style={styles.dashboard}>
      <h1 style={{ margin: '0 0 12px 0', fontSize: '1.8rem', fontWeight: '600' }}>📊 Dashboard</h1>
      {user?.role === 'admin' ? (
        <div style={styles.dashboardGrid}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>👥 Employees: <strong>{stats.totalEmployees}</strong></div>
            <div style={styles.statCard}>📌 Tasks: <strong>{stats.totalTasks}</strong></div>
            <div style={styles.statCard}>✅ Completed: <strong>{stats.completed}</strong></div>
            <div style={styles.statCard}>⏳ Pending: <strong>{stats.pending}</strong></div>
            <div style={styles.statCard}>⚠️ Overdue: <strong>{stats.overdue}</strong></div>
          </div>
          <div style={styles.chartsRow}>
            <div style={styles.chartBox}><Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} /></div>
            <div style={styles.chartBox}><Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} /></div>
          </div>
          <div style={styles.recentRow}>
            <div style={styles.recentBox}>
              <h4>📋 Recent Tasks</h4>
              {recentTasks.length === 0 ? <div style={styles.empty}>No tasks yet</div> : recentTasks.map(t => (
                <div key={t._id} style={styles.recentItem}>{t.title} – <span style={{ color: '#6b7280' }}>{t.status}</span></div>
              ))}
            </div>
            <div style={styles.recentBox}>
              <h4>👤 Recent Employees</h4>
              {recentEmployees.length === 0 ? <div style={styles.empty}>No employees</div> : recentEmployees.map(e => (
                <div key={e._id} style={styles.recentItem}>{e.name} <span style={{ color: '#6b7280' }}>({e.email})</span></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div style={styles.dashboardGrid}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>📌 My Tasks: <strong>{stats.totalTasks}</strong></div>
            <div style={styles.statCard}>✅ Completed: <strong>{stats.completed}</strong></div>
            <div style={styles.statCard}>⏳ Pending: <strong>{stats.pending}</strong></div>
            <div style={styles.statCard}>⚠️ Overdue: <strong>{stats.overdue}</strong></div>
          </div>
          <div style={styles.chartsRow}>
            <div style={styles.chartBox}><Pie data={pieData} options={{ plugins: { legend: { position: 'bottom' } } }} /></div>
          </div>
          <div style={styles.recentRow}>
            <div style={styles.recentBox}>
              <h4>📋 Today's Tasks</h4>
              {recentTasks.length === 0 ? <div style={styles.empty}>No tasks</div> : recentTasks.map(t => (
                <div key={t._id} style={styles.recentItem}>{t.title} – Due: {new Date(t.dueDate).toLocaleDateString()}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;