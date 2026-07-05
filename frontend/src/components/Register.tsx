import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { registerUser } from '../slices/authSlice';
import type { RootState, AppDispatch } from '../store';
import { loginStyles } from '../styles';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm<{
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'admin' | 'employee';
  }>({
    resolver: yupResolver(
      yup.object({
        name: yup.string().required('Full name is required'),
        email: yup.string().email('Invalid email').required('Email is required'),
        password: yup.string()
          .min(8, 'Password must be at least 8 characters')
          .matches(/[A-Z]/, 'Must contain an uppercase letter')
          .matches(/[a-z]/, 'Must contain a lowercase letter')
          .matches(/[0-9]/, 'Must contain a number')
          .required('Password is required'),
        confirmPassword: yup.string()
          .oneOf([yup.ref('password'), undefined], 'Passwords must match')
          .required('Confirm password is required'),
        role: yup.string().oneOf(['admin', 'employee']).required('Role is required'),
      })
    ),
  });

  const onSubmit = async (data: { name: string; email: string; password: string; confirmPassword: string; role: 'admin' | 'employee' }) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err || 'Registration failed');
    }
  };

  return (
    <div style={loginStyles.container}>
      <div style={loginStyles.box}>
        <h2 style={loginStyles.title}>📋 Task Manager</h2>
        <h3 style={loginStyles.subtitle}>Create Account</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={loginStyles.field}>
            <label>Full Name</label>
            <input {...register('name')} type="text" placeholder="John Doe" style={loginStyles.input} />
            {errors.name && <span style={loginStyles.fieldError}>{errors.name.message}</span>}
          </div>
          <div style={loginStyles.field}>
            <label>Email</label>
            <input {...register('email')} type="email" placeholder="john@example.com" style={loginStyles.input} />
            {errors.email && <span style={loginStyles.fieldError}>{errors.email.message}</span>}
          </div>
          <div style={loginStyles.field}>
            <label>Password</label>
            <input {...register('password')} type="password" placeholder="••••••••" style={loginStyles.input} />
            {errors.password && <span style={loginStyles.fieldError}>{errors.password.message}</span>}
          </div>
          <div style={loginStyles.field}>
            <label>Confirm Password</label>
            <input {...register('confirmPassword')} type="password" placeholder="••••••••" style={loginStyles.input} />
            {errors.confirmPassword && <span style={loginStyles.fieldError}>{errors.confirmPassword.message}</span>}
          </div>
          <div style={loginStyles.field}>
            <label>Role</label>
            <select {...register('role')} style={loginStyles.input}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && <span style={loginStyles.fieldError}>{errors.role.message}</span>}
          </div>
          <button type="submit" style={loginStyles.button} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <div style={loginStyles.demo}>
          <p>Already have an account? <Link to="/login" style={{ color: '#3b82f6' }}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;