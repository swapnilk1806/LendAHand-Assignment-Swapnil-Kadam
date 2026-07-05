import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '../api';
import type { Task } from '../types';
import { toast } from 'react-toastify';

interface ReportState {
  completed: Task[];
  pending: Task[];
  employeeWise: any[];
  loading: boolean;
}

const initialState: ReportState = {
  completed: [],
  pending: [],
  employeeWise: [],
  loading: false,
};

export const fetchCompletedTasks = createAsyncThunk(
  'reports/completed',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/reports/completed');
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load completed tasks.';
      return rejectWithValue(message);
    }
  }
);

export const fetchPendingTasks = createAsyncThunk(
  'reports/pending',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/reports/pending');
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load pending tasks.';
      return rejectWithValue(message);
    }
  }
);

export const fetchEmployeeWiseTasks = createAsyncThunk(
  'reports/employeeWise',
  async (_, { rejectWithValue }) => {
    try {
      const res = await API.get('/reports/employee');
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to load employee-wise tasks.';
      return rejectWithValue(message);
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompletedTasks.fulfilled, (state, action) => { state.completed = action.payload; })
      .addCase(fetchCompletedTasks.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to load completed tasks');
      })
      .addCase(fetchPendingTasks.fulfilled, (state, action) => { state.pending = action.payload; })
      .addCase(fetchPendingTasks.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to load pending tasks');
      })
      .addCase(fetchEmployeeWiseTasks.fulfilled, (state, action) => { state.employeeWise = action.payload; })
      .addCase(fetchEmployeeWiseTasks.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to load employee-wise tasks');
      });
  },
});

export default reportSlice.reducer;