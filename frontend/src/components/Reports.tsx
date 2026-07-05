import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCompletedTasks, fetchPendingTasks, fetchEmployeeWiseTasks } from '../slices/reportSlice';
import type { RootState, AppDispatch } from '../store';
import { API } from '../api';
import { styles } from '../styles';

const Reports: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { completed, pending, employeeWise } = useSelector((state: RootState) => state.reports);

  useEffect(() => {
    dispatch(fetchCompletedTasks());
    dispatch(fetchPendingTasks());
    dispatch(fetchEmployeeWiseTasks());
  }, [dispatch]);

  const exportExcel = async () => {
    const res = await API.get('/reports/export/excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.xlsx');
    document.body.appendChild(link);
    link.click();
  };

  const exportCSV = async () => {
    const res = await API.get('/reports/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report.csv');
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div style={styles.page}>
      <h1>📈 Reports</h1>
      <div style={styles.toolbar}>
        <button onClick={exportExcel} style={styles.button}>📊 Export Excel</button>
        <button onClick={exportCSV} style={styles.button}>📄 Export CSV</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={styles.reportCard}>
          <h3>✅ Completed Tasks</h3>
          {completed.length === 0 ? <div style={styles.empty}>No completed tasks</div> : completed.map(t => <div key={t._id} style={styles.reportItem}>{t.title}</div>)}
        </div>
        <div style={styles.reportCard}>
          <h3>⏳ Pending Tasks</h3>
          {pending.length === 0 ? <div style={styles.empty}>No pending tasks</div> : pending.map(t => <div key={t._id} style={styles.reportItem}>{t.title}</div>)}
        </div>
        <div style={styles.reportCard}>
          <h3>👤 Employee Wise</h3>
          {employeeWise.length === 0 ? <div style={styles.empty}>No data</div> : employeeWise.map(emp => <div key={emp._id} style={styles.reportItem}>{emp.name}: <strong>{emp.taskCount}</strong> tasks</div>)}
        </div>
      </div>
    </div>
  );
};

export default Reports;