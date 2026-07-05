import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { styles } from '../styles';

const Profile: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <div style={styles.page}>
      <h1>👤 Profile</h1>
      <div style={{ maxWidth: '400px', background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div><strong>Name:</strong> {user?.name}</div>
        <div><strong>Email:</strong> {user?.email}</div>
        <div><strong>Role:</strong> {user?.role}</div>
        <div><strong>Department:</strong> {user?.department}</div>
      </div>
    </div>
  );
};

export default Profile;