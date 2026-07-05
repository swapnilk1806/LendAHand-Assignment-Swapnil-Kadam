import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { loginUser } from '../slices/authSlice';
import type { RootState, AppDispatch } from '../store';
import { loginStyles } from '../styles';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<{
    email: string;
    password: string;
    remember: boolean;
  }>({
    resolver: yupResolver(
      yup.object({
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string().required('Password is required'),
        remember: yup.boolean().default(false),
      })
    ),
    defaultValues: { remember: false },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: { email: string; password: string; remember: boolean }) => {
    try {
      await dispatch(loginUser(data)).unwrap();
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.box}>
        <h2 style={loginStyles.title}>📋 Task Manager</h2>
        <h3 style={loginStyles.subtitle}>Sign In</h3>
        {error && <div style={loginStyles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={loginStyles.field}>
            <label>Email</label>
            <input {...register('email')} type="email" placeholder="admin@example.com" style={loginStyles.input} />
            {errors.email && <span style={loginStyles.fieldError}>{errors.email.message}</span>}
          </div>
          <div style={loginStyles.field}>
            <label>Password</label>
            <input {...register('password')} type="password" placeholder="••••••••" style={loginStyles.input} />
            {errors.password && <span style={loginStyles.fieldError}>{errors.password.message}</span>}
          </div>
          <div style={loginStyles.remember}>
            <label>
              <input {...register('remember')} type="checkbox" /> Remember Me
            </label>
          </div>
          <button type="submit" style={loginStyles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div style={loginStyles.demo}>
          <p>Don't have an account? <Link to="/register" style={{ color: '#3b82f6' }}>Register</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;