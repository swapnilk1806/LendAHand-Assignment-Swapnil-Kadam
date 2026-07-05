import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '../api';
import type { Task } from '../types';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../utils/errorHandler';

interface TaskState {
  list: Task[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  list: [],
  total: 0,
  loading: false,
  error: null,
};

// Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await API.get('/tasks', { params });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/create',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const res = await API.post('/tasks', data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/tasks/${id}`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await API.delete(`/tasks/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err));
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.loading = false;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        toast.error(state.error);
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.total++;
        toast.success('Task created successfully');
      })
      .addCase(createTask.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to create task');
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success('Task updated successfully');
      })
      .addCase(updateTask.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to update task');
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t._id !== action.payload);
        state.total--;
        toast.success('Task deleted');
      })
      .addCase(deleteTask.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to delete task');
      });
  },
});

export default taskSlice.reducer;