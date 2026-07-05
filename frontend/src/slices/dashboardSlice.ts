import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '../api';
import type { Task, User } from '../types';
import { toast } from 'react-toastify';

interface DashboardState {
  stats: any;
  chartData: any;
  recentTasks: Task[];
  recentEmployees: User[];
  loading: boolean;
}

const initialState: DashboardState = {
  stats: null,
  chartData: null,
  recentTasks: [],
  recentEmployees: [],
  loading: false,
};

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/dashboard');
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load dashboard data.';
      return rejectWithValue(message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.chartData = action.payload.chartData;
        state.recentTasks = action.payload.recentTasks;
        state.recentEmployees = action.payload.recentEmployees;
        state.loading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload as string || 'Failed to load dashboard');
      });
  },
});

export default dashboardSlice.reducer;