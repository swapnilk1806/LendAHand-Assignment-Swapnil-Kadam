import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from "@reduxjs/toolkit";
import { API } from '../api';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;

// Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; remember?: boolean }, { dispatch }) => {
    try {
      const res = await API.post('/auth/login', credentials);
      dispatch(setCredentials({ user: res.data.user, token: res.data.token }));
      dispatch(setError(null));
      return res.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      dispatch(setError(message));
      throw new Error(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string; confirmPassword: string; role: string }, { rejectWithValue }) => {
    try {
      const res = await API.post('/auth/register', userData);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/profile',
  async (_, { dispatch }) => {
    try {
      const res = await API.get('/auth/me');
      if (res.data) dispatch(setCredentials({ user: res.data, token: localStorage.getItem('token') || '' }));
      return res.data;
    } catch {
      dispatch(logout());
      throw new Error('Session expired');
    }
  }
);

export default authSlice.reducer;