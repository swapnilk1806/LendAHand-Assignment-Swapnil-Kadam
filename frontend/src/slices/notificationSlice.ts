import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '../api';
import type { Notification } from '../types';
import { toast } from 'react-toastify';

interface NotificationState {
  list: Notification[];
  unread: number;
  loading: boolean;
}

const initialState: NotificationState = {
  list: [],
  unread: 0,
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/notifications');
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load notifications.';
      return rejectWithValue(message);
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await API.put(`/notifications/${id}`);
      return id;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to mark notification as read.';
      return rejectWithValue(message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.unread = action.payload.unread;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload as string || 'Failed to fetch notifications');
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notif = state.list.find(n => n._id === action.payload);
        if (notif) notif.read = true;
        state.unread = state.list.filter(n => !n.read).length;
      })
      .addCase(markNotificationRead.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to mark as read');
      });
  },
});

export default notificationSlice.reducer;