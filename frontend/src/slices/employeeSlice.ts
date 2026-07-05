import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API } from '../api';
import type { User } from '../types';
import { toast } from 'react-toastify';

interface EmployeeState {
  list: User[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  list: [],
  total: 0,
  loading: false,
  error: null,
};

// --- Thunks with error handling ---
export const fetchEmployees = createAsyncThunk(
  'employees/fetch',
  async (params: { page?: number; limit?: number; search?: string; sort?: string }, { rejectWithValue }) => {
    try {
      const res = await API.get('/employees', { params });
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch employees. Please try again.';
      return rejectWithValue(message);
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const res = await API.post('/employees', data);
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to create employee. Please check the data.';
      return rejectWithValue(message);
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, data }: { id: string; data: FormData }, { rejectWithValue }) => {
    try {
      const res = await API.put(`/employees/${id}`, data);
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update employee.';
      return rejectWithValue(message);
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await API.delete(`/employees/${id}`);
      return id;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete employee.';
      return rejectWithValue(message);
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.list = action.payload.data;
        state.total = action.payload.total;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch employees';
        toast.error(state.error);
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.push(action.payload);
        state.total++;
        toast.success('Employee created');
      })
      .addCase(createEmployee.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to create employee');
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex(e => e._id === action.payload._id);
        if (idx !== -1) state.list[idx] = action.payload;
        toast.success('Employee updated');
      })
      .addCase(updateEmployee.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to update employee');
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter(e => e._id !== action.payload);
        state.total--;
        toast.success('Employee deleted');
      })
      .addCase(deleteEmployee.rejected, (_, action) => {
        toast.error(action.payload as string || 'Failed to delete employee');
      });
  },
});

export default employeeSlice.reducer;